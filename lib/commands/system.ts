import { TerminalLine, CommandContext, CommandResult } from "@/lib/types";
import { out, err, sys, html, blank } from "./helpers";

export function cmdCls(ctx: CommandContext): CommandResult {
  ctx.clearLines();
  return [];
}

export function cmdHelp(ctx: CommandContext): CommandResult {
  const helpContent = ctx.content["misc/help"];
  if (helpContent) return [blank(), html(helpContent), blank()];
  return [
    blank(),
    out("Type HELP — no help file found. Try: DIR, CD, TYPE, WHOAMI, WORK, SKILLS, CONTACT"),
    blank(),
  ];
}

export function cmdWhoami(ctx: CommandContext): CommandResult {
  const whoamiContent = ctx.content["system/whoami"];
  if (whoamiContent) return [blank(), html(whoamiContent), blank()];
  // Fallback if content file is missing
  return [
    blank(),
    out("  Aart-Jan Beumer"),
    out("  Senior Software Engineer -- CMS platforms, integrations, internal tools."),
    out("  Based in The Randstad, Netherlands."),
    blank(),
    out("  Type HELP to see what you can explore."),
    blank(),
  ];
}

export function cmdHistory(ctx: CommandContext): CommandResult {
  if (ctx.commandHistory.length === 0) return out("No command history yet.");
  const lines: TerminalLine[] = [blank()];
  ctx.commandHistory.forEach((cmd, i) => {
    lines.push(out(`  ${String(i + 1).padStart(3, " ")}  ${cmd}`));
  });
  lines.push(blank());
  return lines;
}

export function cmdCrt(ctx: CommandContext): CommandResult {
  const arg = ctx.args[0]?.toLowerCase();
  if (arg === "on" || arg === "off") {
    ctx.toggleCrt();
    return sys(`CRT effect ${arg === "on" ? "enabled" : "disabled"}.`);
  }
  return err(`Syntax: CRT ON | CRT OFF  (currently ${ctx.crtEnabled ? "ON" : "OFF"})`);
}

export function cmdExit(): CommandResult {
  return [
    blank(),
    sys("You cannot quit. There is only forward."),
    sys("(Try HELP to see what's here.)"),
    blank(),
  ];
}

// ── New commands ──────────────────────────────────────────

/** DATE — display the current date in the user's local timezone. Client-side only. */
export function cmdDate(): CommandResult {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return [blank(), out(`  Current date: ${dateStr}`), blank()];
}

/** TIME — display the current time in the user's local timezone. Client-side only. */
export function cmdTime(): CommandResult {
  const now = new Date();
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  return [blank(), out(`  Current time: ${timeStr}`), blank()];
}

/** MODE — display or change the visual theme (dark / light). */
export function cmdMode(ctx: CommandContext): CommandResult {
  const arg = ctx.args[0]?.toLowerCase();
  if (!arg) {
    return [
      blank(),
      out(`  Current mode: ${ctx.theme.toUpperCase()}`),
      out("  Usage: MODE DARK | MODE LIGHT"),
      blank(),
    ];
  }
  if (arg === "dark" || arg === "light") {
    ctx.setTheme(arg);
    return [blank(), sys(`Display mode set to ${arg.toUpperCase()}.`), blank()];
  }
  return err(`Invalid mode. Usage: MODE DARK | MODE LIGHT  (currently ${ctx.theme.toUpperCase()})`);
}

/** ECHO — repeat arguments back to the terminal. */
export function cmdEcho(ctx: CommandContext): CommandResult {
  if (ctx.args.length === 0) return blank();
  const text = ctx.args.map((a) => a.replace(/^"(.*)"$/, "$1")).join(" ");
  return out(text);
}

/** COUNTRY — WIP placeholder for future localization support. */
export function cmdCountry(ctx: CommandContext): CommandResult {
  const arg = ctx.args[0];
  if (!arg) {
    return [
      blank(),
      out("  Language/region settings:"),
      out("  Current locale : EN (default)"),
      out("  Status         : Localization is work in progress."),
      blank(),
      sys("  COUNTRY — future multilingual support is planned."),
      sys("  Run `COUNTRY <code>` to see what is coming (e.g. COUNTRY ES)."),
      blank(),
    ];
  }
  const code = arg.toUpperCase();
  return [
    blank(),
    out(`  Locale requested: ${code}`),
    sys("  Localization is not yet implemented."),
    sys("  Multilingual content support is planned for a future release."),
    blank(),
  ];
}
