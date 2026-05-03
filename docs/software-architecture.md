# Software Architecture

## Maintenance rule

This file must be updated whenever the implementation, architecture, commands, rendering pipeline, content model, or tech choices change.

Markdown documentation in this repository is part of the system design. If the code changes in a way that affects behavior or structure, update the relevant markdown files in the same change -- so future AI and human contributors need less repeated instruction.

---

## Purpose

This document describes the architecture of the AJB OS portfolio website: the reasons behind the technical choices, the rules for evolving the system safely, and the current state of the implementation.

---

## Product summary

A personal portfolio presented as a terminal-style MS-DOS interface. Visitors explore content through DOS-inspired commands rather than traditional page navigation. The site is designed to feel retro in interaction model and modern in implementation quality.

---

## User experience model

- Terminal-first interaction: visitors type commands to explore
- Commands are case-insensitive and forgiving
- `help` is always available and discoverable
- `dir` lists the current directory, `cd` navigates, `type` reads a file
- Convenience aliases (`about`, `work`, `skills`, `contact`, `projects`) shortcut common paths
- Command history is navigable with arrow keys
- Tab completion is supported for filenames
- Optional CRT scanline effect (`crt on` / `crt off`)
- Boot animation on first load and reboot
- Matrix easter egg
- Responsive layout; usable on mobile

---

## Chosen tech stack

| Layer          | Choice                                                  |
| -------------- | ------------------------------------------------------- |
| Framework      | Next.js 15 (App Router)                                 |
| Language       | TypeScript (strict mode, ES2017 target)                 |
| Styling        | Tailwind CSS 3.4 + custom DOS color palette             |
| Font           | IBM Plex Mono                                           |
| Content        | Markdown files in `/content`, processed at build time   |
| Markdown       | gray-matter (frontmatter stripping) + marked v12        |
| State          | React `useReducer` (terminal) + `useState` (UI flags)   |
| Deployment     | Vercel                                                  |
| Testing        | Deferred - see Testing Strategy section                 |

---

## Why these tech choices were made

**Next.js (App Router)**
Server components allow build-time content loading without client-side file system access. The App Router is the current Next.js standard. Vercel deployment is zero-configuration with Next.js.

**TypeScript strict mode**
The codebase is small but command dispatch and filesystem resolution have non-trivial logic. Strict types catch missing cases and make refactoring safer.

**Tailwind CSS**
Single-responsibility utility classes keep styling co-located with components. The custom DOS palette (`dos-bg`, `dos-green`, `dos-amber`, `dos-error`, `dos-text`) is defined in `tailwind.config.ts` and applied consistently.

**gray-matter + marked**
gray-matter strips YAML frontmatter before passing content to marked. marked is lightweight, synchronous (with `async: false`), and produces clean HTML. No heavy markdown runtime is shipped to the client -- content is pre-rendered at build time.

**Raw HTML stripping in marked**
`marked.use({ renderer: { html: () => "" } })` is applied at module load in `contentLoader.ts`. This strips any raw HTML blocks that appear in markdown files before they reach `dangerouslySetInnerHTML`. Content is authored and build-time only, so this is a conservative defense-in-depth measure.

**React useReducer for terminal state**
Terminal state has multiple interacting pieces (lines, cwd, history, historyIndex, crtEnabled). `useReducer` keeps state transitions explicit and predictable. `useState` handles simpler UI flags (booted, matrixActive, inputValue).

**Vercel**
Zero-config deployment for Next.js. Static generation and edge caching work automatically.

---

## Repository structure

