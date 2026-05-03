# Frontend Rules

## Purpose
These rules apply when editing React components, styling, interactivity, and terminal UX.

## Rules
- Keep the UI keyboard-first
- Preserve strong contrast and readable typography
- Do not overuse retro effects
- Prefer subtle CRT styling over heavy distortion
- Support mobile and narrow screens
- Keep the prompt, cursor, and history legible

## Theme
- Light mode is toggled by adding `body.light-mode` CSS class via `MODE LIGHT`
- All `dos-*` Tailwind color utilities reference CSS variables, not hardcoded hex — do not hardcode color values in components
- Theme state lives in `TerminalState.theme`; changes are dispatched as `SET_THEME` actions
- Theme persists across page loads via `localStorage` key `ajb-theme`
- When adding new colored elements, use `var(--dos-*)` CSS variables, not hardcoded hex, so both themes work automatically

## Terminal UX expectations
- focus should reliably stay on the terminal input
- command history should work with arrow keys
- autocomplete should not be disruptive
- scrolling should remain stable during output updates
- first-time users should see a clear hint like `Type HELP to begin`

## Accessibility
- do not remove visible focus states
- use semantic roles where appropriate
- announce command results in a reasonable way
- avoid motion-heavy boot effects
