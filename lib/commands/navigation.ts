import { TerminalLine, CommandContext, CommandResult } from "@/lib/types";
import { resolveNode, listDir, FSDir } from "@/lib/filesystem";
import { out, err, blank, sys, lineId, renderFileContent } from "./helpers";

export function cmdDir(ctx: CommandContext): CommandResult {
  const node = resolveNode(ctx.cwd);
  if (!node || node.type !== "dir") return err("The system cannot find the path specified.");
  const items = listDir(node as FSDir);
  const dirs = items.filter((i) => i.isDir);
  const files = items.filter((i) => !i.isDir);

  const lines: TerminalLine[] = [blank()];
  lines.push(out(` Directory of C:\\AJBEUMER${ctx.cwd.length ? "\\" + ctx.cwd.join("\\") : ""}`));
  lines.push(blank());
  for (const d of dirs) {
    lines.push({ id: lineId(), type: "output", text: `  <DIR>          ${d.name}` });
  }
  for (const f of files) {
    lines.push({ id: lineId(), type: "output", text: `                 ${f.name}` });
  }
  lines.push(blank());
  lines.push(out(`  ${dirs.length} directory(s)   ${files.length} file(s)`));
  lines.push(blank());
  return lines;
}

export function cmdCd(ctx: CommandContext): CommandResult {
  const target = ctx.args[0];
  if (!target) return err("Syntax: CD <directory>");

  if (target === "..") {
    if (ctx.cwd.length === 0) return out("Already at root.");
    ctx.setCwd(ctx.cwd.slice(0, -1));
    return out("");
  }

  const newPath = [...ctx.cwd, target.toUpperCase()];
  const node = resolveNode(newPath);
  if (!node) return err("The system cannot find the path specified.");
  if (node.type !== "dir") return err(`${target.toUpperCase()}: Not a directory.`);
  ctx.setCwd(newPath);
  return out("");
}

export function cmdType(ctx: CommandContext): CommandResult {
  const filename = ctx.args[0];
  if (!filename) return err("Syntax: TYPE <filename>");

  // Resolve file — can be in cwd or a relative path
  const parts = filename.toUpperCase().split(/[/\\]/);
  const searchPath = parts.length > 1 ? parts : [...ctx.cwd, ...parts];

  const node = resolveNode(searchPath);
  if (!node) return err("File not found.");
  if (node.type === "dir") return err(`${filename}: Is a directory. Use DIR to list it.`);
  return renderFileContent(node.contentKey, ctx.content);
}

export function cmdPwd(ctx: CommandContext): CommandResult {
  return out(`C:\\AJBEUMER${ctx.cwd.length ? "\\" + ctx.cwd.join("\\") : ""}`);
}

// ── New commands ──────────────────────────────────────────

/** Strip HTML tags from a string to produce plain-text for searching. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
}

/** FIND — search across all loaded markdown content for a keyword or phrase. */
export function cmdFind(ctx: CommandContext): CommandResult {
  if (ctx.args.length === 0) return err("Syntax: FIND <keyword>  (e.g. FIND cms)");

  const query = ctx.args
    .map((a) => a.replace(/^"(.*)"$/, "$1"))
    .join(" ")
    .toLowerCase();

  const MAX_RESULTS = 10;
  const SNIPPET_LEN = 100;
  const matches: { key: string; snippet: string }[] = [];

  for (const [key, rawHtml] of Object.entries(ctx.content)) {
    const text = stripHtml(rawHtml);
    const idx = text.toLowerCase().indexOf(query);
    if (idx !== -1) {
      const start = Math.max(0, idx - 20);
      const end = Math.min(text.length, idx + query.length + SNIPPET_LEN - 20);
      const snippet = (start > 0 ? "..." : "") + text.slice(start, end).trim() + (end < text.length ? "..." : "");
      matches.push({ key, snippet });
      if (matches.length >= MAX_RESULTS) break;
    }
  }

  if (matches.length === 0) {
    return [blank(), out(`  No results found for: "${query}"`), blank()];
  }

  const lines: TerminalLine[] = [
    blank(),
    out(`  ${matches.length} result(s) for "${query}":`),
    blank(),
  ];
  for (const m of matches) {
    // Convert content key to a virtual FS path hint for the user
    const pathHint = m.key.toUpperCase().replace(/\//g, "\\") + ".TXT";
    lines.push(out(`  ${pathHint}`));
    lines.push({ id: lineId(), type: "system", text: `    ${m.snippet}` });
    lines.push(blank());
  }
  return lines;
}

/** APPEND — display multiple content files combined in a single output. */
export function cmdAppend(ctx: CommandContext): CommandResult {
  if (ctx.args.length === 0) {
    return err("Syntax: APPEND <file> [file2 ...] (e.g. APPEND about/bio.txt skills/core-skills.txt)");
  }

  const DIVIDER = "─".repeat(50);
  const lines: TerminalLine[] = [blank()];
  let anyFound = false;

  for (const arg of ctx.args) {
    // Normalize: strip extension, convert slashes and backslashes, uppercase for FS lookup
    const normalized = arg.replace(/\.txt$/i, "").replace(/\\/g, "/");
    const fsParts = normalized.toUpperCase().split("/");

    // Try virtual filesystem first
    const node = resolveNode(fsParts);
    if (node && node.type === "file") {
      const rendered = ctx.content[node.contentKey];
      if (rendered) {
        if (anyFound) {
          lines.push(out(""));
          lines.push(out(`  ${DIVIDER}`));
          lines.push(out(""));
        }
        lines.push({ id: lineId(), type: "html", html: rendered });
        anyFound = true;
        continue;
      }
    }

    // Fallback: try treating the normalized arg as a direct content key (e.g. "about/bio")
    const contentKey = normalized.toLowerCase();
    const rawHtml = ctx.content[contentKey];
    if (rawHtml) {
      if (anyFound) {
        lines.push(out(""));
        lines.push(out(`  ${DIVIDER}`));
        lines.push(out(""));
      }
      lines.push({ id: lineId(), type: "html", html: rawHtml });
      anyFound = true;
      continue;
    }

    // Neither resolved — show per-file error but continue
    lines.push(sys(`  Not found: ${arg}`));
  }

  if (!anyFound) return [err("No files could be resolved.")];
  lines.push(blank());
  return lines;
}
