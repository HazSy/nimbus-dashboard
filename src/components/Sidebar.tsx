import type { RangeKey } from "../types";

const NAV = [
  { icon: "◈", label: "Resumen", active: true },
  { icon: "▤", label: "Ventas", active: false },
  { icon: "◍", label: "Clientes", active: false },
  { icon: "▦", label: "Productos", active: false },
  { icon: "⚙", label: "Ajustes", active: false },
] as const;

interface Props {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
}

const RANGES: Array<{ key: RangeKey; label: string }> = [
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
];

export function Sidebar({ range, onRangeChange }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true">
          N
        </span>
        <span className="brand__name">Nimbus</span>
      </div>

      <nav aria-label="Secciones">
        <ul className="nav">
          {NAV.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className="nav__item"
                aria-current={item.active ? "page" : undefined}
                disabled={!item.active}
                title={item.active ? undefined : "Disponible en la versión completa"}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <p className="eyebrow">Periodo</p>
        <div className="segmented" role="group" aria-label="Rango de fechas">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              className="segmented__item"
              aria-pressed={range === option.key}
              onClick={() => onRangeChange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="sidebar__note">
          Datos de demostración generados en el navegador. Sin backend.
        </p>
      </div>
    </aside>
  );
}
