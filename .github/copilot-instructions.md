# Copilot Instructions

This repository is a markdown-driven personal website with an MS-DOS terminal interaction model.

## Priorities
- keep content separate from application logic
- preserve terminal-style navigation
- prefer small targeted changes
- maintain accessibility and keyboard-first behavior
- avoid unsafe markdown rendering

## Project expectations
- user-facing content lives in `/content`
- architecture docs live in `/docs`
- command and path logic should stay modular
- terminal UI should remain readable and mobile-friendly

## Before finalizing changes
- ensure build passes
- ensure lint passes
- ensure TypeScript passes
- do not introduce duplicated logic
- do not replace markdown content with hardcoded JSX
