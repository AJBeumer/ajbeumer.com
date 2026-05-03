import { describe, it, expect, vi } from "vitest";
import { cmdMode } from "@/lib/commands/system";
import { createMockContext } from "../helpers/mockContext";

describe("MODE", () => {
  it("shows current mode and usage when called with no args", () => {
    const ctx = createMockContext({ theme: "dark" });
    const result = cmdMode(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const modeLine = lines.find((l) => l.text?.includes("Current mode:"));
    expect(modeLine).toBeDefined();
    expect(modeLine?.text).toContain("DARK");
  });

  it("shows LIGHT as current mode when theme is light", () => {
    const ctx = createMockContext({ theme: "light" });
    const result = cmdMode(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const modeLine = lines.find((l) => l.text?.includes("Current mode:"));
    expect(modeLine?.text).toContain("LIGHT");
  });

  it("calls setTheme('light') when 'light' arg is given", () => {
    const setTheme = vi.fn();
    const ctx = createMockContext({ args: ["light"], theme: "dark", setTheme });
    cmdMode(ctx);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("calls setTheme('dark') when 'dark' arg is given", () => {
    const setTheme = vi.fn();
    const ctx = createMockContext({ args: ["dark"], theme: "light", setTheme });
    cmdMode(ctx);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("is case-insensitive for the mode argument", () => {
    const setTheme = vi.fn();
    const ctx = createMockContext({ args: ["LIGHT"], theme: "dark", setTheme });
    cmdMode(ctx);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("returns an error for an unrecognized mode argument", () => {
    const ctx = createMockContext({ args: ["rainbow"], theme: "dark" });
    const result = cmdMode(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const errLine = lines.find((l) => l.type === "error");
    expect(errLine).toBeDefined();
    expect(errLine?.text).toContain("Invalid mode");
  });

  it("no-arg output includes usage hint", () => {
    const ctx = createMockContext({ theme: "dark" });
    const result = cmdMode(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const usageLine = lines.find((l) => l.text?.includes("MODE DARK"));
    expect(usageLine).toBeDefined();
  });
});
