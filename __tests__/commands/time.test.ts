import { describe, it, expect } from "vitest";
import { cmdTime } from "@/lib/commands/system";

describe("TIME", () => {
  it("returns output lines with the current time", () => {
    const result = cmdTime();
    const lines = Array.isArray(result) ? result : [result];
    const textLine = lines.find((l) => l.type === "output" && l.text?.includes("Current time:"));
    expect(textLine).toBeDefined();
  });

  it("includes a time-like string (colon-separated digits)", () => {
    const result = cmdTime();
    const lines = Array.isArray(result) ? result : [result];
    const textLine = lines.find((l) => l.type === "output" && l.text?.includes("Current time:"));
    // Matches HH:MM or HH:MM:SS pattern
    expect(textLine?.text).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns blank lines as padding", () => {
    const result = cmdTime();
    const lines = Array.isArray(result) ? result : [result];
    const blanks = lines.filter((l) => l.type === "output" && (l.text === "" || l.text === undefined));
    expect(blanks.length).toBeGreaterThanOrEqual(2);
  });
});
