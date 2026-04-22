// Virtual filesystem tree for C:\AJBEUMER\
// Dirs are objects; files are strings referencing content keys.
// Content keys map to the actual markdown content loaded at build time.

export type FSFile = { type: "file"; contentKey: string };
export type FSDir = { type: "dir"; children: Record<string, FSNode> };
export type FSNode = FSFile | FSDir;

export const filesystem: FSDir = {
  type: "dir",
  children: {
    ABOUT: {
      type: "dir",
      children: {
        "BIO.TXT": { type: "file", contentKey: "about/bio" },
        "VALUES.TXT": { type: "file", contentKey: "about/values" },
        "NOW.TXT": { type: "file", contentKey: "about/now" },
      },
    },
    WORK: {
      type: "dir",
      children: {
        "CURRENT-ROLE.TXT": { type: "file", contentKey: "work/current-role" },
        "TIMELINE.TXT": { type: "file", contentKey: "work/timeline" },
        "PREVIOUS-ROLES.TXT": { type: "file", contentKey: "work/previous-roles" },
      },
    },
    SKILLS: {
      type: "dir",
      children: {
        "ENGINEERING.TXT": { type: "file", contentKey: "skills/engineering" },
        "CMS-PLATFORMS.TXT": { type: "file", contentKey: "skills/cms-platforms" },
        "INTEGRATIONS.TXT": { type: "file", contentKey: "skills/integrations" },
        "TOOLS.TXT": { type: "file", contentKey: "skills/tools" },
      },
    },
    PROJECTS: {
      type: "dir",
      children: {
        "README.TXT": { type: "file", contentKey: "projects/README" },
      },
    },
    CONTACT: {
      type: "dir",
      children: {
        "LINKS.TXT": { type: "file", contentKey: "contact/links" },
        "SOCIALS.TXT": { type: "file", contentKey: "contact/socials" },
      },
    },
    MISC: {
      type: "dir",
      children: {
        "HELP.TXT": { type: "file", contentKey: "misc/help" },
        // SECRETS.TXT intentionally omitted from dir listing
      },
    },
  },
};

/** Resolve a path array to a filesystem node (or null if not found) */
export function resolveNode(path: string[]): FSNode | null {
  let node: FSNode = filesystem;
  for (const segment of path) {
    if (node.type !== "dir") return null;
    const child: FSNode | undefined = node.children[segment.toUpperCase()];
    if (!child) return null;
    node = child;
  }
  return node;
}

/** List visible children of a dir node (excludes hidden files like SECRETS) */
export function listDir(node: FSDir): { name: string; isDir: boolean }[] {
  return Object.entries(node.children).map(([name, child]) => ({
    name,
    isDir: child.type === "dir",
  }));
}

/** Get autocomplete suggestions for current dir */
export function getSuggestions(cwd: string[], partial: string): string[] {
  const node = resolveNode(cwd);
  if (!node || node.type !== "dir") return [];
  const upper = partial.toUpperCase();
  return Object.keys(node.children).filter((k) => k.startsWith(upper));
}