```
/
+-- CLAUDE.md                    # AI working rules and project philosophy
+-- CLAUDE.local.md.example      # Template for local AI context overrides
+-- .claude/
|   +-- rules/                   # Scoped rules for architecture, content, frontend, testing
+-- .github/
|   +-- copilot-instructions.md  # Copilot-specific AI instructions
|   +-- instructions/            # Per-area Copilot instruction files
+-- app/
|   +-- layout.tsx               # HTML shell, metadata, font
|   +-- page.tsx                 # Server component: loads content, renders Terminal
|   +-- globals.css              # Tailwind directives, DOS CSS variables, CRT effect
+-- components/
|   +-- Terminal.tsx             # Main terminal UI (state, input handling, rendering)
|   +-- TerminalInput.tsx        # Input row with keyboard event handling
|   +-- TerminalLine.tsx         # Single line renderer (output/prompt/error/system/html)
|   +-- BootSequence.tsx         # Boot animation component
+-- lib/
|   +-- commands/                # Command parsing and execution (split by concern)
|   |   +-- helpers.ts           # Shared line factories: out, err, sys, html, blank, lineId
|   |   +-- navigation.ts        # dir, cd, type, pwd
|   |   +-- system.ts            # cls, help, whoami, history, crt, exit
|   |   +-- aliases.ts           # about, work, skills, contact, projects, hire
|   |   +-- secrets.ts           # Easter egg commands (sudo, vim, git, coffee, matrix, ajb, boot)
|   |   +-- index.ts             # Command registry, parseAndExecute dispatcher
|   +-- commandParser.ts         # Re-export shim -> @/lib/commands (kept for compatibility)
|   +-- contentLoader.ts         # Build-time markdown loading, returns ContentMap
|   +-- filesystem.ts            # Virtual filesystem tree (C:\AJBEUMER\) and path resolution
|   +-- types.ts                 # Shared types: TerminalLine, CommandContext, CommandResult
+-- content/                     # User-facing markdown content (source of truth)
|   +-- about/
|   +-- work/
|   +-- skills/
|   +-- projects/
|   +-- contact/
|   +-- misc/
+-- docs/                        # Internal reference documentation
    +-- software-architecture.md  # This file
    +-- architecture.md           # Directory structure and separation of concerns
    +-- command-spec.md           # Full command reference
    +-- content-model.md          # Content authoring rules and key mapping
    +-- site-map.md               # Visual content directory map
    +-- ai-workflow.md            # AI usage guidelines for this repo
```

---

## Content architecture

- All public-facing content lives in `/content`
- One markdown file = one terminal-readable unit
- Content keys are relative paths without `.md` extension, e.g. `about/bio`
- The virtual filesystem in `lib/filesystem.ts` maps terminal paths (e.g. `ABOUT\BIO.TXT`) to content keys
- Files not in the filesystem are not reachable via `dir` or `type` -- they are effectively hidden
- `misc/help.md` is rendered by the `help` command but is not listed in the virtual filesystem
- `SECRETS.TXT` is intentionally absent from the virtual filesystem -- it exists only as a content key

---

## Terminal command architecture

All command logic lives in `lib/commands/`. The structure is:

```
lib/commands/
+-- helpers.ts     # Line factories used across all modules
+-- navigation.ts  # File system navigation commands (dir, cd, type, pwd)
+-- system.ts      # Shell utility commands (cls, help, whoami, history, crt, exit)
+-- aliases.ts     # Shortcut commands (about, work, skills, contact, projects, hire)
+-- secrets.ts     # Hidden easter egg commands
+-- index.ts       # Command registry + parseAndExecute dispatcher
```

`parseAndExecute(input, ctx)` is the single entry point from the UI. It:
1. Trims and tokenizes the input string
2. Lowercases the command name
3. Looks up the handler in the command registry
4. Calls the handler with `CommandContext`
5. Returns a flat `TerminalLine[]` for the Terminal to append

`CommandContext` contains: `args`, `cwd`, `content`, `setCwd`, `clearLines`, `toggleCrt`, `crtEnabled`, `commandHistory`.

Command handlers are pure functions. Side effects (`setCwd`, `clearLines`, `toggleCrt`) are executed via callbacks in `CommandContext` -- the handler does not mutate state directly.

Special signals `__MATRIX__` and `__REBOOT__` are returned as `system`-type lines and intercepted by the Terminal component before appending.

---

## Rendering pipeline

