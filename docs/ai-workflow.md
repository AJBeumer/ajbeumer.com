# AI Workflow

## Best usage pattern
1. Open the repo with Claude Code or Cursor
2. Let the assistant read `CLAUDE.md`
3. For a focused task, also point it at the relevant file in `.claude/rules/`
4. Keep prompts short and task-specific

## Good prompt example
Implement safe markdown rendering for the terminal output. Follow `CLAUDE.md` and `.claude/rules/markdown-content.md`. Keep changes minimal and add tests for sanitization and missing-file behavior.

## Bad prompt example
Rewrite the whole app to be better and modern.
