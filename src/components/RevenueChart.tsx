import { useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { DailyPoint } from "../types";
import { formatCompact, formatCurrency, formatShortDate } from "../lib/format";

const W = 720;
const H = 280;
const PAD = { top: 18, right: 16, bottom: 30, left: 52 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

interface Props {
  points: DailyPoint[];
}

/**
 * Gráfico de área en SVG puro: sin librerías de charting.
 * Incluye tooltip con teclado y una tabla equivalente para lectores de pantalla.
 */
export function RevenueChart({ points }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const { path, area, max, min, ticks } = useMemo(() => {
    const values = points.map((p) => p.revenue);
    const rawMax = Math.max(...values, 1);
    const rawMin = Math.min(...values);
    const niceMax = Math.ceil((rawMax * 1.12) / 500) * 500;
    const niceMin = Math.max(0, Math.floor((rawMin * 0.85) / 500) * 500);

    const x = (i: number) => (points.length === 1 ? 0 : (i / (points.length - 1)) * INNER_W);
    const y = (value: number) => INNER_H - ((value - niceMin) / (niceMax - niceMin || 1)) * INNER_H;

    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.revenue).toFixed(1)}`).join(" ");
    const areaPath = `${line} L${INNER_W},${INNER_H} L0,${INNER_H} Z`;

    const tickValues = [0, 0.25, 0.5, 0.75, 1].map((t) => niceMin + (niceMax - niceMin) * t);

    return {
      path: line,
      area: areaPath,
      max: niceMax,
      min: niceMin,
      ticks: tickValues,
      x,
      y,
    };
  }, [points]);

  const geometry = useMemo(() => {
    const x = (i: number) => (points.length === 1 ? 0 : (i / (points.length - 1)) * INNER_W);
    const y = (value: number) => INNER_H - ((value - min) / (max - min || 1)) * INNER_H;
    return { x, y };
  }, [points.length, min, max]);

  if (points.length === 0) {
    return <p className="muted">Sin datos para el periodo seleccionado.</p>;
  }

  const activePoint = active !== null ? points[active] : null;
  const total = points.reduce((sum, p) => sum + p.revenue, 0);

  function onMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = ((event.clientX - rect.left) / rect.width) * W - PAD.left;
    const index = Math.round((relative / INNER_W) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, index)));
  }

  function onKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    setActive((current) => {
      const next = (current ?? points.length - 1) + (event.key === "ArrowRight" ? 1 : -1);
      return Math.min(points.length - 1, Math.max(0, next));
    });
  }

  return (
    <figure className="chart">
      <figcaption className="chart__head">
        <div>
          <h2 id="revenue-title">Ingresos por día</h2>
          <p className="muted">
            {formatCurrency(total)} en total · {points.length} días
          </p>
        </div>
        <div className="chart__legend">
          <span className="legend-dot" aria-hidden="true" /> Ingresos
        </div>
      </figcaption>

      <div className="chart__canvas">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="revenue-title"
          tabIndex={0}
          onMouseMove={onMove}
          onMouseLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.42" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {ticks.map((tick) => {
              const yPos = geometry.y(tick);
              return (
                <g key={tick}>
                  <line className="grid-line" x1={0} x2={INNER_W} y1={yPos} y2={yPos} />
                  <text className="axis-label" x={-10} y={yPos + 4} textAnchor="end">
                    {formatCompact(tick)} €
                  </text>
                </g>
              );
            })}

            <path d={area} fill="url(#revenue-fill)" />
            <path d={path} className="line" fill="none" />

            {activePoint && active !== null && (
              <>
                <line
                  className="cursor-line"
                  x1={geometry.x(active)}
                  x2={geometry.x(active)}
                  y1={0}
                  y2={INNER_H}
                />
                <circle
                  cx={geometry.x(active)}
                  cy={geometry.y(activePoint.revenue)}
                  r={5}
                  className="dot"
                />
              </>
            )}

            {points.map((point, i) => {
              const show = points.length <= 12 || i % Math.ceil(points.length / 6) === 0;
              if (!show) return null;
              return (
                <text
                  key={point.date}
                  className="axis-label"
                  x={geometry.x(i)}
                  y={INNER_H + 20}
                  textAnchor="middle"
                >
                  {formatShortDate(point.date)}
                </text>
              );
            })}
          </g>
        </svg>

        {activePoint && active !== null && (
          <div
            className="tooltip"
            style={{ left: `${((geometry.x(active) + PAD.left) / W) * 100}%` }}
            role="status"
          >
            <strong>{formatShortDate(activePoint.date)}</strong>
            <span>{formatCurrency(activePoint.revenue)}</span>
            <span className="muted">{activePoint.orders} pedidos</span>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Ingresos diarios del periodo</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Ingresos</th>
            <th scope="col">Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <td>{point.date}</td>
              <td>{formatCurrency(point.revenue)}</td>
              <td>{point.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