```
/content/*.md
  -> fs.readFileSync (build time, in server component app/page.tsx)
  -> gray-matter (strip YAML frontmatter)
  -> marked.parse (markdown to HTML; raw HTML blocks stripped)
  -> ContentMap: Record<string, string>  (passed as prop to Terminal)
  -> parseAndExecute (returns TerminalLine[])
  -> TerminalLine.tsx (dangerouslySetInnerHTML for html-type lines only)
```

Content is loaded once at server component render time. No runtime file I/O. No client-side markdown parsing. The `ContentMap` is passed as a prop to the client component `Terminal`.

`dangerouslySetInnerHTML` is used only for `html`-type lines, which contain pre-rendered markdown HTML. Since marked strips raw HTML blocks, the output is protected from injection via authored content.

---

## State management approach

**Terminal state** (managed via `useReducer` in Terminal.tsx):
- `lines: TerminalLine[]` - accumulated output history
- `cwd: string[]` - current working directory path segments
- `commandHistory: string[]` - executed commands for arrow-key recall
- `historyIndex: number` - current position in command history
- `crtEnabled: boolean` - CRT scanline effect toggle

**UI flags** (managed via `useState` in Terminal.tsx):
- `booted: boolean` - whether boot sequence has completed
- `rebooting: boolean` - short-circuit flag for reboot animation
- `inputValue: string` - controlled input field value
- `matrixActive: boolean` - matrix rain animation in progress

State is not persisted between sessions. All state resets on page reload or reboot.

---

## Accessibility approach

- `role="application"` on the outer terminal container
- `role="log"` with `aria-live="polite"` and `aria-atomic="false"` on the scrollback area
- `aria-label="Terminal input"` on the input field
- Click anywhere on the terminal focuses the input
- Arrow key history navigation
- Tab autocomplete for filenames
- CRT effect is opt-in (off by default) to avoid motion sensitivity issues
- IBM Plex Mono at readable sizes
- High-contrast DOS color palette (green on near-black)
- `select-none` on decorative UI elements

---

## Styling approach

- Tailwind CSS utility classes throughout
- Custom DOS color palette in `tailwind.config.ts`:
  - `dos-bg: #0d0d0d` - near-black background
  - `dos-green: #00ff41` - phosphor green for active text
  - `dos-green-dim: #00a82a` - dimmer green for secondary elements
  - `dos-amber: #ffb000` - amber for prompts and accents
  - `dos-text: #c8c8c8` - light grey for output text
  - `dos-error: #ff4444` - red for error messages
- CRT effect: CSS `::before` overlay with repeating linear gradient (scanlines) on `body.crt-enabled`
- IBM Plex Mono loaded from Google Fonts in `app/globals.css`
- Custom `.dos-content` CSS class for markdown output styling (headings, links, lists, tables, code)
- Subtle animations: blink (cursor), fade-in (boot lines), matrix-fall

---

## Security considerations

- **Markdown sanitization**: `marked.use({ renderer: { html: () => "" } })` strips raw HTML blocks before rendering. Applied once at module load in `contentLoader.ts`.
- **dangerouslySetInnerHTML scope**: Used only for pre-rendered build-time content, never for user input.
- **No user-generated content**: The terminal accepts commands but never renders user input as HTML. All command output is produced by pure TypeScript functions.
- **No server-side user input handling**: All command execution is client-side. No API routes. No database.
- **Virtual filesystem**: Path resolution uses an explicit static tree. No access to the real filesystem at runtime.
- **Missing file handling**: `resolveNode` returns `null` for unknown paths; all commands handle this with user-friendly error messages.

---

## Performance considerations

- Content is loaded once at build time in `app/page.tsx` (server component). No runtime I/O.
- `ContentMap` is passed as a prop -- no re-fetching during virtual navigation.
- No markdown parser in the browser bundle -- `marked` and `gray-matter` are server-only.
- Terminal line list grows unboundedly during a session. Typical use (tens of commands) has no performance issue. If long sessions become a concern, virtualized rendering could be added.
- Matrix animation uses `setInterval` at 60ms (~16fps). Cleaned up with `clearInterval` on completion.

---

## Testing strategy

No tests currently exist. This is a known gap.

**Priority test areas when tests are added:**

