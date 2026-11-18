import { describe, expect, it } from "vitest";
import {
  formatByUnit,
  formatCompact,
  formatCurrency,
  formatPercent,
  formatShortDate,
} from "./format";

describe("formato", () => {
  it("formatea euros en español", () => {
    expect(formatCurrency(1234)).toContain("€");
    expect(formatCurrency(1234)).toContain("1234");
    // En español los números de 4 cifras no llevan separador de millares.
    expect(formatCurrency(123456)).toMatch(/123\.456/);
  });

  it("usa el separador decimal español en porcentajes", () => {
    expect(formatPercent(12.34)).toBe("12,3 %");
  });

  it("abrevia números grandes", () => {
    expect(formatCompact(12500)).toMatch(/mil/);
  });

  it("elige el formato según la unidad", () => {
    expect(formatByUnit(50, "percent")).toBe("50,0 %");
    expect(formatByUnit(1500, "currency")).toMatch(/€/);
    expect(formatByUnit(12345, "number")).toBe("12.345");
  });

  it("acorta fechas ISO", () => {
    expect(formatShortDate("2026-11-18")).toMatch(/18/);
  });
});
