import { describe, it, expect } from "vitest";
import { cmdAppend } from "@/lib/commands/navigation";
import { createMockContext } from "../helpers/mockContext";

const SAMPLE_CONTENT: Record<string, string> = {
  "about/bio": "<h1>Bio</h1><p>Background information.</p>",
  "about/values": "<h1>Values</h1><p>What drives me.</p>",
  "skills/core-skills": "<h1>Core Skills</h1><p>Key technical skills.</p>",
};

describe("APPEND", () => {
  it("returns an error when called with no args", () => {
    const ctx = createMockContext({ args: [], content: SAMPLE_CONTENT });
    const result = cmdAppend(ctx);
    const lines = Array.isArray(result) ? result : [result];
    expect(lines.find((l) => l.type === "error")).toBeDefined();
  });

  it("renders a single file by content key", () => {
    const ctx = createMockContext({ args: ["about/bio"], content: SAMPLE_CONTENT });
    const result = cmdAppend(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const htmlLine = lines.find((l) => l.type === "html" && l.html?.includes("Bio"));
    expect(htmlLine).toBeDefined();
  });

  it("renders multiple files with a divider between them", () => {
    const ctx = createMockContext({
      args: ["about/bio", "about/values"],
      content: SAMPLE_CONTENT,
    });
    const result = cmdAppend(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const dividerLine = lines.find((l) => l.text?.includes("─"));
    expect(dividerLine).toBeDefined();
    const htmlLines = lines.filter((l) => l.type === "html");
    expect(htmlLines.length).toBe(2);
  });

  it("shows a system message for a missing file but continues with found ones", () => {
    const ctx = createMockContext({
      args: ["about/bio", "does/not/exist"],
      content: SAMPLE_CONTENT,
    });
    const result = cmdAppend(ctx);
    const lines = Array.isArray(result) ? result : [result];
    // Should still render bio
    const htmlLine = lines.find((l) => l.type === "html" && l.html?.includes("Bio"));
    expect(htmlLine).toBeDefined();
    // And report the missing file
    const warnLine = lines.find((l) => l.type === "system" && l.text?.includes("Not found:"));
    expect(warnLine).toBeDefined();
  });

  it("returns an error when all files are missing", () => {
    const ctx = createMockContext({
      args: ["does/not/exist"],
      content: SAMPLE_CONTENT,
    });
    const result = cmdAppend(ctx);
    const lines = Array.isArray(result) ? result : [result];
    expect(lines.find((l) => l.type === "error")).toBeDefined();
  });

  it("accepts .txt extension in the file arg", () => {
    const ctx = createMockContext({
      args: ["about/bio.txt"],
      content: SAMPLE_CONTENT,
    });
    const result = cmdAppend(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const htmlLine = lines.find((l) => l.type === "html" && l.html?.includes("Bio"));
    expect(htmlLine).toBeDefined();
  });
});
