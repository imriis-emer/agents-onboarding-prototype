# Boards — monday.com template (experimental)

Experimental **task / project board** UI derived from a Figma design: groups of rows with task, owner, status, priority, and due date. Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS 4**, **Radix UI**, and monday’s **Vibe** design system (`@vibe/core`, `@mondaydotcomorg/icons`).

**Design source:** [Figma — Boards template (experimental)](https://www.figma.com/design/srw9dgZ4oFXMgJBz8hSePD/%F0%9F%96%A4-Boards---monday.com-template--experimental-)

## Requirements

- **Node.js** — use the version in [`.nvmrc`](.nvmrc) (e.g. `nvm use`)
- **Yarn** — this repo is wired for Yarn; see `yarn.lock`

## Setup

```bash
yarn install
```

## Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Dev server (port 3000, opens browser) |
| `yarn build` | Typecheck + production build → `build/` |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` / `yarn lint:fix` | ESLint on `src/` |
| `yarn format` / `yarn format:check` | Prettier |
| `yarn validate` | Typecheck + lint + format check |

## GitHub Pages

Pushes to **`main`** can deploy via [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml). Enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. The build sets `BASE_PATH` to `/<repository-name>/` so assets resolve under project Pages.

## AI / contributor notes

For stack details, folder layout, and common tasks (new columns, data shape, Figma import boundaries), see **[`CLAUDE.md`](CLAUDE.md)**.
