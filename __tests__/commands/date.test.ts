import { describe, it, expect } from "vitest";
import { cmdDate } from "@/lib/commands/system";
import { createMockContext } from "../helpers/mockContext";

describe("DATE", () => {
  it("returns output lines with the current date", () => {
    const ctx = createMockContext();
    const result = cmdDate();
    const lines = Array.isArray(result) ? result : [result];
    const textLine = lines.find((l) => l.type === "output" && l.text?.includes("Current date:"));
    expect(textLine).toBeDefined();
  });

  it("includes a recognizable date format", () => {
    const ctx = createMockContext();
    const result = cmdDate();
    const lines = Array.isArray(result) ? result : [result];
    const textLine = lines.find((l) => l.type === "output" && l.text?.includes("Current date:"));
    // Should contain the 4-digit year
    const year = new Date().getFullYear().toString();
    expect(textLine?.text).toContain(year);
  });

  it("returns blank lines as padding", () => {
    const result = cmdDate();
    const lines = Array.isArray(result) ? result : [result];
    const blanks = lines.filter((l) => l.type === "output" && (l.text === "" || l.text === undefined));
    expect(blanks.length).toBeGreaterThanOrEqual(2);
  });
});
