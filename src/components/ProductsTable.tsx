import { useMemo, useState } from "react";
import type { Product } from "../types";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";

type SortKey = "name" | "units" | "revenue" | "stock" | "trend";

const COLUMNS: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
  { key: "name", label: "Producto" },
  { key: "units", label: "Unidades", numeric: true },
  { key: "revenue", label: "Ingresos", numeric: true },
  { key: "stock", label: "Stock", numeric: true },
  { key: "trend", label: "Variación", numeric: true },
];

interface Props {
  products: Product[];
}

export function ProductsTable({ products }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "revenue",
    direction: "desc",
  });

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.category.toLowerCase().includes(needle),
        )
      : products;

    return [...filtered].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      const result =
        typeof left === "string" && typeof right === "string"
          ? left.localeCompare(right, "es")
          : Number(left) - Number(right);
      return sort.direction === "asc" ? result : -result;
    });
  }, [products, query, sort]);

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" ? "asc" : "desc" },
    );
  }

  return (
    <section className="panel" aria-labelledby="products-title">
      <header className="panel__head panel__head--row">
        <div>
          <h2 id="products-title">Productos</h2>
          <p className="muted">{rows.length} de {products.length} productos</p>
        </div>
        <label className="search">
          <span className="sr-only">Buscar producto o categoría</span>
          <input
            type="search"
            placeholder="Buscar producto o categoría…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sort.key === column.key
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={column.numeric ? "is-numeric" : undefined}
                >
                  <button type="button" className="th-button" onClick={() => toggleSort(column.key)}>
                    {column.label}
                    <span aria-hidden="true" className="th-arrow">
                      {sort.key === column.key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr key={product.id}>
                <td>
                  <span className="product-name">{product.name}</span>
                  <span className="product-category">{product.category}</span>
                </td>
                <td className="is-numeric">{formatNumber(product.units)}</td>
                <td className="is-numeric">{formatCurrency(product.revenue)}</td>
                <td className="is-numeric">
                  <span className={`pill ${product.stock < 30 ? "pill--warn" : ""}`}>
                    {product.stock} u.
                  </span>
                </td>
                <td className={`is-numeric ${product.trend >= 0 ? "is-up" : "is-down"}`}>
                  {product.trend >= 0 ? "+" : "−"}
                  {formatPercent(Math.abs(product.trend))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="empty" role="status">
            No hay productos que coincidan con «{query}».
          </p>
        )}
      </div>
    </section>
  );
}
