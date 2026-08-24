# Real-time team dashboard

A real-time contact-center dashboard — the page an operations manager keeps on a
second monitor all morning — built as a small design system underneath a single
page. Take-home for Assembled.

See [docs/PLAN.md](docs/PLAN.md) for the planning doc drafted before/during the
build (scope, decisions, architecture, build order) — kept for process
transparency alongside the "Where AI was used" section below.

## Run it

```bash
pnpm install
pnpm dev          # dashboard on http://localhost:5173
pnpm storybook    # component catalog on http://localhost:6006
pnpm test         # vitest (feed lifecycle + formatting)
pnpm build        # production build (tsc + vite)
```

The page replays the sample feed (`src/data/dashboard_state.json`) on a timer to
simulate live ticks. The **Demo controls** panel (bottom right) exists so every
feed state is reachable during a walkthrough: scrub the replay, pause until the
data goes stale, drop the connection to see the error path, reload to see the
loading skeletons. A real deployment would ship without it.

## What the page says, and why

An ops manager's question at 9am is "is the floor healthy, and where do I
intervene?" — so the page is ordered by intervention priority:

1. **Summary row** — four headline numbers: SLA attainment, queues breaching,
   tickets waiting, agents out of adherence. Counts that are themselves a state
   (breaching > 0) are colored; plain metrics stay ink with a small delta chip.
2. **Queues, worst first** — the centerpiece. Status badge, longest wait
   against target, the wait *trend* with the SLA target drawn as a threshold
   line (a number tells you where you are; the sparkline tells you where you're
   headed), tickets waiting, staffing, and volume vs forecast.
