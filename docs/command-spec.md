# Command Spec

## Maintenance rule
Update this file whenever a command is added, removed, renamed, or its behavior changes. This file is the authoritative reference for all terminal commands.

**Sync rule:** Whenever a command is added or changed, update this file, `content/misc/help.md`, and `lib/commands/index.ts` in the same commit. These three must always stay in sync.

---

## Navigation commands

| Command           | Alias(es)  | Description                                    |
| ----------------- | ---------- | ---------------------------------------------- |
| `dir`             | `ls`       | List contents of current directory             |
| `cd <folder>`     |            | Change into a subdirectory                     |
| `cd ..`           |            | Go up one directory level                      |
| `type <file>`     | `cat`      | Display the contents of a file                 |
| `pwd`             |            | Print current working directory path           |

---

## Search & utility commands

| Command                     | Alias(es)  | Description                                                              |
| --------------------------- | ---------- | ------------------------------------------------------------------------ |
| `find <keyword>`            |            | Search all content for a keyword or phrase (case-insensitive, max 10)   |
| `append <file> [file2...]`  |            | Display multiple content files combined, with dividers between sections  |
| `echo [text]`               |            | Print text to the terminal; no args prints a blank line                  |
| `date`                      |            | Display the current date (user's local timezone, client-side only)       |
| `time`                      |            | Display the current time (user's local timezone, client-side only)       |

---

## System commands

| Command           | Alias(es)     | Description                                    |
| ----------------- | ------------- | ---------------------------------------------- |
| `help`            | `?`           | Show the command reference                     |
| `cls`             | `clear`       | Clear the terminal output                      |
| `whoami`          |               | Display identity and brief intro               |
| `history`         |               | List previously entered commands               |
| `crt on`          |               | Enable CRT scanline visual effect              |
| `crt off`         |               | Disable CRT scanline visual effect             |
| `mode dark\|light` | `menucolor`  | Switch visual theme; `mode` alone shows current mode |
| `country [code]`  |               | Show language/region status (localization WIP) |
| `exit`            | `quit`        | Attempt to quit (you cannot)                   |

---

## Alias commands

These shortcuts navigate to common areas or display content directly.

| Command           | Alias(es)  | Behavior                                       |
| ----------------- | ---------- | ---------------------------------------------- |
| `about`           |            | Navigate to ABOUT\ and list its contents       |
| `work`            | `cv`       | Display WORK\TIMELINE.TXT directly             |
| `skills`          |            | Navigate to SKILLS\ and list its contents      |
| `contact`         |            | Display CONTACT\LINKS.TXT directly             |
| `hire`            |            | Display CONTACT\LINKS.TXT (same as contact)    |
| `projects`        |            | Navigate to PROJECTS\ and list its contents    |

---

## Easter egg commands (hidden)

These are intentionally undiscovered. They are not listed in `help` output.

| Command           | Alias(es)  | Behavior                                       |
| ----------------- | ---------- | ---------------------------------------------- |
| `sudo`            |            | Permission denied (filesystem is read-only)    |
| `vim`             | `nano`     | Escape sequence simulation                     |
| `git log`         |            | Fake commit history                            |
| `coffee`          |            | COFFEE.EXE not found                           |
| `matrix`          |            | Trigger Matrix rain animation                  |
| `ajb`             |            | ASCII art + tagline                            |
| `boot`            |            | Trigger reboot animation                       |

---

## Behavior rules

- Commands are case-insensitive (`DIR` and `dir` are equivalent)
- Tokens are split on whitespace; quoted strings are treated as single tokens
- Unknown commands show a friendly error and suggest `HELP`
- `type` accepts both forward and backward slashes in paths
- `cd` with no argument returns a syntax error
- `type` on a directory returns an error directing to `dir`
- Path resolution is case-insensitive within the virtual filesystem

---

## Filesystem structure (virtual)

```
C:\AJBEUMER\
+-- ABOUT\
|   +-- BIO.TXT
|   +-- SUMMARY.TXT
|   +-- VALUES.TXT
|   +-- NOW.TXT
+-- WORK\
|   +-- CURRENT-ROLE.TXT
|   +-- TIMELINE.TXT
|   +-- PREVIOUS-ROLES.TXT
|   +-- APPROACH.TXT
|   +-- HIGHLIGHTS.TXT
+-- SKILLS\
|   +-- ENGINEERING.TXT
|   +-- CMS-PLATFORMS.TXT
|   +-- INTEGRATIONS.TXT
|   +-- TOOLS.TXT
+-- PROJECTS\
|   +-- README.TXT
+-- CONTACT\
|   +-- LINKS.TXT
|   +-- SOCIALS.TXT
+-- MISC\
    +-- HELP.TXT
```

Files outside this tree are not accessible via `dir` or `type`.
