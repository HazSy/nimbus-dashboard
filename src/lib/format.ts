const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("es-ES", { notation: "compact" });

export const formatCurrency = (value: number): string => currency.format(value);

export const formatCompact = (value: number): string => compact.format(value);

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("es-ES").format(value);

export const formatPercent = (value: number, digits = 1): string =>
  `${value.toFixed(digits).replace(".", ",")} %`;

/** 2026-11-18 → "18 nov" */
export function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(date);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Valor ya formateado según la unidad que pida el KPI. */
export function formatByUnit(value: number, unit: "currency" | "number" | "percent"): string {
  if (unit === "currency") return formatCurrency(value);
  if (unit === "percent") return formatPercent(value);
  return formatNumber(value);
}
