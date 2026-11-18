import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProductsTable } from "./ProductsTable";
import type { Product } from "../types";

const products: Product[] = [
  { id: "1", name: "Teclado K7", category: "Periféricos", price: 89, units: 120, revenue: 10680, stock: 12, trend: 4.2 },
  { id: "2", name: "Monitor UltraWide", category: "Pantallas", price: 449, units: 40, revenue: 17960, stock: 80, trend: -2.1 },
  { id: "3", name: "Auriculares Pulse", category: "Audio", price: 129, units: 300, revenue: 38700, stock: 5, trend: 12.5 },
];

const names = () =>
  screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[0]!.textContent ?? "");

describe("ProductsTable", () => {
  it("ordena por ingresos descendente por defecto", () => {
    render(<ProductsTable products={products} />);
    expect(names()[0]).toContain("Auriculares Pulse");
  });

  it("cambia el orden al pulsar una columna", async () => {
    const user = userEvent.setup();
    render(<ProductsTable products={products} />);

    await user.click(screen.getByRole("button", { name: /producto/i }));
    expect(names()[0]).toContain("Auriculares Pulse");

    await user.click(screen.getByRole("button", { name: /producto/i }));
    expect(names()[0]).toContain("Teclado K7");

    const header = screen.getByRole("columnheader", { name: /unidades/i });
    expect(header).toHaveAttribute("aria-sort", "none");
  });

  it("filtra por nombre o categoría", async () => {
    const user = userEvent.setup();
    render(<ProductsTable products={products} />);

    await user.type(screen.getByRole("searchbox"), "audio");
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Auriculares Pulse")).toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByRole("status")).toHaveTextContent(/no hay productos/i);
  });

  it("marca el stock bajo", () => {
    render(<ProductsTable products={products} />);
    const lowStock = screen.getByText("5 u.");
    expect(lowStock).toHaveClass("pill--warn");
  });

  it("ordena por unidades ascendente tras dos clics", async () => {
    const user = userEvent.setup();
    render(<ProductsTable products={products} />);
    const button = screen.getByRole("button", { name: /unidades/i });

    await user.click(button);
    expect(names()[0]).toContain("Auriculares Pulse");

    await user.click(button);
    expect(names()[0]).toContain("Monitor UltraWide");
  });
});