1. `lib/commands/helpers.ts` -- `out`, `err`, `sys`, `html`, `blank`, `renderFileContent`
2. `lib/commands/navigation.ts` -- `cmdDir`, `cmdCd`, `cmdType`, `cmdPwd` with mocked filesystem and content
3. `lib/filesystem.ts` -- `resolveNode` with valid and invalid paths, `listDir`, `getSuggestions`
4. `lib/commands/index.ts` -- `parseAndExecute` for known commands, unknown commands, empty input, quoted input
5. Alias behavior -- `about`, `work`, `skills`, `contact` navigate and return correct content
6. `renderFileContent` -- returns error line when content key is missing
7. CRT toggle -- correct state returned from `cmdCrt`
8. Special signals -- `__MATRIX__` and `__REBOOT__` returned correctly from `cmdMatrix` and `cmdBoot`

**Recommended stack:** Vitest for pure function tests (commands, filesystem). No DOM required for the core logic. Add `@testing-library/react` only if component-level tests are needed.

---

## Deployment approach

- Deployed to Vercel.
- `next build` generates the output. Content is rendered at build time via server components.
- No environment variables required for the current feature set.
- Deployment triggers automatically on push to main (standard Vercel Git integration).
- Verify locally before deploying:
  ```
  npm run build
  npm run lint
  npm run type-check
  ```

---

## Future evolution guidelines

- **Always update docs when the code changes.** New command -> update `docs/command-spec.md`. Filesystem change -> update this file and `docs/content-model.md`. Content file added -> update `docs/site-map.md`.
- **Keep AI instruction files current.** Files in `.claude/rules/` and `.github/instructions/` are instructions for AI contributors. Outdated instructions cause repeated corrections in future sessions.
- **Prefer incremental refactoring** over rewrites. The current architecture is intentionally simple.
- **Do not mix content with implementation.** All public-facing text belongs in `/content/*.md`.
- **Preserve the terminal-first product identity.** New features should feel native to the terminal model.
- **Keep the command set intuitive.** If a command requires reading docs to discover, reconsider it.
- **Do not add heavy dependencies** without a clear reason and a migration cost assessment.
# Software Architecture

## Maintenance rule

This file must be updated whenever the implementation, architecture, commands, rendering pipeline, content model, or tech choices change.

Markdown documentation in this repository is part of the system design. If the code changes in a way that affects behavior or structure, update the relevant markdown files in the same change � so future AI and human contributors need less repeated instruction.

---

## Purpose

This document describes the architecture of the AJB OS portfolio website: the reasons behind the technical choices, the rules for evolving the system safely, and the current state of the implementation.

---

## Product summary

A personal portfolio presented as a terminal-style MS-DOS interface. Visitors explore content through DOS-inspired commands rather than traditional page navigation. The site is designed to feel retro in interaction model and modern in implementation quality.

---

## User experience model

- Terminal-first interaction: visitors type commands to explore
- Commands are case-insensitive and forgiving
- `help` is always available and discoverable
- `dir` lists the current directory, `cd` navigates, `type` reads a file
- Convenience aliases (`about`, `work`, `skills`, `contact`, `projects`) shortcut common paths
- Command history is navigable with arrow keys
- Tab completion is supported for filenames
- Optional CRT scanline effect (`crt on` / `crt off`)
- Boot animation on first load and reboot
- Matrix easter egg
- Responsive layout; usable on mobile

---

## Chosen tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode, ES2017 target) |
| Styling | Tailwind CSS 3.4 + custom DOS color palette |
| Font | IBM Plex Mono |
| Content | Markdown files in `/content`, processed at build time |
| Markdown parser | gray-matter (frontmatter stripping) + marked v12 (HTML rendering) |
| State | React `useReducer` (terminal state) + `useState` (UI flags) |
| Deployment | Vercel |
| Testing | Deferred � see Testing Strategy section |

---

## Why these tech choices were made

**Next.js (App Router)**
Server components allow build-time content loading without client-side file system access. The App Router is the current Next.js standard. Vercel deployment is zero-configuration with Next.js.

