# ajbeumer.com

Personal portfolio site for **Aart-Jan Beumer** — Senior Software Engineer building CMS platforms, integrations, and internal tools.

The entire site is an interactive MS-DOS terminal. Visitors type commands to explore the profile, work history, and skills. No nav bars. No carousels. Just a command line and content that rewards curiosity.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom DOS/CRT theme |
| Content | Markdown files in `/content/` |
| Font | IBM Plex Mono |
| Deployment | Vercel |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The boot sequence plays automatically.

```bash
npm run build     # production build
npm run type-check  # TypeScript check without building
```

---

## Project structure

```
ajbeumer.com/
├── app/
│   ├── layout.tsx          # HTML shell, meta tags
│   ├── page.tsx            # Server component — loads content, mounts Terminal
│   └── globals.css         # Tailwind base + DOS color vars + CRT effect + markdown styles
│
├── components/
│   ├── Terminal.tsx         # Main stateful terminal shell
│   ├── BootSequence.tsx     # Animated startup sequence
│   ├── TerminalLine.tsx     # Renders a single output line
│   ├── TerminalInput.tsx    # Input with ↑/↓ history + Tab autocomplete
│   └── OutputRenderer.tsx   # (reserved)
│
├── lib/
│   ├── filesystem.ts        # Virtual C:\AJBEUMER\ tree definition
│   ├── contentLoader.ts     # Reads /content/**/*.md at build time → HTML map
│   ├── commandParser.ts     # Tokenises input, dispatches to command handlers
│   └── types.ts             # Shared TypeScript types
│
├── content/
│   ├── README.md            # Root directory welcome message
│   ├── about/
│   │   ├── bio.md
│   │   ├── values.md
│   │   └── now.md           # ← update this regularly
│   ├── work/
│   │   ├── current-role.md
│   │   ├── timeline.md
│   │   └── previous-roles.md
│   ├── skills/
│   │   ├── engineering.md
│   │   ├── cms-platforms.md
│   │   ├── integrations.md
│   │   └── tools.md
│   ├── projects/
│   │   └── README.md        # ← add project case studies here
│   ├── contact/
│   │   ├── links.md
│   │   └── socials.md
│   └── misc/
│       ├── help.md          # Rendered by the HELP command
│       └── secrets.md       # Hidden — not listed in DIR
│
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## Command reference

### Navigation

| Command | Description |
|---|---|
| `dir` | List files and folders in the current directory |
| `ls` | Alias for `dir` |
| `cd <dir>` | Enter a directory — e.g. `cd about` |
| `cd ..` | Go back to the parent directory |
| `pwd` | Print current path |
| `type <file>` | Display a file's contents — e.g. `type bio.txt` |
| `cat <file>` | Alias for `type` |

### Profile shortcuts

| Command | Description |
|---|---|
| `whoami` | Short intro — good place to start |
| `about` | Navigate into `ABOUT\` and list files |
| `work` | Show full career timeline directly |
| `cv` | Alias for `work` |
| `skills` | Navigate into `SKILLS\` and list files |
| `contact` | Show contact links directly |
| `hire` | Alias for `contact` |
| `projects` | Navigate into `PROJECTS\` and list files |

### System

| Command | Description |
|---|---|
| `help` | Show the command reference |
| `?` | Alias for `help` |
| `cls` | Clear the terminal screen |
| `clear` | Alias for `cls` |
| `history` | List previously entered commands |
| `crt on` | Enable CRT scanline + glow effect |
| `crt off` | Disable CRT effect |
| `exit` | Try it |
| `quit` | Also try it |

### Easter eggs & hidden commands

These do not appear in `help`. Discover them yourself — or just read this list.

| Command | What happens |
|---|---|
| `git log` | Reveals a suspiciously honest commit history |
| `sudo rm -rf /` | Filesystem is read-only. Nice try. |
| `vim` | Attempts to escape vim. Successfully. |
| `nano` | Same fate as vim. |
| `coffee` | `COFFEE.EXE not found. Have you tried standup?` |
| `matrix` | Brief matrix rain, then back to reality |
| `ajb` | ASCII art + a quote |
| `boot` | Re-runs the full boot sequence |

---

## Adding content

### Edit an existing file
All content lives in `/content/`. Edit any `.md` file directly — changes are picked up on the next build (or hot-reloaded in dev).

### Add a new file
1. Create the `.md` file in the appropriate `/content/` subdirectory
2. Register it in `lib/filesystem.ts` under the correct parent directory node
3. That's it — the content loader picks it up automatically

### Add a project
1. Create `content/projects/<project-name>.md`
2. Add an entry to the `PROJECTS` node in `lib/filesystem.ts`:
   ```ts
   "PROJECT-NAME.TXT": { type: "file", contentKey: "projects/project-name" },
   ```

### Update "now"
Edit `content/about/now.md` whenever your current focus changes. It's the one file that should stay fresh.

---

## Deployment

```bash
npm i -g vercel
vercel
```

No environment variables required. Static site — everything bakes at build time.

---

## TODO placeholders

Search for `[TODO` across the `content/` folder to find all fields that need real values:

```bash
grep -r "\[TODO" content/
```

Key ones:
- `content/about/now.md` — current focus, what you're building/learning/reading
- `content/work/current-role.md` — confirm start date at IB
- `content/work/timeline.md` — confirm organisation name for Digital Applications Coordinator role
- `content/skills/engineering.md` — confirm primary languages and frameworks
- `content/skills/cms-platforms.md` — list specific CMS platforms
- `content/skills/tools.md` — confirm full toolchain
- `content/projects/README.md` — add actual project entries

---

## License

Personal site — all rights reserved.
