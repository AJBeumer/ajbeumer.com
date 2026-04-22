import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type ContentMap = Record<string, string>;

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Recursively collect all .md files under /content/ and return a map
 *  of contentKey → rendered HTML string.
 *  contentKey = relative path without extension, e.g. "about/bio"
 */
export function getAllContent(): ContentMap {
  const map: ContentMap = {};

  function walk(dir: string, prefix: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const keySegment = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(fullPath, keySegment);
      } else if (entry.name.endsWith(".md")) {
        const key = keySegment.replace(/\.md$/, "");
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { content } = matter(raw);
        // marked.parse may return a Promise in v12; use synchronous option
        const html = marked.parse(content, { async: false }) as string;
        map[key] = html;
      }
    }
  }

  walk(CONTENT_DIR, "");
  return map;
}
