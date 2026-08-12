# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Boards** is an experimental monday.com template built from a Figma design. It's a task management/project planning UI that displays groups of items in a table format with columns for task, owner, status, priority, and due date.

Stack: **React 18** + **TypeScript** + **Vite** + **Sass** + **Vibe** (`@vibe/core` + `@mondaydotcomorg/icons`). Component styles live in **`*.module.scss`** next to each component; use Vibe tokens (`var(--space-*)`, etc.).

## Essential Commands

- **`yarn dev`** — Start Vite dev server (port 3000, opens browser)
- **`yarn build`** — Typecheck (`tsc --noEmit`) then production build to **`build/`**
- **`yarn typecheck`** — `tsc --noEmit` only
- **`yarn lint`** / **`yarn lint:fix`** — ESLint on `src/`
- **`yarn format`** / **`yarn format:check`** — Prettier on `src/**/*.{ts,tsx,css,scss,json}`
- **`yarn validate`** — Typecheck + lint + format check (run before committing)

**No test suite exists.** Use `yarn validate` as the primary quality gate.

**Note:** This project uses **Yarn** (see `yarn.lock`). Use `yarn` instead of `npm`. Node version pinned in **`.nvmrc`** (v24).

## Architecture

### Component Hierarchy

```
App.tsx (state: groups[], columnWidths, product)
└── MainLayout.tsx (top bar + left pane + content area)
    ├── TopBarInternal (product logo, notifications, inbox, search, avatar)
    ├── LeftPane (collapsible sidebar, Cmd+. toggle)
    │   └── LeftPaneContent.tsx (nav items, favorites, monday AI, workspaces, boards)
    └── PageContent
        ├── BoardHeader.tsx (title, toolbar: filter/sort/group/etc.)
        └── BoardGroup.tsx (per-group table with resizable columns)
            └── StatusCell.tsx (colored status/priority badges)
```

### Key Files

- **`src/components/types.ts`** — Core types: `Item`, `Group`, `StatusType`, `PriorityType`, `ColumnId`, `ColumnWidths`
- **`src/productConfig.ts`** — Product theming (`work_management` | `dev` | `service` | `crm`). `initProduct()` adds a CSS class to `<body>`, which activates product-specific CSS vars in `globals.css`
- **`src/components/ai-icons.tsx`** — SVG-based icon components for monday AI features (sidekick, vibe, workflows, agents, notetaker)
- **`src/styles/globals.css`** — Vibe token imports, fonts, base reset, product theme overrides (body classes), checkbox margin fix
- **`src/guidelines/Guidelines.md`** — Comprehensive Vibe design system reference (component APIs, spacing tokens, color tokens, accessibility rules). Consult when adding/modifying UI components

### Data Flow

1. `INITIAL_GROUPS` defined in `App.tsx` — static data, no persistence
2. State flows down: App → MainLayout → BoardGroup → cells
3. Column resize events flow back up via `onColumnResize` callback
4. Left pane selection state is local to `LeftPaneContent`

### Board Table Layout

`BoardGroup` uses CSS Grid with a template built from `columnWidths`:
```
50px | minmax(task, 1fr) | owner | status | priority | eta | 40px
checkbox | task name       | avatar | StatusCell | StatusCell | date | add col
```
Column resizing uses mouse drag handlers with 50px minimum width.

## Key Patterns

### Vibe Design System
- Import components from `@vibe/core` (or `@vibe/core/next` for newer ones like `List`)
- **Icons:** Import every icon from **`@mondaydotcomorg/icons` only.** Do not import icons from **`@vibe/icons`** (even though the monday package bundles the Vibe icon set). This keeps resolution, types, and the extended monday icon set on one dependency path.
- Use Vibe tokens for spacing/colors: `var(--space-8)`, `var(--primary-color)`, etc.
- Use `Box` and `Flex` for layout, not raw `<div>` with custom CSS
- Consult `src/guidelines/Guidelines.md` for component APIs and best practices

### Product Theming
Products (`work_management`, `dev`, `service`, `crm`) each have:
- A CSS class on `<body>` (set by `initProduct()`) that overrides `--primary-surface-color`
- A unique SVG logo rendered by `ProductLogoLarge` in `MainLayout.tsx`
- `BoardGroup` renders extra sprint controls when `product === “dev”`

### Styling Priority
1. **Vibe components** with built-in props (spacing, colors)
2. **SCSS modules** (`ComponentName.module.scss`) — co-located layout and semantic classes; prefer **tokens from `@vibe/core/tokens`** via `var(--space-8)`, `var(--border-radius-small)`, etc.
3. **Inline styles** only when needed (e.g. dynamic grid columns, per-group color strips)
4. **`globals.css`** for global overrides and product themes

### Vite Aliases
- `@/*` → `./src/*` (TypeScript path alias, mirrored in tsconfig)
- `figma:asset/<hash>.png` → actual PNG files in `src/assets/`
- Version-suffixed packages (e.g. `@radix-ui/react-dialog@1.1.6`) → unversioned imports

**Top bar reference (monday.com production)** — For structure, spacing, and icon order, align with the **`mf-topbar`** micro-frontend (local path: `~/Development/mf-topbar/`). Key files: `topbar.tsx` (header layout), `platform-top-bar-items.tsx` (right-side icons order), `base-navigation-items.tsx` (help → divider → Vibe → switcher → avatar).

## Deployment (GitHub Pages)

On push to the repo **default branch** (any name) or **`workflow_dispatch`**, `.github/workflows/deploy-github-pages.yml` builds and deploys to GitHub Pages. Configure an **`NPM_TOKEN`** repository (or organization) secret with a read-only npm token that can install **`@mondaydotcomorg/*`** private packages. Production builds use **`base: './'`** in Vite so JS/CSS load correctly whether the site is served under `/<repo>/` or at the root of a `*.pages.github.io` host. Override with **`BASE_PATH`** only if you host under a fixed path elsewhere. Enable via **Settings → Pages → Source: GitHub Actions**.

## Common Development Tasks

**Adding a new column:**
1. Add to `ColumnId` type and `ColumnWidths` interface in `types.ts`
2. Add default width in `App.tsx`
3. Render header and cell in `BoardGroup.tsx`

**Adding new statuses/priorities:**
- Extend `StatusType` or `PriorityType` in `types.ts`
- Add color mapping in `StatusCell.tsx` → `getStatusColor()`

**Switching product theme:**
- Change the `PRODUCT` constant in `App.tsx`
