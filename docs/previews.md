# Branch previews on Vercel

Every branch/PR gets **two** preview deployments from this one repo: the
dashboard and the Storybook catalog, as separate Vercel projects. The Vercel
bot comments both URLs on each PR.

## One-time setup (~2 minutes, Vercel dashboard)

Import the GitHub repo **twice** at https://vercel.com/new — once per project:

### Project 1 — dashboard

| Setting | Value |
|---|---|
| Project name | `real-time-dashboard` |
| Framework preset | Vite |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Install command | (default — Vercel uses pnpm via the `packageManager` field) |

### Project 2 — storybook

| Setting | Value |
|---|---|
| Project name | `real-time-dashboard-storybook` |
| Framework preset | Other |
| Build command | `pnpm build-storybook` |
| Output directory | `storybook-static` |
| Install command | (default) |

That's it — no `vercel.json` needed. Project settings live in Vercel, which is
deliberate: one root `vercel.json` would apply to *both* projects and they
need different build commands.

## CLI alternative

```bash
pnpm dlx vercel login
pnpm dlx vercel link   # once per project (link, then repeat with the second name)
pnpm dlx vercel git connect
```

## Notes

- `package.json#packageManager` pins pnpm 11 so Vercel's install matches local
  (and respects `pnpm-workspace.yaml`'s `allowBuilds` for esbuild).
- Production deployments track `main`; every other branch gets preview URLs.
- If Storybook deploys feel noisy, add an "Ignored build step" to project 2:
  `git diff --quiet HEAD^ HEAD -- src .storybook package.json pnpm-lock.yaml`
  (exit 0 skips the build).