**TypeScript strict mode**
The codebase is small but command dispatch and filesystem resolution have non-trivial logic. Strict types catch missing cases and make refactoring safer.

**Tailwind CSS**
Single-responsibility utility classes keep styling co-located with components. The custom DOS palette (`dos-bg`, `dos-green`, `dos-amber`, `dos-error`, `dos-text`) is defined in `tailwind.config.ts` and applied consistently.

**gray-matter + marked**
gray-matter strips YAML frontmatter before passing content to marked. marked is lightweight, synchronous (with `async: false`), and produces clean HTML. No heavy markdown runtime is shipped to the client � content is pre-rendered at build time.

**Raw HTML stripping in marked**
`marked.use({ renderer: { html: () => "" } })` is applied at module load in `contentLoader.ts`. This strips any raw HTML blocks that appear in markdown files before they reach `dangerouslySetInnerHTML`. Content is authored and build-time only, so this is a conservative defense-in-depth measure.

**React useReducer for terminal state**
Terminal state has multiple interacting pieces (lines, cwd, history, historyIndex, crtEnabled). `useReducer` keeps state transitions explicit and predictable. `useState` handles simpler UI flags (booted, matrixActive, inputValue).

**Vercel**
Zero-config deployment for Next.js. Static generation and edge caching work automatically.

---

## Repository structure

```text
/
+-- CLAUDE.md                    # AI working rules and project philosophy
+-- CLAUDE.local.md.example      # Template for local AI context overrides
+-- .claude/
�   +-- rules/                   # Scoped rules for architecture, content, frontend, testing
+-- .github/
�   +-- copilot-instructions.md  # Copilot-specific AI instructions
�   +-- instructions/            # Per-area Copilot instruction files
+-- app/
�   +-- layout.tsx               # HTML shell, metadata, font
�   +-- page.tsx                 # Server component: loads content, renders Terminal
�   +-- globals.css              # Tailwind directives, DOS CSS variables, CRT effect
+-- components/
�   +-- Terminal.tsx             # Main terminal UI (state, input handling, rendering)
�   +-- TerminalInput.tsx        # Input row with keyboard event handling
�   +-- TerminalLine.tsx         # Single line renderer (output/prompt/error/system/html)
�   +-- BootSequence.tsx         # Boot animation component
+-- lib/
�   +-- commands/                # Command parsing and execution (split by concern)
�   �   +-- helpers.ts           # Shared line factories: out, err, sys, html, blank, lineId
�   �   +-- navigation.ts        # dir, cd, type, pwd
�   �   +-- system.ts            # cls, help, whoami, history, crt, exit
�   �   +-- aliases.ts           # about, work, skills, contact, projects, hire
�   �   +-- secrets.ts           # Easter egg commands (sudo, vim, git, coffee, matrix, ajb, boot)
�   �   +-- index.ts             # Command registry, parseAndExecute dispatcher
�   +-- commandParser.ts         # Re-export shim ? @/lib/commands (kept for compatibility)
�   +-- contentLoader.ts         # Build-time markdown loading: walk /content, parse, return ContentMap
�   +-- filesystem.ts            # Virtual filesystem tree (C:\AJBEUMER\) and path resolution
�   +-- types.ts                 # Shared types: TerminalLine, CommandContext, CommandResult
+-- content/                     # User-facing markdown content (source of truth)
�   +-- about/
�   +-- work/
�   +-- skills/
�   +-- projects/
�   +-- contact/
�   +-- misc/
+-- docs/                        # Internal reference documentation
    +-- software-architecture.md  # This file
    +-- architecture.md           # Directory structure and separation of concerns
    +-- command-spec.md           # Full command reference
    +-- content-model.md          # Content authoring rules and key mapping
    +-- site-map.md               # Visual content directory map
    +-- ai-workflow.md            # AI usage guidelines for this repo
```

---

## Content architecture

