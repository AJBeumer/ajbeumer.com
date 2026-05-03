import { describe, it, expect } from "vitest";
import { cmdHelp } from "@/lib/commands/system";
import { createMockContext } from "../helpers/mockContext";

const MOCK_HELP_HTML = `
<h1>Help</h1>
<table>
<tr><td>date</td><td>Display current date</td></tr>
<tr><td>time</td><td>Display current time</td></tr>
<tr><td>mode</td><td>Switch dark/light mode</td></tr>
<tr><td>find</td><td>Search content</td></tr>
<tr><td>echo</td><td>Echo text</td></tr>
<tr><td>append</td><td>Combine files</td></tr>
<tr><td>country</td><td>Language settings</td></tr>
</table>
`;

describe("HELP", () => {
  it("renders help HTML from the content map", () => {
    const ctx = createMockContext({ content: { "misc/help": MOCK_HELP_HTML } });
    const result = cmdHelp(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const htmlLine = lines.find((l) => l.type === "html" && l.html?.includes("Help"));
    expect(htmlLine).toBeDefined();
  });

  it("falls back gracefully when help content is missing", () => {
    const ctx = createMockContext({ content: {} });
    const result = cmdHelp(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const fallbackLine = lines.find((l) => l.type === "output" && l.text?.includes("HELP"));
    expect(fallbackLine).toBeDefined();
  });

  it("includes new command keywords in help content", () => {
    const ctx = createMockContext({ content: { "misc/help": MOCK_HELP_HTML } });
    const result = cmdHelp(ctx);
    const lines = Array.isArray(result) ? result : [result];
    const htmlLine = lines.find((l) => l.type === "html");
    const newCommands = ["date", "time", "mode", "find", "echo", "append", "country"];
    for (const cmd of newCommands) {
      expect(htmlLine?.html).toContain(cmd);
    }
  });
});
