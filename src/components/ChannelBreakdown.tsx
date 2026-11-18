import type { ChannelShare } from "../types";
import { formatCurrency, formatPercent } from "../lib/format";

export function ChannelBreakdown({ channels }: { channels: ChannelShare[] }) {
  if (!channels.length) return <p className="muted">Sin canales que mostrar.</p>;

  return (
    <section className="panel" aria-labelledby="channels-title">
      <header className="panel__head">
        <h2 id="channels-title">Canales de venta</h2>
        <p className="muted">Reparto de ingresos en el periodo</p>
      </header>

      <ul className="channels">
        {channels.map((item) => (
          <li key={item.channel} className="channel">
            <div className="channel__row">
              <span className="channel__name">{item.channel}</span>
              <span className="channel__value">{formatCurrency(item.revenue)}</span>
            </div>
            <div
              className="bar"
              role="progressbar"
              aria-valuenow={item.share}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.channel}: ${formatPercent(item.share)}`}
            >
              <span style={{ width: `${item.share}%` }} />
            </div>
            <span className="channel__share">{formatPercent(item.share)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