3. **Agents needing attention** — deliberately *not* a 13-row roster. Agent
   states are activities, not judgments: an agent on break may be exactly on
   schedule. **Adherence** carries the alarm, so only out-of-adherence agents
   get the table (sorted by how long they've been off plan); everyone on plan
   collapses into a one-line summary with the full list behind a disclosure.

What I left out: per-agent drill-downs, historical charts beyond the inline
trends, filtering/search. On a wall-monitor page, everything you add competes
with the thing that's on fire.

Calmness is a design constraint throughout: one row wash (breached only),
a quiet band on forecast deltas (±10% renders neutral — small moves shouldn't
shout), durations in tabular figures so nothing jitters as ticks land.

## The component layer

The page is composition-only; every visual element is one of ~10 primitives in
`src/components/ui/`, each documented across its states in Storybook:

| Component | Role |
|---|---|
| `StatusBadge` | The single source of status color: tinted chip, dot + label (never color alone) |
| `DeltaChip` | Signed change; **polarity is a prop** (`positiveIsGood`) — +25% volume is bad, +25% attainment is good — with a `quietBand` |
| `Duration` | Tabular-figure durations, `human` ("2m 55s") or `clock` ("2:55") |
| `Sparkline` | Micro area chart with optional threshold line and hover tooltip |
| `StatCard` | One headline number; composes `DeltaChip`, has a matching skeleton |
| `Panel` | The layout surface: titled header, actions slot, `padded={false}` for full-bleed tables |
| `DataTable` | Thin TanStack Table wrapper owning rhythm, sticky header, sorting, loading/empty states; column defs stay with the caller |
| `EmptyState` / `ErrorState` / `Skeleton` | Shared vocabulary for vacancy, failure, loading |
| `FreshnessIndicator` | Feed status + data age ("Live · updated 4s ago") |

API principles, applied consistently:

- **Primitives take intents, not domain values.** `StatusBadge` knows
  `healthy | risk | breach | info | neutral`; only `src/lib/domain.ts` knows
  what an `sla_status` is. A teammate can use every primitive on a page that
  has nothing to do with SLAs.
- **Components render data; they don't fetch, poll, or format policy.**
  Values arrive pre-formatted or with a formatter prop.
- **Deliberately absent props:** no `color`/`className` overrides on status
  colors (consistency is the point), no `onClick` on `StatCard` (it's a
  reading surface), no pagination on `DataTable` (an ops page shows the floor,
  not page 2 of it).

## Tokens and theming

`src/tokens/tokens.css` is the single source of truth. The palette is derived
from Assembled's own brand (assembled.com): warm cream neutrals and the
near-black ink `#0b1215`, the evergreen family for "healthy", brand indigo
`#516be9` as the interactive/info voice (deliberately a different hue from the
healthy green, so actions never impersonate status), and a dark mode built
from the brand ink itself rather than a generic gray. Five status families
each ship four roles (`accent` mark, contrast-safe `text`, tinted `surface`,
`border`); every text token was contrast-checked programmatically (≥4.5:1 on
its surface, marks ≥3:1) rather than eyeballed. Surface/border tints are flat
hex in light mode but alpha `rgba` in dark mode — dark mode's elevations
(page/surface/sunken) are far enough apart in lightness that a flat tint
tuned for one looks wrong on another, where an alpha overlay scales
correctly across all of them (see the comment in `tokens.css` for the full
rule). Rebranding the entire app —
both themes — was a one-file change, which is the point of the token layer. Light and dark are the same
token names redefined under `.dark`; `index.css` maps them into Tailwind v4's
`@theme inline`, so components only ever use semantic utilities
(`bg-surface`, `text-breach-text`) and are theme-agnostic for free. Storybook
has a light/dark toolbar; the app persists the choice and applies it pre-paint.

Base: **Tailwind v4 + Base UI** (headless, themed by our tokens) — the
shadcn-style approach of owning the styling layer while outsourcing behavior
and accessibility semantics. Tables use **TanStack Table v8** (v9's reworked
store API is a risk I didn't need); charts use **Recharts**, wrapped so pages
never touch chart internals.

## Live data as a lifecycle

`useDashboardFeed` owns the full lifecycle the components were designed
against: `connecting → live → (paused | stale → error) → recovery`. Stale is
derived from data age, error from consecutive failed ticks; the last good
frame is always retained (an ops page should degrade to "old truth, clearly
labeled" — never a blank screen). The page communicates this through one
`FreshnessIndicator` and one banner, not per-component panic. Swapping the
replay for real polling/SSE changes only this hook.

## Testing

Scoped deliberately: the feed state machine (7 cases, fake timers) and the
formatting utilities (12 cases) — the logic that's easy to get subtly wrong —
plus Storybook as visual verification for every component state. One test is a
regression: the hook must tolerate a `fixture` prop constructed inline on
every render (see below).

## Where AI was used, and how it was verified

Built pair-programming with Claude Code (Claude drafting, me directing scope,
stack, and product calls). Verification was layered rather than trust-based:

- **Types + tests first**: strict TS on everything; the feed hook and
  formatters got tests before the page used them.
- **Every state exercised live, not assumed**: the replay, dark mode,
  disconnect/reconnect, stale-while-paused, loading skeletons, and tablet
  layout were each driven in a real browser and screenshotted before commit.
- **A concrete catch**: the first version of `useDashboardFeed` re-ran its
  load effect whenever the `fixture` prop identity changed — fine in the app
  (module constant), but an infinite render loop for any caller constructing
  the fixture inline. The test suite OOM'd, we bisected it to the effect
  dependency, fixed the hook to depend on scalars only, and pinned the
  behavior with a regression test. That's the class of subtle bug this
  workflow is for.
- **Accessibility reviewed by hand**: labels on every table and sparkline,
  `aria-sort`, `role="status"`/`role="alert"` for feed changes, visible
  focus treatment, status never carried by color alone.

## If I had more time

- **StyleX exploration**: the semantic-token layer (CSS variables) could be
  ported to StyleX `defineVars` for typed, compiler-enforced tokens — a
  component could constrain exactly which style properties consumers are
  allowed to override, a stronger API contract than a plain `className:
  string`, and appealing for AI-assisted codebases (statically analyzable, no
  invalid-class-string ambiguity). Deliberately not chosen here: Vite's
  StyleX integration is Babel-plugin-based, and the Base UI / Tailwind v4 /
  Storybook stack here assumes CSS-variable theming. If time allowed, I'd
  restyle `StatusBadge` on a spike branch (it's clean of ad-hoc className
  passthrough) to make the comparison concrete for a walkthrough.
- Row virtualization in `DataTable` for hundreds-of-agents scale.
- Queue → agents cross-filtering (click a queue, see its staff).
- Storybook a11y addon + axe in CI; visual regression snapshots.
- Real transport behind `useDashboardFeed` (SSE with backoff), same interface.
