# Architecture

## Maintenance rule
Update this file and the relevant docs/ files whenever the implementation, directory structure, or module boundaries change.

## Current structure

```
/
+-- CLAUDE.md
+-- vitest.config.ts
+-- .claude/
|   +-- rules/
+-- .github/
|   +-- copilot-instructions.md
|   +-- instructions/
+-- __tests__/
|   +-- helpers/
|   |   +-- mockContext.ts   # Shared CommandContext factory for tests
|   +-- commands/            # Per-command unit tests
+-- app/
+-- components/
+-- lib/
|   +-- commands/     # Command modules (split from commandParser.ts)
|   +-- commandParser.ts  # Re-export shim -> lib/commands (kept for compatibility)
|   +-- contentLoader.ts  # Markdown loading and rendering (flat, single file)
|   +-- filesystem.ts     # Virtual filesystem tree (flat, single file)
|   +-- types.ts
+-- content/
+-- docs/
```

## Separation of concerns
- `content/` -- public markdown content (source of truth for all user-facing text)
- `docs/` -- internal reference documentation
- `lib/commands/` -- command parsing, execution, and the dispatcher
- `lib/contentLoader.ts` -- walks /content, parses markdown, returns ContentMap
- `lib/filesystem.ts` -- static virtual filesystem tree and path resolution helpers
- `components/` -- terminal UI components (rendering only, no command logic)
- `app/` -- Next.js entry points (page.tsx loads content, layout.tsx sets metadata)
- `__tests__/` -- Vitest unit tests for command logic

## Terminal state (TerminalState in components/Terminal.tsx)

| Field           | Type              | Description                                          |
| --------------- | ----------------- | ---------------------------------------------------- |
| `lines`         | `TerminalLine[]`  | All rendered output lines                            |
| `cwd`           | `string[]`        | Current virtual directory path                       |
| `commandHistory`| `string[]`        | Commands entered this session                        |
| `historyIndex`  | `number`          | Cursor into commandHistory for ↑/↓ navigation        |
| `crtEnabled`    | `boolean`         | Whether CRT scanline effect is active                |
| `theme`         | `"dark" \| "light"` | Current visual theme; persisted to localStorage    |

## CommandContext

`CommandContext` (in `lib/types.ts`) exposes the following callbacks to every command:

- `setCwd` — update the virtual CWD
- `clearLines` — clear terminal output (used by `cls`)
- `toggleCrt` — flip the CRT effect state
- `setTheme(t)` — change the visual theme; triggers `body.light-mode` class toggle + localStorage write

## Theme system

Visual theme is controlled by the `body.light-mode` CSS class:
- Dark (default): no class on body; CSS variables use dark palette
- Light: `body.light-mode` class applied; CSS variables override to light palette
- All Tailwind `dos-*` color utilities reference CSS variables, so they respond automatically
- Theme is persisted via `localStorage` key `ajb-theme`
- On mount, Terminal reads localStorage and dispatches `SET_THEME` if a saved preference exists

## Note on lib/ structure

`lib/commands/` is a full directory because command logic is large and benefits from separation by concern (navigation, system, aliases, secrets, helpers, dispatcher).

`contentLoader.ts` and `filesystem.ts` remain as flat files. They are small, single-responsibility, and do not benefit from further splitting. Avoid over-structuring small modules.

## Design guidance
The app should emulate terminal exploration without trying to become a full shell emulator. Keep command behavior predictable and the module structure obvious to a future contributor reading the repo for the first time.
