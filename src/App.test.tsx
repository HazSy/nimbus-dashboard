import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { DashboardData } from "./types";

const sample: DashboardData = {
  range: "30d",
  generatedAt: "2026-11-18T10:00:00.000Z",
  kpis: [
    { id: "revenue", label: "Ingresos", value: 52300, unit: "currency", delta: 12.4, hint: "vs. periodo anterior" },
    { id: "orders", label: "Pedidos", value: 640, unit: "number", delta: -2.1, hint: "vs. periodo anterior" },
  ],
  series: [
    { date: "2026-11-17", revenue: 2100, orders: 28 },
    { date: "2026-11-18", revenue: 2600, orders: 33 },
  ],
  channels: [
    { channel: "Web", revenue: 30000, share: 60 },
    { channel: "Tienda física", revenue: 20000, share: 40 },
  ],
  products: [
    { id: "p1", name: "Auriculares Pulse Pro", category: "Audio", price: 129, units: 100, revenue: 12900, stock: 12, trend: 4.2 },
  ],
};

vi.mock("./lib/api", async () => {
  const actual = await vi.importActual<typeof import("./lib/api")>("./lib/api");
  return { ...actual, fetchDashboard: vi.fn() };
});

const { fetchDashboard } = await import("./lib/api");
const mocked = vi.mocked(fetchDashboard);

beforeEach(() => {
  mocked.mockReset();
  window.localStorage.clear();
});

describe("App", () => {
  it("muestra el esqueleto y después los datos", async () => {
    mocked.mockResolvedValue(sample);
    render(<App />);

    expect(screen.getByText(/cargando métricas/i)).toBeInTheDocument();

    expect(await screen.findByText("Auriculares Pulse Pro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /resumen · últimos 30 días/i })).toBeInTheDocument();
  });

  it("pide los datos del rango seleccionado", async () => {
    mocked.mockResolvedValue(sample);
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Auriculares Pulse Pro");
    await user.click(screen.getByRole("button", { name: "7 días" }));

    await waitFor(() => expect(mocked).toHaveBeenLastCalledWith("7d", expect.any(AbortSignal)));
    expect(await screen.findByText(/últimos 7 días/i)).toBeInTheDocument();
  });

  it("muestra el error y permite reintentar", async () => {
    mocked.mockRejectedValueOnce(new Error("Fallo de red"));
    mocked.mockResolvedValueOnce(sample);

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Fallo de red");
    await user.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(await screen.findByText("Auriculares Pulse Pro")).toBeInTheDocument();
  });

  it("cambia el tema y lo recuerda", async () => {
    mocked.mockResolvedValue(sample);
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Auriculares Pulse Pro");
    const toggle = screen.getByRole("button", { name: /tema/i });
    await user.click(toggle);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("nimbus-theme")).toBe("light");
  });
});
