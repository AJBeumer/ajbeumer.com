# AI-Ready MS-DOS Portfolio Repo Pack

This pack gives you a current best-practice repository structure for building and maintaining your terminal-style personal website with both Claude and GitHub Copilot.

## Goals
- Keep AI instructions concise and modular
- Keep content separate from implementation logic
- Reduce repeated prompting
- Make the repo easy for Claude Code, Cursor, and Copilot to understand
- Preserve a clean markdown-driven content model

## Recommended placement
Copy these folders into the root of your project.

## Main AI files
- `CLAUDE.md` — repo-wide Claude context
- `.claude/rules/*.md` — focused Claude rules by topic
- `.github/copilot-instructions.md` — repo-wide Copilot instructions
- `.github/instructions/*.instructions.md` — scoped Copilot instructions

## Main app/content files
- `content/` — user-facing markdown content
- `docs/` — human-readable internal documentation

## Notes
- Keep `CLAUDE.md` short. Put detail in scoped rule files.
- Keep Copilot instructions short and operational.
- Do not duplicate the same long guidance in multiple files.
- Use markdown files as the source of truth for terminal-readable content.
