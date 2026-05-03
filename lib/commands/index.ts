import { CommandContext, CommandResult, TerminalLine } from "@/lib/types";
import { cmdDir, cmdCd, cmdType, cmdPwd, cmdFind, cmdAppend } from "./navigation";
import { cmdCls, cmdHelp, cmdWhoami, cmdHistory, cmdCrt, cmdExit, cmdDate, cmdTime, cmdMode, cmdEcho, cmdCountry } from "./system";
import { cmdAbout, cmdWork, cmdSkills, cmdContact, cmdProjects, cmdHire } from "./aliases";
import { cmdSudo, cmdVim, cmdGitLog, cmdCoffee, cmdMatrix, cmdAjb, cmdBoot } from "./secrets";
import { err, out, lineId } from "./helpers";

export { lineId };

type Handler = (ctx: CommandContext) => CommandResult;

const commands: Record<string, Handler> = {
  // Navigation
  dir: cmdDir,
  ls: cmdDir,
  cd: cmdCd,
  type: cmdType,
  cat: cmdType,
  pwd: cmdPwd,
  find: cmdFind,
  append: cmdAppend,
  // System
  cls: cmdCls,
  clear: cmdCls,
  help: cmdHelp,
  "?": cmdHelp,
  whoami: cmdWhoami,
  history: cmdHistory,
  crt: cmdCrt,
  exit: cmdExit,
  quit: cmdExit,
  date: cmdDate,
  time: cmdTime,
  mode: cmdMode,
  menucolor: cmdMode,
  echo: cmdEcho,
  country: cmdCountry,
  // Aliases
  about: cmdAbout,
  work: cmdWork,
  cv: cmdWork,
  skills: cmdSkills,
  contact: cmdContact,
  hire: cmdHire,
  projects: cmdProjects,
  // Easter eggs (hidden from help)
  sudo: cmdSudo,
  vim: cmdVim,
  nano: cmdVim,
  git: (ctx) => {
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
  const [rawCmd, ...args] = tokens;
  if (!rawCmd) return [];

  const cmd = rawCmd.toLowerCase().replace(/^"(.*)"$/, "$1");

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
