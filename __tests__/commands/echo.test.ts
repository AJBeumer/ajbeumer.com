import { describe, it, expect } from "vitest";
import { cmdEcho } from "@/lib/commands/system";
import { createMockContext } from "../helpers/mockContext";

describe("ECHO", () => {
  it("echoes args back as a single output line", () => {
    const ctx = createMockContext({ args: ["hello", "world"] });
    const result = cmdEcho(ctx);
    const lines = Array.isArray(result) ? result : [result];
    expect(lines[0].text).toBe("hello world");
  });

  it("returns a blank line when called with no args", () => {
    const ctx = createMockContext({ args: [] });
    const result = cmdEcho(ctx);
    const lines = Array.isArray(result) ? result : [result];
    // Blank line has empty or undefined text
    expect(lines[0].text === "" || lines[0].text === undefined).toBe(true);
  });

  it("strips surrounding double-quotes from each argument", () => {
    const ctx = createMockContext({ args: ['"hello world"'] });
    const result = cmdEcho(ctx);
    const lines = Array.isArray(result) ? result : [result];
    expect(lines[0].text).toBe("hello world");
  });

  it("handles a single word arg", () => {
    const ctx = createMockContext({ args: ["about"] });
    const result = cmdEcho(ctx);
    const lines = Array.isArray(result) ? result : [result];
    expect(lines[0].text).toBe("about");
  });
});