- All public-facing content lives in `/content`
- One markdown file = one terminal-readable unit
- Content keys are relative paths without `.md` extension, e.g. `about/bio`
- The virtual filesystem in `lib/filesystem.ts` maps terminal paths (e.g. `ABOUT\BIO.TXT`) to content keys
- Files not in the filesystem are not reachable via `dir` or `type` � they are effectively hidden
- The `misc/` directory contains `help.md` (rendered by the `help` command) and `secrets.md` (unreachable by default, discoverable only by reading source)
- `SECRETS.TXT` is intentionally absent from the virtual filesystem � it exists only as a content key for direct access if discovered

---

## Terminal command architecture

All command logic lives in `lib/commands/`. The structure is:

```
lib/commands/
+-- helpers.ts     # Line factories used across all modules
+-- navigation.ts  # File system navigation commands
+-- system.ts      # Shell utility commands
+-- aliases.ts     # Shortcut commands that navigate and/or display content
+-- secrets.ts     # Hidden easter egg commands
+-- index.ts       # Registry (Record<string, Handler>) + parseAndExecute dispatcher
```

`parseAndExecute(input, ctx)` is the single entry point from the UI. It:
1. Trims and tokenizes the input string
2. Lowercases the command name
3. Looks up the handler in the registry
4. Calls the handler with `CommandContext`
5. Returns a flat `TerminalLine[]` for the Terminal to append

`CommandContext` contains: `args`, `cwd`, `content`, `setCwd`, `clearLines`, `toggleCrt`, `crtEnabled`, `commandHistory`.

Command handlers are pure functions. Side effects (setCwd, clearLines, toggleCrt) are executed via callbacks in `CommandContext` � the handler does not mutate state directly.

Special signals `__MATRIX__` and `__REBOOT__` are returned as `system` type lines and handled by the Terminal component before appending.

---

## Rendering pipeline

```
/content/*.md
    ? fs.readFileSync (build time, server component)
    ? gray-matter (strip frontmatter)
    ? marked.parse (markdown ? HTML, raw HTML stripped)
    ? ContentMap (Record<string, string>)
    ? Terminal prop
    ? parseAndExecute result (TerminalLine[])
    ? TerminalLine.tsx (dangerouslySetInnerHTML for html-type lines)
```

Content is loaded once at server component render time (`app/page.tsx`). No runtime file I/O. No client-side markdown parsing. The `ContentMap` is passed as a prop to the client component `Terminal`.

`dangerouslySetInnerHTML` is used only for `html`-type lines, which contain pre-rendered markdown HTML. Since marked strips raw HTML blocks, the output is safe from user-authored injection. Content is authored � not user-submitted.

---

## State management approach

**Terminal state** (managed via `useReducer` in Terminal.tsx):
- `lines: TerminalLine[]` � accumulated output history
- `cwd: string[]` � current working directory path segments
- `commandHistory: string[]` � executed commands for arrow-key recall
- `historyIndex: number` � current position in command history
- `crtEnabled: boolean` � CRT scanline effect toggle

**UI flags** (managed via `useState` in Terminal.tsx):
- `booted: boolean` � whether boot sequence has completed
- `rebooting: boolean` � short-circuit flag for reboot animation
- `inputValue: string` � controlled input field value
- `matrixActive: boolean` � matrix rain animation in progress

State is not persisted between sessions. All state resets on page reload or reboot.

---

## Accessibility approach

- `role="application"` on the outer terminal container
- `role="log"` with `aria-live="polite"` and `aria-atomic="false"` on the scrollback area
- `aria-label="Terminal input"` on the input field
- Click anywhere on the terminal focuses the input
- Arrow key history navigation
- Tab autocomplete
- CRT effect is opt-in (off by default) to avoid motion sensitivity issues
- IBM Plex Mono at readable sizes
- High-contrast DOS color palette (green on near-black)
- `select-none` on decorative elements

---

## Styling approach

- Tailwind CSS utility classes throughout
- Custom DOS color palette defined in `tailwind.config.ts`:
  - `dos-bg: #0d0d0d` � near-black background
  - `dos-green: #00ff41` � phosphor green for active text
  - `dos-green-dim: #00a82a` � dimmer green for secondary elements
  - `dos-amber: #ffb000` � amber for prompts and accents
  - `dos-text: #c8c8c8` � light grey for output text
  - `dos-error: #ff4444` � red for error messages
