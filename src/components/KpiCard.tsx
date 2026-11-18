import type { Kpi } from "../types";
import { formatByUnit } from "../lib/format";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const positive = kpi.delta >= 0;

  return (
    <article className="kpi" aria-labelledby={`kpi-${kpi.id}`}>
      <p className="kpi__label" id={`kpi-${kpi.id}`}>
        {kpi.label}
      </p>
      <p className="kpi__value">{formatByUnit(kpi.value, kpi.unit)}</p>
      <p className={`kpi__delta ${positive ? "is-up" : "is-down"}`}>
        <span aria-hidden="true">{positive ? "▲" : "▼"}</span>
        <span>{Math.abs(kpi.delta).toFixed(1).replace(".", ",")} %</span>
        <span className="kpi__hint">{kpi.hint}</span>
      </p>
    </article>
  );
}
