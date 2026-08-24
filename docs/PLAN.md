# Assembled Take-Home: Real-Time Dashboard

> Planning doc drafted with Claude Code before/during the build. Kept as-is for
> process transparency (see README's "Where AI was used" section) — some
> specifics (file layout, exact component list) shifted slightly during
> implementation; the README is the source of truth for what actually shipped.
>
> **The brief itself is the source of truth for requirements:**
> [Take-home interview: Real-time dashboard](https://assembledhq.notion.site/Take-home-interview-Real-time-dashboard-391d57062bc080e690a1ebcf49e7c7de).
> Where this plan and the brief disagree, the brief wins.

## Context

Take-home interview for a **design systems engineer** role at Assembled (walkthrough Wednesday; build today + tomorrow). The task: build a real-time contact-center dashboard an ops manager keeps open all morning — **but the real deliverable is the reusable component layer underneath it** (primitives, states, tokens). Evaluation criteria, in order of weight:

1. **Component API & reuse** — clear, minimal, composable props; sensible page-vs-component boundary
2. **States & polish** — loading / empty / error / stale; hover/focus/keyboard; responsive; calm under fast-moving data
3. **Tokens, theming, consistency** — coherent token foundation, light/dark
4. **Product thinking & scope** — would a real ops manager use it; justified tradeoffs
5. **Taste & judgment with AI** — where AI was used and how it was verified

Their explicit guidance: *"a smaller, sharper system beats a sprawling half-finished one."*

**Data**: `dashboard_state.json` (95.5 KiB Notion attachment) — `current` snapshot (14:45) + `history` of 5-min ticks. Each frame: `summary` (headline stats), `queues[]` (sla_status healthy/at_risk/breached, waits, volume vs forecast, `wait_trend_sec` sparkline array), `agents[]` (state, adherence_status, durations). Narrative baked in: billing breached, vip at-risk/recovering, tier_2 healthy.

> **Discrepancy worth knowing:** the brief's prose says "two agents are currently
> out of adherence", but the shipped `current` snapshot (14:45) actually has
> **three** (Alex T., Jordan P., Omar B.) and **two** breached queues (Billing
> *and* Live Chat, with VIP at risk). The file is internally consistent —
> `summary.agents_out_of_adherence` is 3 and three agents carry
> `out_of_adherence` — so the data is right and the brief's description is
> stale. We build from the data.

No real backend needed — replaying the fixture is explicitly fine; components must be designed as if data can change, arrive late, or fail.

**Submission**: runnable repo (GitHub: `amyrlam/real-time-dashboard`, remote already configured) + running dashboard + component catalog (Storybook).

## Decisions (confirmed with Amy)

- **Vite + React + TypeScript** (client-only; no backend to justify Next)
- **Tailwind v4 + Base UI** (`@base-ui-components/react`) — shadcn-style approach: headless primitives, themed with our own tokens
- **TanStack Table** for tables (pinned to v8, `^8.21.3` — the stable, documented API; v9 resolved initially but was rolled back deliberately, worth a one-liner in the README's dependency notes); **Recharts** styled shadcn-charts-style for the area/sparkline charts
- **Storybook** as the component catalog (explicit deliverable)
- **Testing: light** — Vitest + Testing Library on the replay hook / state machine / formatting utils only
- **Simulation controls: yes** — small dev panel to pause/scrub replay and inject error/latency/stale, so live-data states are demoable in the walkthrough
- pnpm; Node 24 available

## Getting the fixture

The JSON is a Notion file block (block id `397d5706-2bc0-8018-ba47-eb526433267c` on the shared page). Click it in the Browser pane, capture the signed S3 URL via `read_network_requests`, then `curl` it to `src/data/dashboard_state.json` (or fetch it in page context and write it out). Verify it parses and matches the documented shape.

## Architecture

```
src/
  tokens/tokens.css          # CSS custom properties: color (semantic + status), spacing, radii, type scale; .dark overrides; wired into Tailwind v4 @theme
  lib/                       # formatDuration, formatDelta, cn(), types.ts (DashboardFrame, Queue, Agent, statuses)
  data/
    dashboard_state.json
    useDashboardFeed.ts      # the "live" layer (below)
  components/ui/             # the reusable primitives — the graded artifact
  features/dashboard/        # page-level composition (NOT reusable; deliberately thin)
  App.tsx
```

### Data layer: `useDashboardFeed`

A hook that simulates a metrics API and owns the connection lifecycle — this is where "changing, late, failed" data lives:

- Replays `history` frames on an interval (accelerated, e.g. 1 frame / 3–5s, looping), ending on `current`
- Returns `{ frame, status, lastUpdatedAt, controls }` where `status: 'connecting' | 'live' | 'stale' | 'error'`
- Controls: play/pause, scrub to frame, inject error, inject latency, force stale — consumed by the dev SimPanel
- Stale = no successful tick within N seconds (drives a page-level stale treatment, not per-component panic)

### Reusable primitives (`components/ui`) — keep it to ~8–10, each with stories

| Component | API sketch / notes |
|---|---|
| `StatCard` | `label, value, delta?, intent?, trend?[], loading?` — headline numbers w/ optional delta chip + micro-sparkline |
| `StatusBadge` | `status: 'healthy'\|'at_risk'\|'breached'\|...`, maps to token-driven colors; dot + label; the single source of status color |
| `Sparkline` | `data: number[], intent?, threshold?` — tiny Recharts area, no axes; threshold line for SLA target |
| `DeltaChip` | `value, direction-is-good?` — +25% over forecast is *bad*; polarity is a prop, not an assumption |
| `Duration` | `since` or `seconds`, live-ticking, `tabular-nums` — "2:55 over target", "on break 15m" |
| `DataTable` | Thin TanStack wrapper: `columns, data, rowIntent?, onRowClick?, empty?` — sorting, sticky header, keyboard focusable rows |
| `Panel` / `Card` | Titled surface w/ actions slot; the layout unit of the page |
| `EmptyState`, `ErrorState`, `Skeleton` | Consistent vacancy/failure/loading vocabulary |
| `FreshnessIndicator` | `status, lastUpdatedAt` — "Live · updated 4s ago" / stale & error treatments |

Each component: JSDoc'd props, no fetch/domain logic inside (takes data, not queue objects — with thin domain-mapping helpers at the feature layer), focus-visible styles, aria where relevant.

### Page composition (`features/dashboard`)

Attention-ordered for an ops manager's morning:

1. **Header** — title, FreshnessIndicator, theme toggle
2. **Summary row** — StatCards: SLA attainment, queues breaching/at-risk, tickets waiting, agents out of adherence
3. **Queues panel** (the centerpiece) — DataTable sorted breached → at-risk → healthy: status badge, longest wait vs target (Duration + headroom), wait sparkline w/ SLA threshold, tickets waiting, staffing (available/on-call), volume vs forecast (DeltaChip)
4. **Agents panel** — "needs attention" framing: out-of-adherence agents surfaced first with state + duration; adherent agents collapsed/secondary
5. **SimPanel** — small floating dev control (clearly labeled as a demo affordance)

Responsive: summary cards wrap; tables get column-priority/horizontal scroll at narrow widths; page usable at ~768px.

### Tokens & theming

- Semantic tiers: `--color-bg/surface/border/text-*` plus **status tokens** (`--status-healthy/at-risk/breached/info` each with subtle+strong variants) — components reference only semantic tokens
- Light + dark via `.dark` class, toggle persisted; Storybook gets a theme switcher
- Spacing/radius/type scale as tokens wired through Tailwind v4 `@theme`

## Build order

1. **Scaffold**: Vite React-TS app, Tailwind v4, Base UI, Storybook 9, Vitest; fetch fixture; commit early & often to GitHub
2. **Tokens + types + lib utils** (formatDuration etc.) with tests
3. **Primitives with stories as they're built** (StatusBadge → StatCard → Duration → Sparkline → DeltaChip → Panel → states → DataTable → FreshnessIndicator)
4. **`useDashboardFeed`** + tests (replay, stale detection, error injection)
5. **Page composition** + SimPanel + responsive pass
6. **Polish day (tomorrow)**: dark mode audit, keyboard/focus pass, a11y check (axe in Storybook), empty/error walkthrough, README
7. **README.md** — the written voiceover: product decisions & tradeoffs, component API philosophy, token system, where AI was used and how it was verified (criterion #5 — write this deliberately)
8. **StyleX beat (do regardless)**: in README's "future directions," note that the
   semantic-token layer (CSS variables) could be ported to StyleX `defineVars` for
   typed, compiler-enforced tokens — components could constrain exactly which style
   properties consumers may override, a stronger component-API contract than
   `className: string`, and attractive for AI-assisted codebases (statically
   analyzable, no invalid-class-string ambiguity). Frame as a deliberate scope call:
   not chosen here because Vite integration is Babel-plugin-based and the Base UI /
   Tailwind v4 / Storybook stack assumes CSS-variable theming.
9. **StyleX spike (only if time remains after polish)**: separate branch, restyle
   one component (StatusBadge) with StyleX to make the comparison concrete for the
   walkthrough. Timebox ~1h; abandon without merging if the build plumbing fights back.

Two design notes that make the beat land: keep the token layer strictly semantic (components never touch raw palette values) so the "portable to defineVars" claim is visibly true in the code, and keep StatusBadge free of arbitrary className passthrough styling so it's the clean spike candidate.

## Verification

- `pnpm dev` — dashboard renders the narrative (at 14:45: Billing + Live Chat breached, VIP at risk, Tier 2 healthy, 3 agents out of adherence); replay visibly ticks; SimPanel can pause / error / go stale and every state renders sanely
- `pnpm storybook` — every primitive shows all states/variants in light + dark
- `pnpm test` — hook + util tests green; `pnpm build` + `pnpm build-storybook` clean
- Browser-pane check at desktop + ~768px widths, dark + light, keyboard-only tab-through
- Fresh-clone test: clone repo to scratchpad, `pnpm i && pnpm dev` works (reviewer runs it before the walkthrough)
