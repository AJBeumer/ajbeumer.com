import { describe, it, expect } from "vitest";
import { cmdFind } from "@/lib/commands/navigation";
import { createMockContext } from "../helpers/mockContext";

const SAMPLE_CONTENT: Record<string, string> = {
  "skills/cms-platforms": "<h1>CMS Platforms</h1><p>Contentful, Sanity, and other headless CMS tools.</p>",
  "about/bio": "<h1>Bio</h1><p>Aart-Jan Beumer, software engineer based in The Netherlands.</p>",
  "work/timeline": "<h1>Timeline</h1><p>Career history and work experience.</p>",
};

describe("FIND", () => {
  it("returns an error when no query is given", () => {
    const ctx = createMockContext({ args: [], content: SAMPLE_CONTENT });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    expect(lines.find((l) => l.type === "error")).toBeDefined();
  });

  it("finds a matching content entry", () => {
    const ctx = createMockContext({ args: ["cms"], content: SAMPLE_CONTENT });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const found = lines.some((l) => l.text?.includes("SKILLS\\CMS-PLATFORMS.TXT"));
    expect(found).toBe(true);
  });

  it("returns a no-results message when nothing matches", () => {
    const ctx = createMockContext({ args: ["xyzzy"], content: SAMPLE_CONTENT });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const noResult = lines.some((l) => l.text?.includes("No results found"));
    expect(noResult).toBe(true);
  });

  it("is case-insensitive", () => {
    const ctx = createMockContext({ args: ["CMS"], content: SAMPLE_CONTENT });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const found = lines.some((l) => l.text?.includes("SKILLS\\CMS-PLATFORMS.TXT"));
    expect(found).toBe(true);
  });

  it("supports multi-word quoted phrases", () => {
    const ctx = createMockContext({ args: ['"software engineer"'], content: SAMPLE_CONTENT });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const found = lines.some((l) => l.text?.includes("ABOUT\\BIO.TXT"));
    expect(found).toBe(true);
  });

  it("returns a result count line", () => {
    const ctx = createMockContext({ args: ["cms"], content: SAMPLE_CONTENT });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const countLine = lines.find((l) => l.text?.match(/\d+ result/));
    expect(countLine).toBeDefined();
  });

  it("returns no more than 10 results", () => {
    // Create content with 15 entries all containing the keyword
    const largeContent: Record<string, string> = {};
    for (let i = 0; i < 15; i++) {
      largeContent[`section/file${i}`] = `<p>keyword content here number ${i}</p>`;
    }
    const ctx = createMockContext({ args: ["keyword"], content: largeContent });
    const result = cmdFind(ctx);
    const lines = Array.isArray(result) ? result : [result];
    // Results are: blank + count + blank + (match path + snippet + blank) × N + no closing blank
    const pathLines = lines.filter((l) => l.text?.includes(".TXT"));
    expect(pathLines.length).toBeLessThanOrEqual(10);
  });
});
