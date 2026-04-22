import { TerminalLine, CommandContext, CommandResult } from "@/lib/types";
import { resolveNode, listDir, FSDir } from "@/lib/filesystem";

let _lineId = 0;
export function lineId() {
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

function renderFileContent(
  contentKey: string,
  content: Record<string, string>
): TerminalLine[] {
  const c = content[contentKey];
  if (!c) return [err("File not found.")];
  return [blank(), html(c), blank()];
}

// ---------- navigation ----------

function cmdDir(ctx: CommandContext): CommandResult {
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

function cmdCd(ctx: CommandContext): CommandResult {
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

function cmdType(ctx: CommandContext): CommandResult {
  const filename = ctx.args[0];
  if (!filename) return err("Syntax: TYPE <filename>");

  // resolve file — can be in cwd or a relative path
  const parts = filename.toUpperCase().split(/[/\\]/);
  const searchPath = parts.length > 1 ? parts : [...ctx.cwd, ...parts];

  const node = resolveNode(searchPath);
  if (!node) return err("File not found.");
  if (node.type === "dir") return err(`${filename}: Is a directory. Use DIR to list it.`);
  return renderFileContent(node.contentKey, ctx.content);
}

function cmdPwd(ctx: CommandContext): CommandResult {
  return out(`C:\\AJBEUMER${ctx.cwd.length ? "\\" + ctx.cwd.join("\\") : ""}`);
}

// ---------- system ----------

function cmdCls(ctx: CommandContext): CommandResult {
  ctx.clearLines();
  return [];
}

function cmdHelp(ctx: CommandContext): CommandResult {
  const helpContent = ctx.content["misc/help"];
  if (helpContent) return [blank(), html(helpContent), blank()];
  return [blank(), out("Type HELP — no help file found. Try: DIR, CD, TYPE, WHOAMI, WORK, SKILLS, CONTACT"), blank()];
}

function cmdWhoami(): CommandResult {
  return [
    blank(),
    out("  Aart-Jan Beumer"),
    out("  Senior Software Engineer — CMS platforms, integrations, internal tools."),
    out("  Based in The Randstad, Netherlands."),
    out("  Currently: International Baccalaureate (IB)."),
    blank(),
    out('  Type HELP to see what you can explore.'),
    blank(),
  ];
}

function cmdHistory(ctx: CommandContext): CommandResult {
  if (ctx.commandHistory.length === 0) return out("No command history yet.");
  const lines: TerminalLine[] = [blank()];
  ctx.commandHistory.forEach((cmd, i) => {
    lines.push(out(`  ${String(i + 1).padStart(3, " ")}  ${cmd}`));
  });
  lines.push(blank());
  return lines;
}

function cmdCrt(ctx: CommandContext): CommandResult {
  const arg = ctx.args[0]?.toLowerCase();
  if (arg === "on" || arg === "off") {
    ctx.toggleCrt();
    return sys(`CRT effect ${arg === "on" ? "enabled" : "disabled"}.`);
  }
  return err(`Syntax: CRT ON | CRT OFF  (currently ${ctx.crtEnabled ? "ON" : "OFF"})`);
}

function cmdExit(): CommandResult {
  return [
    blank(),
    sys("You cannot quit. There is only forward."),
    sys("(Try HELP to see what's here.)"),
    blank(),
  ];
}

// ---------- aliases ----------

function cmdAbout(ctx: CommandContext): CommandResult {
  ctx.setCwd(["ABOUT"]);
  return cmdDir({ ...ctx, cwd: ["ABOUT"] });
}

function cmdWork(ctx: CommandContext): CommandResult {
  const node = resolveNode(["WORK", "TIMELINE.TXT"]);
  if (!node || node.type !== "file") return err("File not found.");
  return renderFileContent(node.contentKey, ctx.content);
}

function cmdSkills(ctx: CommandContext): CommandResult {
  ctx.setCwd(["SKILLS"]);
  return cmdDir({ ...ctx, cwd: ["SKILLS"] });
}

function cmdContact(ctx: CommandContext): CommandResult {
  const node = resolveNode(["CONTACT", "LINKS.TXT"]);
  if (!node || node.type !== "file") return err("File not found.");
  return renderFileContent(node.contentKey, ctx.content);
}

function cmdProjects(ctx: CommandContext): CommandResult {
  ctx.setCwd(["PROJECTS"]);
  return cmdDir({ ...ctx, cwd: ["PROJECTS"] });
}

// ---------- secrets ----------

function cmdSudo(): CommandResult {
  return [blank(), sys("Permission denied. Filesystem is read-only. Nice try."), blank()];
}

function cmdVim(): CommandResult {
  return [
    blank(),
    sys("vim detected. Entering escape sequence..."),
    sys("ESC ESC ESC :q! :wq :q :qa! ..."),
    sys("vim closed successfully. You're safe now."),
    blank(),
  ];
}

function cmdGitLog(): CommandResult {
  const commits = [
    "f3a92c1  fix: stop overthinking the readme",
    "d1b004e  feat: add coffee dependency (wontfix)",
    "9a3c17f  refactor: rename everything, rename back",
    "c85f210  chore: delete vim configs (again)",
    "b72e001  docs: added TODO to remove all TODOs",
    "a110bcd  feat: initial commit (took 3 months)",
  ];
  return [blank(), ...commits.map((c) => out(`  commit ${c}`)), blank()];
}

function cmdCoffee(): CommandResult {
  return [blank(), sys("COFFEE.EXE not found. Have you tried standup?"), blank()];
}

function cmdMatrix(): CommandResult {
  // The matrix effect is handled in the Terminal component via a special line type.
  return [{ id: lineId(), type: "system", text: "__MATRIX__" }];
}

function cmdAjb(): CommandResult {
  return [
    blank(),
    out("  ░█████╗░░░░░░██╗██████╗░"),
    out("  ██╔══██╗░░░░██╔╝██╔══██╗"),
    out("  ███████║░░░██╔╝░██████╔╝"),
    out("  ██╔══██║░░██╔╝░░██╔══██╗"),
    out("  ██║░░██║░██╔╝░░░██████╔╝"),
    out("  ╚═╝░░╚═╝╚═╝░░░░╚═════╝░"),
    blank(),
    sys("  Aart-Jan Beumer — software engineer, builder, occasional overthinker."),
    sys("  'Make it work, make it right, make it fast.'"),
    blank(),
  ];
}

function cmdBoot(): CommandResult {
  return [{ id: lineId(), type: "system", text: "__REBOOT__" }];
}

function cmdHire(ctx: CommandContext): CommandResult {
  const timesStr = ctx.args[0]; // unused but left for future use
  void timesStr;
  const node = resolveNode(["CONTACT", "LINKS.TXT"]);
  if (!node || node.type !== "file") return err("File not found.");
  return renderFileContent(node.contentKey, ctx.content);
}

// ---------- dispatcher ----------

type Handler = (ctx: CommandContext) => CommandResult;

const commands: Record<string, Handler> = {
  dir: cmdDir,
  ls: cmdDir,
  cd: cmdCd,
  type: cmdType,
  cat: cmdType,
  pwd: cmdPwd,
  cls: cmdCls,
  clear: cmdCls,
  help: cmdHelp,
  "?": cmdHelp,
  whoami: cmdWhoami,
  history: cmdHistory,
  crt: cmdCrt,
  exit: cmdExit,
  quit: cmdExit,
  // aliases
  about: cmdAbout,
  work: cmdWork,
  cv: cmdWork,
  skills: cmdSkills,
  contact: cmdContact,
  hire: cmdHire,
  projects: cmdProjects,
  // secrets
  sudo: cmdSudo,
  vim: cmdVim,
  nano: cmdVim,
  "git": (ctx) => {
    if (ctx.args[0] === "log") return cmdGitLog();
    return err(`git: '${ctx.args[0] ?? ""}' is not a git command. (This isn't git.)`);
  },
  coffee: cmdCoffee,
  matrix: cmdMatrix,
  ajb: cmdAjb,
  boot: cmdBoot,
};

export function parseAndExecute(
  input: string,
  ctx: Omit<CommandContext, "args">
): TerminalLine[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const tokens = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  const [rawCmd, ...args] = tokens;  if (!rawCmd) return [];  const cmd = rawCmd.toLowerCase().replace(/^"(.*)"$/, "$1");

  const handler = commands[cmd];
  if (!handler) {
    return [
      err(`'${rawCmd.toUpperCase()}' is not recognized as an internal or external command.`),
      out("Type HELP for a list of available commands."),
    ];
  }

  const fullCtx: CommandContext = { ...ctx, args };
  const result = handler(fullCtx);
  return Array.isArray(result) ? result : [result];
}
