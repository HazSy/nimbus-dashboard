import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { KpiCard } from "./components/KpiCard";
import { RevenueChart } from "./components/RevenueChart";
import { ChannelBreakdown } from "./components/ChannelBreakdown";
import { ProductsTable } from "./components/ProductsTable";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { ErrorState } from "./components/ErrorState";
import { useDashboard } from "./hooks/useDashboard";
import { useTheme } from "./hooks/useTheme";
import type { RangeKey } from "./types";

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "últimos 7 días",
  "30d": "últimos 30 días",
  "90d": "últimos 90 días",
};

export default function App() {
  const [range, setRange] = useState<RangeKey>("30d");
  const { data, loading, error, retry } = useDashboard(range);
  const { theme, toggle } = useTheme();

  return (
    <div className="layout">
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>

      <Sidebar range={range} onRangeChange={setRange} />

      <div className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Panel de ventas</p>
            <h1>Resumen · {RANGE_LABEL[range]}</h1>
            {data && (
              <p className="muted small">
                Actualizado a las{" "}
                {new Intl.DateTimeFormat("es-ES", { timeStyle: "short" }).format(
                  new Date(data.generatedAt),
                )}{" "}
                · {loading ? "actualizando…" : "datos al día"}
              </p>
            )}
          </div>

          <div className="topbar__actions">
            <a className="topbar__back" href="../../">
              <span aria-hidden="true">←</span> Portfolio
            </a>
            <button
              type="button"
              className="icon-button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
              title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </header>

        <main id="main" className="main">
          {error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : !data ? (
            <DashboardSkeleton />
          ) : (
            <div className="stack">
              <div className="kpi-grid">
                {data.kpis.map((kpi) => (
                  <KpiCard key={kpi.id} kpi={kpi} />
                ))}
              </div>

              <div className="grid-2">
                <section className="panel" aria-labelledby="revenue-title">
                  <RevenueChart points={data.series} />
                </section>
                <ChannelBreakdown channels={data.channels} />
              </div>

              <ProductsTable products={data.products} />

              <footer className="footer">
                <p>
                  Nimbus · demo de panel analítico con React + TypeScript. Datos simulados en el
                  cliente.
                </p>
              </footer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
