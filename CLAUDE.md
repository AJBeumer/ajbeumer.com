# CLAUDE.md

## Project
This project is a personal website presented as an MS-DOS inspired terminal interface.

Visitors explore the site by using terminal commands instead of clicking traditional navigation.

The site must feel:
- retro in interaction model
- modern in implementation quality
- readable and accessible
- professional, not gimmicky

## Core user experience
Users should be able to:
- type `help` to learn how to navigate
- use `dir` to list content
- use `cd <folder>` and `cd ..` to navigate
- use `type <file>` to read content
- use convenience commands like `about`, `work`, `skills`, and `contact`

Terminal interaction is the primary navigation model.

## Content source of truth
- User-facing content lives in `/content`
- Markdown files map to terminal-readable pages
- Internal architecture docs live in `/docs`

## Stack expectation
Prefer:
- Next.js
- TypeScript
- Tailwind CSS
- markdown-driven content
- deployable to Vercel

## Non-negotiables
- Keep content separate from UI and parsing logic
- Avoid unsafe markdown rendering
- Preserve keyboard-first UX
- Ensure mobile usability
- Keep commands intuitive and forgiving

## Working rules
- Read the relevant files in `.claude/rules/` before making changes in that area
- Make minimal, targeted changes
- Do not rewrite content structure unless required
- Prefer clear architecture over clever abstractions
- When facts are uncertain in content, use TODO placeholders instead of inventing
- **Command sync rule:** When adding or changing a command, always update `docs/command-spec.md`, `content/misc/help.md`, and `lib/commands/index.ts` in the same pass. These three must stay in sync.

## Definition of done
A change is done when:
- code builds cleanly
- linting passes
- TypeScript passes
- terminal behavior still works
- accessibility is not degraded
- content files remain easy to edit
