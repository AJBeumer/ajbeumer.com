import { CommandContext, CommandResult } from "@/lib/types";
import { resolveNode } from "@/lib/filesystem";
import { err, renderFileContent } from "./helpers";
import { cmdDir } from "./navigation";

export function cmdAbout(ctx: CommandContext): CommandResult {
  ctx.setCwd(["ABOUT"]);
  return cmdDir({ ...ctx, cwd: ["ABOUT"] });
}

export function cmdWork(ctx: CommandContext): CommandResult {
  const node = resolveNode(["WORK", "TIMELINE.TXT"]);
  if (!node || node.type !== "file") return err("File not found.");
  return renderFileContent(node.contentKey, ctx.content);
}

export function cmdSkills(ctx: CommandContext): CommandResult {
  ctx.setCwd(["SKILLS"]);
  return cmdDir({ ...ctx, cwd: ["SKILLS"] });
}

export function cmdContact(ctx: CommandContext): CommandResult {
  const node = resolveNode(["CONTACT", "LINKS.TXT"]);
  if (!node || node.type !== "file") return err("File not found.");
  return renderFileContent(node.contentKey, ctx.content);
}

export function cmdProjects(ctx: CommandContext): CommandResult {
  ctx.setCwd(["PROJECTS"]);
  return cmdDir({ ...ctx, cwd: ["PROJECTS"] });
}

export function cmdHire(ctx: CommandContext): CommandResult {
  const node = resolveNode(["CONTACT", "LINKS.TXT"]);
  if (!node || node.type !== "file") return err("File not found.");
  return renderFileContent(node.contentKey, ctx.content);
}
