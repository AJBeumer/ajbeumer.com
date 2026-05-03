import { describe, it, expect } from "vitest";
import { cmdCountry } from "@/lib/commands/system";
import { createMockContext } from "../helpers/mockContext";

describe("COUNTRY", () => {
  it("shows current locale and WIP status with no args", () => {
    const ctx = createMockContext({ args: [] });
    const result = cmdCountry(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const localeLine = lines.find((l) => l.text?.includes("EN"));
    expect(localeLine).toBeDefined();
    const wipLine = lines.find((l) => l.text?.toLowerCase().includes("work in progress"));
    expect(wipLine).toBeDefined();
  });

  it("acknowledges a locale code and shows WIP status", () => {
    const ctx = createMockContext({ args: ["es"] });
    const result = cmdCountry(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const localeLine = lines.find((l) => l.text?.includes("ES"));
    expect(localeLine).toBeDefined();
    const wipLine = lines.find((l) => l.text?.toLowerCase().includes("not yet implemented"));
    expect(wipLine).toBeDefined();
  });

  it("uppercases the locale code in output", () => {
    const ctx = createMockContext({ args: ["de"] });
    const result = cmdCountry(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const localeLine = lines.find((l) => l.text?.includes("DE"));
    expect(localeLine).toBeDefined();
  });

  it("includes a future localization note", () => {
    const ctx = createMockContext({ args: [] });
    const result = cmdCountry(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const noteLine = lines.some((l) => l.text?.toLowerCase().includes("planned") || l.text?.toLowerCase().includes("future"));
    expect(noteLine).toBe(true);
  });
});
