# Content Model

## Maintenance rule
Update this file whenever the content structure, rendering pipeline, filesystem mapping, or authoring rules change.

---

## Principles
- One file = one terminal-readable content unit
- Write for scannability -- short sections, clear headings
- Avoid repeated wording across files
- Leave `[TODO]` placeholders where facts are missing or uncertain
- Do not invent personal or company details

---

## Content key format

Content keys are derived from the file path relative to `/content/`, with the `.md` extension removed.

Examples:
- `content/about/bio.md` -> content key `about/bio`
- `content/work/timeline.md` -> content key `work/timeline`
- `content/skills/cms-platforms.md` -> content key `skills/cms-platforms`

Content keys are used in two ways:
1. The `ContentMap` (returned by `getAllContent()`) maps keys to rendered HTML strings
2. The virtual filesystem in `lib/filesystem.ts` maps terminal paths to content keys

---

## Filesystem visibility

A content file is only reachable via terminal commands (`dir`, `type`) if it is registered in `lib/filesystem.ts`.

Files that exist in `/content` but are NOT in `lib/filesystem.ts` are effectively hidden from visitors. This is intentional for:
- Template files (e.g. `projects/case-study-template.md`)
- Easter egg content (e.g. `misc/secrets.md`)
- Developer-only notes

To make a new file accessible via the terminal, add an entry to `lib/filesystem.ts` using the content key.

---

## Adding content

To add a new accessible file:
1. Create the markdown file in `/content/<section>/<name>.md`
2. Add an entry to the relevant directory in `lib/filesystem.ts`:
   ```ts
   "FILENAME.TXT": { type: "file", contentKey: "section/name" }
   ```
3. Update `docs/command-spec.md` with the new file if it changes navigation
4. Update `docs/site-map.md` to reflect the new file

---

## Rendering

- Markdown is parsed at build time using `marked`
- Raw HTML blocks in markdown are stripped (defense-in-depth)
- Rendered HTML is stored in `ContentMap` and passed as a prop to the terminal
- Output supports: headings, lists, emphasis, bold, links, tables, code blocks
- Keep output readable in a narrow terminal-like layout -- avoid wide tables or long unbroken lines

---

## Authoring guidelines

- Use short, scannable sections
- Keep content concise -- terminal readers don't scroll willingly
- Use `>` blockquotes at the end of files for navigation hints (e.g. `> type bio.txt`)
- Avoid HTML in markdown -- it will be stripped
- Do not duplicate content across files -- link or refer instead

---

## FIND and APPEND behavior

### FIND
- `find <keyword>` strips HTML from all ContentMap values and searches the resulting plain text
- This means `find` does NOT require a file to be registered in `lib/filesystem.ts`; any file in ContentMap is searchable
- Results show the virtual FS path (e.g. `SKILLS\CMS-PLATFORMS.TXT`) and a 100-character context snippet
- Max 10 results are returned to keep terminal output manageable

### APPEND
- `append <file> [file2...]` resolves each argument first via the virtual filesystem, then falls back to a direct ContentMap key lookup
- Arguments can be virtual FS paths (`ABOUT\BIO.TXT`, `about/bio.txt`) or bare content keys (`about/bio`)
- Missing files produce a system-level warning; found files are still rendered
- Output sections are separated by a `─────────────────────────────────────────────────────` divider
- This command does NOT mutate any files and does NOT follow DOS APPEND PATH semantics

---

## COUNTRY / future localization

- `country` is a WIP placeholder
- When multilingual content is implemented, translated content should live at keys like `about/bio.nl`, `about/bio.es`
- The `ContentMap` key format already accommodates locale variants; language-aware lookup can be layered in `contentLoader.ts` or a new `lib/content/i18n.ts` module
- Do not fake translated content in the current markdown files
