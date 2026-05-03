# Architecture Rules

## Maintenance rule
Update this file and the relevant docs/ files whenever the implementation, directory structure, module boundaries, or architectural decisions change. Keeping this file current reduces repeated correction in future AI sessions.

## Purpose
These rules apply when editing app structure, state, parsing logic, filesystem modeling, or data loading.

## Rules
- Keep content in `/content` and code in app directories
- Do not hardcode page content into React components
- Keep command parsing logic separate from rendering logic
- Keep virtual filesystem data and terminal state separate
- Prefer pure functions for command parsing and path resolution
- Keep alias mapping explicit and easy to audit
- Avoid deeply coupled stateful terminal logic

## Preferred modules
- `lib/commands/` for parsing and execution — system commands go in `system.ts`, navigation/search go in `navigation.ts`
- `lib/content/` for markdown discovery and loading
- `lib/filesystem/` for virtual filesystem modeling
- `components/terminal/` for UI pieces
- `app/` for shell and page entry points
- `__tests__/commands/` for per-command unit tests; `__tests__/helpers/mockContext.ts` for the shared test context factory

## Theme system
- Visual theme is controlled by `body.light-mode` CSS class
- All Tailwind `dos-*` color utilities reference CSS variables (not hardcoded hex), so light mode is applied automatically via a single class on `<body>`
- Theme state lives in `TerminalState.theme` in `components/Terminal.tsx`
- Theme is persisted to `localStorage` under key `ajb-theme`
- Command context exposes `setTheme(t: "dark" | "light")` — same pattern as `toggleCrt`

## Command sync rule
When adding or changing a command, always update `docs/command-spec.md`, `content/misc/help.md`, and `lib/commands/index.ts` in the same pass.

## Safety
- sanitize rendered markdown output
- validate file lookups
- handle missing paths gracefully
- never trust file-derived HTML without sanitization
