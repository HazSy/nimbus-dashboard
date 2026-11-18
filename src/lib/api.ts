import type { ChannelShare, DailyPoint, DashboardData, Kpi, Product, RangeKey } from "../types";

/**
 * Capa de datos de mentira, pero con la misma forma que tendría una API real:
 * promesa cancelable, latencia y error reproducible.
 *
 * Para conectar un backend basta con cambiar `fetchDashboard` por un `fetch()`
 * a `/api/dashboard?range=...` manteniendo el tipo `DashboardData`.
 */

export const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** PRNG determinista: los gráficos no cambian entre renders ni recargas. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRODUCTS: Array<Omit<Product, "units" | "revenue" | "trend" | "stock">> = [
  { id: "p1", name: "Auriculares Pulse Pro", category: "Audio", price: 129 },
  { id: "p2", name: "Teclado Mecánico K7", category: "Periféricos", price: 89 },
  { id: "p3", name: "Monitor UltraWide 34\"", category: "Pantallas", price: 449 },
  { id: "p4", name: "Ratón Ergo Lite", category: "Periféricos", price: 39 },
  { id: "p5", name: "Webcam Studio 4K", category: "Vídeo", price: 159 },
  { id: "p6", name: "Hub USB-C 8 en 1", category: "Accesorios", price: 59 },
  { id: "p7", name: "Soporte de monitor", category: "Accesorios", price: 79 },
  { id: "p8", name: "Altavoces Beam Mini", category: "Audio", price: 69 },
];

const CHANNELS: ChannelShare["channel"][] = ["Web", "Marketplace", "Tienda física", "Suscripción"];

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function buildSeries(days: number, random: () => number): DailyPoint[] {
  const points: DailyPoint[] = [];
  let base = 1800;

  for (let i = days - 1; i >= 0; i--) {
    const weekday = new Date(`${isoDaysAgo(i)}T12:00:00`).getDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.22 : 1;
    const growth = 1 + (days - i) * 0.004; // tendencia suave al alza
    const noise = 0.82 + random() * 0.36;

    base = base * 0.995 + 40;
    const revenue = Math.round(base * weekendBoost * growth * noise);
    points.push({
      date: isoDaysAgo(i),
      revenue,
      orders: Math.round(revenue / (72 + random() * 26)),
    });
  }
  return points;
}

function buildProducts(random: () => number): Product[] {
  return PRODUCTS.map((product) => {
    const units = Math.round(40 + random() * 460);
    return {
      ...product,
      units,
      revenue: units * product.price,
      stock: Math.round(random() * 240),
      trend: Math.round((random() * 34 - 12) * 10) / 10,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

function buildChannels(series: DailyPoint[], random: () => number): ChannelShare[] {
  const total = series.reduce((sum, point) => sum + point.revenue, 0);
  const weights = [0.46, 0.24, 0.18, 0.12].map((w) => w * (0.9 + random() * 0.2));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  return CHANNELS.map((channel, i) => ({
    channel,
    revenue: Math.round((total * weights[i]!) / weightSum),
    share: Math.round(((weights[i]! / weightSum) * 100 + Number.EPSILON) * 10) / 10,
  }));
}

function buildKpis(series: DailyPoint[], products: Product[], random: () => number): Kpi[] {
  const revenue = series.reduce((sum, point) => sum + point.revenue, 0);
  const orders = series.reduce((sum, point) => sum + point.orders, 0);
  const ticket = revenue / Math.max(orders, 1);
  const conversion = 2.4 + random() * 1.8;
  const returning = 38 + random() * 12;
  const topUnits = products.reduce((sum, p) => sum + p.units, 0);

  return [
    { id: "revenue", label: "Ingresos", value: revenue, unit: "currency", delta: 12.4, hint: "vs. periodo anterior" },
    { id: "orders", label: "Pedidos", value: orders, unit: "number", delta: 8.1, hint: "vs. periodo anterior" },
    { id: "ticket", label: "Ticket medio", value: Math.round(ticket), unit: "currency", delta: 3.6, hint: "vs. periodo anterior" },
    { id: "conversion", label: "Tasa de conversión", value: conversion, unit: "percent", delta: -1.8, hint: "vs. periodo anterior" },
    { id: "returning", label: "Clientes recurrentes", value: returning, unit: "percent", delta: 5.2, hint: "vs. periodo anterior" },
    { id: "units", label: "Unidades vendidas", value: topUnits, unit: "number", delta: 6.9, hint: "vs. periodo anterior" },
  ];
}

export async function fetchDashboard(range: RangeKey, signal?: AbortSignal): Promise<DashboardData> {
  const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
  if (params.get("error") === "1") {
    throw new Error("No se pudo conectar con el servidor de analítica (error simulado).");
  }

  const days = RANGE_DAYS[range];
  const random = mulberry32(days * 7919);

  // Latencia simulada, cancelable como lo sería una petición real.
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 220 + random() * 280);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Petición cancelada", "AbortError"));
    });
  });

  const series = buildSeries(days, random);
  const products = buildProducts(random);

  return {
    range,
    generatedAt: new Date().toISOString(),
    kpis: buildKpis(series, products, random),
    series,
    channels: buildChannels(series, random),
    products,
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
