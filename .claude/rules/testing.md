# Testing Rules

## Purpose
These rules apply when adding or updating tests.

## Minimum coverage areas
- path resolution
- command parsing
- alias handling
- unknown command behavior
- `cd`, `dir`, `type`, `help`, and `pwd`
- markdown loading failures
- safe rendering behavior

## Rules
- prefer focused unit tests for command logic
- add integration tests for core terminal flows
- keep tests readable and behavior-driven
