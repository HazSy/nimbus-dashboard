import { afterEach, describe, expect, it } from "vitest";
import { fetchDashboard, RANGE_DAYS } from "./api";

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("fetchDashboard", () => {
  it("devuelve tantos puntos como días tiene el rango", async () => {
    const data = await fetchDashboard("30d");
    expect(data.series).toHaveLength(RANGE_DAYS["30d"]);
    expect(data.kpis).toHaveLength(6);
    expect(data.products.length).toBeGreaterThan(0);
  });

  it("reparte el 100 % entre los canales", async () => {
    const data = await fetchDashboard("7d");
    const total = data.channels.reduce((sum, channel) => sum + channel.share, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it("es determinista para el mismo rango", async () => {
    const first = await fetchDashboard("7d");
    const second = await fetchDashboard("7d");
    expect(first.series).toEqual(second.series);
  });

  it("permite simular un error con ?error=1", async () => {
    window.history.replaceState({}, "", "/?error=1");
    await expect(fetchDashboard("7d")).rejects.toThrow(/error simulado/);
  });

  it("se cancela con AbortSignal", async () => {
    const controller = new AbortController();
    const promise = fetchDashboard("90d", controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
