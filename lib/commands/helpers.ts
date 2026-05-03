import { TerminalLine } from "@/lib/types";

// Module-level counter for unique line IDs used as React keys.
// Not intended for ordering guarantees — use only for DOM key uniqueness.
let _lineId = 0;

export function lineId(): string {
  return `l-${++_lineId}`;
}

export function out(text: string): TerminalLine {
  return { id: lineId(), type: "output", text };
}

export function err(text: string): TerminalLine {
  return { id: lineId(), type: "error", text };
}

export function sys(text: string): TerminalLine {
  return { id: lineId(), type: "system", text };
}

export function html(htmlStr: string): TerminalLine {
  return { id: lineId(), type: "html", html: htmlStr };
}

export function blank(): TerminalLine {
  return out("");
}

/** Render a content file as terminal output lines. Returns an error line if missing. */
export function renderFileContent(
  contentKey: string,
  content: Record<string, string>
): TerminalLine[] {
  const c = content[contentKey];
  if (!c) return [err("File not found.")];
  return [blank(), html(c), blank()];
}
