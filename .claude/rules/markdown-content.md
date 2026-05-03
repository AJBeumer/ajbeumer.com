# Markdown Rendering Rules

## Purpose
These rules apply when implementing markdown loading and rendering.

## Rules
- support headings, lists, emphasis, and links
- sanitize HTML before rendering
- preserve spacing suitable for terminal output
- handle missing files with clear fallback output
- avoid markdown features that break terminal readability

## Implementation preference
- parse markdown in a dedicated content layer
- return sanitized HTML or a safe render model
- keep file loading deterministic