- CRT effect: CSS `::before` overlay with repeating linear gradient (scanlines) on `body.crt-enabled`
- IBM Plex Mono font loaded from Google Fonts in `app/globals.css`
- Custom `.dos-content` CSS class for markdown output styling (headings, links, lists, tables, code)
- Subtle animations: blink (cursor), fade-in (boot lines), matrix-fall

---

## Security considerations

- **Markdown sanitization**: `marked.use({ renderer: { html: () => "" } })` strips raw HTML blocks from all markdown content before rendering. Applied once at module load in `contentLoader.ts`.
- **dangerouslySetInnerHTML scope**: Used only for pre-rendered build-time content, never for user input.
- **No user-generated content**: The terminal accepts commands but never renders user input as HTML. Command results are generated by pure TypeScript functions, not templates.
- **No server-side user input handling**: All command execution is client-side. No API routes. No database.
- **Virtual filesystem**: Path resolution uses an explicit static tree. No access to the real filesystem at runtime.
- **Missing file handling**: `resolveNode` returns `null` for unknown paths; all commands handle this with user-friendly errors rather than exceptions.

---

## Performance considerations

- Content is loaded once at build time in `app/page.tsx` (server component). No runtime I/O.
- `ContentMap` is passed as a prop � no re-fetching on navigation (navigation is virtual, handled client-side).
- No heavy client-side dependencies: no markdown parser in the browser bundle.
- `marked` and `gray-matter` are server-only (used only in `contentLoader.ts`, which runs at build time).
- Terminal line list grows unboundedly during a session. For typical use (tens of commands) this is not a problem. If performance degrades in very long sessions, virtualization could be added to `TerminalLine` rendering.
- Matrix animation uses `setInterval` at 60ms (� 16fps). Cleaned up with `clearInterval` on completion.

---

## Testing strategy

No tests currently exist. This is tracked as a known gap.

**Priority test areas when tests are added:**

1. `lib/commands/helpers.ts` � `out`, `err`, `sys`, `html`, `blank`, `renderFileContent`
2. `lib/commands/navigation.ts` � `cmdDir`, `cmdCd`, `cmdType`, `cmdPwd` with mocked filesystem and content
3. `lib/filesystem.ts` � `resolveNode` with valid and invalid paths, `listDir`, `getSuggestions`
4. `lib/commands/index.ts` � `parseAndExecute` for known commands, unknown commands, empty input, quoted input
5. Alias behavior � `about`, `work`, `skills`, `contact` navigate correctly
6. `renderFileContent` � returns error line when key is missing
7. CRT toggle � correct state returned
8. Special signals � `__MATRIX__` and `__REBOOT__` returned correctly

**Recommended test stack:** Vitest + @testing-library/react for component tests if needed. Pure function tests (commands, filesystem) require only Vitest and no DOM.

---

## Deployment approach

- Deployed to Vercel.
- `next build` generates a static/SSR hybrid output. Content is rendered at build time via server components.
- No environment variables required for the current feature set.
- Deployment is triggered automatically on push to main (standard Vercel Git integration).
- Verify with:
  ```
  npm run build
  npm run lint
  npm run type-check
  ```

---

## Future evolution guidelines

- **Always update docs when the code changes.** If a new command is added, update `docs/command-spec.md`. If the filesystem changes, update this file and `docs/content-model.md`. If content files change, update `docs/site-map.md`.
- **Keep AI instruction files current.** The files in `.claude/rules/` and `.github/instructions/` are instructions for AI contributors. Outdated instructions cause repeated corrections in future sessions.
- **Prefer incremental refactoring** over rewrites. The current architecture is intentionally simple.
- **Do not mix content with implementation.** All public-facing text belongs in `/content/*.md`.
- **Preserve the terminal-first product identity.** New features should feel native to the terminal model.
- **Keep the command set intuitive.** If a command requires reading docs to discover, reconsider it.
- **Do not add heavy dependencies** without a clear reason and a migration cost assessment.
