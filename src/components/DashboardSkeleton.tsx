export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="stack">
      <span className="sr-only">Cargando métricas…</span>

      <div className="kpi-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="kpi kpi--skeleton" key={i}>
            <span className="skeleton skeleton--line" style={{ width: "45%" }} />
            <span className="skeleton skeleton--title" style={{ width: "70%" }} />
            <span className="skeleton skeleton--line" style={{ width: "35%" }} />
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel panel--skeleton">
          <span className="skeleton skeleton--title" style={{ width: "40%" }} />
          <span className="skeleton skeleton--chart" />
        </div>
        <div className="panel panel--skeleton">
          <span className="skeleton skeleton--title" style={{ width: "50%" }} />
          {Array.from({ length: 4 }, (_, i) => (
            <span className="skeleton skeleton--line" key={i} style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
