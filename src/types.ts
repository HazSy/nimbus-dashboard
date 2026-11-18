export type RangeKey = "7d" | "30d" | "90d";

export type Channel = "Web" | "Marketplace" | "Tienda física" | "Suscripción";

export interface Kpi {
  id: string;
  label: string;
  value: number;
  unit: "currency" | "number" | "percent";
  delta: number;
  hint: string;
}

export interface DailyPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ChannelShare {
  channel: Channel;
  revenue: number;
  share: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  units: number;
  revenue: number;
  stock: number;
  trend: number;
}

export interface DashboardData {
  range: RangeKey;
  generatedAt: string;
  kpis: Kpi[];
  series: DailyPoint[];
  channels: ChannelShare[];
  products: Product[];
}
