import { CommandResult } from "@/lib/types";
import { blank, sys, out, lineId } from "./helpers";

export function cmdSudo(): CommandResult {
  return [blank(), sys("Permission denied. Filesystem is read-only. Nice try."), blank()];
}

export function cmdVim(): CommandResult {
  return [
    blank(),
    sys("vim detected. Entering escape sequence..."),
    sys("ESC ESC ESC :q! :wq :q :qa! ..."),
    sys("vim closed successfully. You're safe now."),
    blank(),
  ];
}

export function cmdGitLog(): CommandResult {
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

export function cmdCoffee(): CommandResult {
  return [blank(), sys("COFFEE.EXE not found. Have you tried standup?"), blank()];
}

export function cmdMatrix(): CommandResult {
  return [{ id: lineId(), type: "system", text: "__MATRIX__" }];
}

export function cmdAjb(): CommandResult {
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

export function cmdBoot(): CommandResult {
  return [{ id: lineId(), type: "system", text: "__REBOOT__" }];
}
