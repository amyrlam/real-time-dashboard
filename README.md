# Real-time team dashboard

A real-time contact-center dashboard — the page an operations manager keeps on a
second monitor all morning — built as a small design system underneath a single
page. Take-home for Assembled.

**Live:** [dashboard](https://real-time-dashboard-eosin-three.vercel.app/) ·
[Storybook](https://real-time-dashboard-storybook.vercel.app/)

[The brief](https://assembledhq.notion.site/Take-home-interview-Real-time-dashboard-391d57062bc080e690a1ebcf49e7c7de)
is the source of truth for requirements. This README is the source of truth
for everything else — what's here, why, and what isn't.

There are deliberately no other docs. A `docs/PLAN.md` (the pre-build plan) and
a `docs/previews.md` (one-time Vercel setup) both existed; their durable parts
are folded in below and the rest is in git history. Second documents only drift.

---

## Commands

| Command | What it does |
|---|---|
| `pnpm install` | Install. pnpm version is pinned via `packageManager`. |
| `pnpm dev` | Dashboard on http://localhost:5173 |
| `pnpm storybook` | Component catalog on http://localhost:6006 |
| `pnpm build` | Production build — `tsc -b` (all three TS projects) then `vite build` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | oxlint |
| `pnpm test` | Vitest: feed lifecycle, formatting, **token contrast** |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm build-storybook` | Static Storybook into `storybook-static/` |
| `pnpm test-storybook:ci` | Serves `storybook-static/` and runs axe over every story (run `build-storybook` first) |
| `pnpm test:e2e` | Playwright: page-level axe audit + keyboard navigation (builds + serves the app itself) |

## The sample data

`src/data/dashboard_state.json` is the fixture from the brief, unmodified
(95.5 KiB): a `current` snapshot at 14:45 plus 10 history frames at 5-minute
intervals from 14:00.

It carries a deliberate arc, which is worth letting run rather than
screenshotting: calm floor until 14:10, escalation through 14:25, peak trouble
at 14:30–14:35 (3 queues breaching), then partial recovery. The "worst first"
sort visibly reorders itself as it goes.

> **One discrepancy.** The brief's prose says "two agents are currently out of
> adherence", but the `current` snapshot has **three** (Alex T., Jordan P.,
> Omar B.) and **two** breached queues (Billing and Live Chat, VIP at risk).
> The file is internally consistent — `summary.agents_out_of_adherence` is 3
> and three agents carry the status — so the data is right and the prose is
> stale. The UI is built from the data.

The page replays that feed on a timer to
simulate live ticks. The **Demo controls** panel (bottom right) exists so every
feed state is reachable during a walkthrough: scrub the replay, pause until the
data goes stale, drop the connection to see the error path, reload to see the
loading skeletons. A real deployment would ship without it.

---

## Stack

Every choice below is one I'd defend; where I'd have chosen differently at a
different scale, the note says so.

### Runtime and build

| | Version | Why this |
|---|---|---|
| **React** | 19 | — |
| **TypeScript** | ~6.0, `strict` | `noUnusedLocals`/`noUnusedParameters` on. Three project references (`app`, `node`, `e2e`) so config files and E2E specs are typechecked too, not just `src/`. |
| **Vite** | 8 | Client-only app; there's no server work here to justify Next. |
| **pnpm** | 11.15.1 | Pinned via `packageManager` so CI and local resolve identically. |

### UI and styling

| | Version | Why this |
|---|---|---|
| **Tailwind CSS** | v4 | CSS-first config: tokens are mapped in `src/index.css` under `@theme inline`, so components use semantic utilities (`bg-surface`) and never raw palette values. No `tailwind.config.js`. |
| **Base UI** | 1.7.0 | Headless behavior + accessibility semantics, styled entirely by our tokens — the shadcn-style split. Currently used for `Collapsible` (the roster disclosure). See the note below on why Base UI over Radix. |
| **clsx** | 2 | Behind `src/lib/cn.ts`. |

**Why Base UI rather than Radix.** Radix is the more familiar name, but Base UI
is the actively-maintained continuation of that lineage: its own docs describe
it as "from the creators of Radix, Material UI, and Floating UI", and several
of the engineers who originally built Radix now build Base UI, under the MUI
organization — so there's a funded team behind it. Radix's development slowed
noticeably after WorkOS acquired Modulz and much of the original team moved
on; issues on the more complex primitives sat open for long stretches. For a
dependency whose entire job is behavior and accessibility semantics — the part
you least want quietly rotting — the maintained lineage mattered more than the
familiar name. (shadcn/ui now offers Base UI alongside Radix for the same
reason.)

**On the version:** the build originally sat on `1.0.0-rc.0` of the pre-rename
package `@base-ui-components/react`. Base UI has since shipped stable, so this
is now on **1.7.0** of `@base-ui/react` — worth doing rather than demoing a
release candidate of a package that no longer exists under that name. The
upgrade touched one import line; the three CI layers plus the keyboard suite
are what made it a five-minute change instead of a leap of faith.

### Data display

| | Version | Why this |
|---|---|---|
| **TanStack Table** | **v8** (pinned) | Headless table logic. Deliberately pinned to v8: v9 resolved initially, but its reworked store API is churn I didn't need for one table pattern. Wrapped by `DataTable` so the dependency isn't spread across the app. |
| **Recharts** | 3 | Only used inside `Sparkline`; pages never touch chart internals. See the a11y note below — its defaults needed correcting. |

### Testing and quality

| | Version | Role |
|---|---|---|
| **Vitest** + **jsdom** | 4 / 30 | Unit: feed state machine, formatters, token contrast. |
| **Testing Library** | react 16, jest-dom 7, user-event 14 | Hook and DOM assertions. |
| **Playwright** | 1.62 | Real-browser E2E: page-level axe audit and keyboard navigation. |
| **Storybook** | 10 (`react-vite`, `addon-docs`) | The component catalog — an explicit deliverable, and the visual verification layer for component states. |
| **@storybook/test-runner** + **axe-playwright** | 0.24 / 2.2 | Runs axe-core over every story in headless Chromium. |
| **oxlint** | 1.75 | Rust-based linter; `react` / `typescript` / `oxc` plugins, `rules-of-hooks` as an error. Fast enough to be unnoticeable in CI. |
| **http-server**, **start-server-and-test** | | CI plumbing for the Storybook a11y job. |

### CI and deployment

- **GitHub Actions** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — three
  parallel jobs on every PR: *Lint, test, build* · *Storybook accessibility (axe)* ·
  *Page a11y + keyboard (Playwright)*.
- **Vercel** — the repo is imported as *two* projects: the dashboard
  (`pnpm build` → `dist`) and the Storybook catalog (`pnpm build-storybook` →
  `storybook-static`). Every PR therefore gets both preview URLs, so a
  reviewer can open the running page and the component catalog without
  cloning. Settings live in Vercel rather than a `vercel.json`, deliberately:
  a single root config would apply to both projects, and they need different
  build commands.

> The brief puts "production deployment, CI/CD, infra-as-code" out of scope, and
> I've held to that line: there's no deploy pipeline, no environments, no
> infra-as-code. These two are working tools rather than shipping machinery.
> CI is what keeps the accessibility claims in this README executable instead
> of asserted — it has already caught three real regressions (two contrast,
> one keyboard) that review by eye had missed. The Vercel previews mean any
> reviewer can open the dashboard *and* Storybook from a PR without cloning
> and installing. Both earned their place during the build; neither is a
> deployment story.

---

## Project structure

```
src/
  tokens/tokens.css        # the single source of truth for colour/radius/type
  tokens/tokens.contrast.test.ts
  index.css                # maps tokens into Tailwind's @theme inline
  lib/                     # cn, format, domain mapping, types, useNow, useTheme
  data/
    dashboard_state.json   # the provided fixture
    useDashboardFeed.ts    # the whole "live data" lifecycle
  components/ui/           # the reusable primitives — the graded artifact
  features/dashboard/      # page-level composition; deliberately thin
e2e/a11y.spec.ts           # axe over the assembled page, light + dark + loading
e2e/keyboard-nav.spec.ts   # tab order, focus rings, activation, reduced motion
.storybook/                # config + test-runner (axe) setup
```

The `components/ui` ↔ `features/dashboard` split is the important one:
primitives are reusable and domain-free, the feature layer knows what an
`sla_status` is. See "The component layer" below.

---

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

   **Lateness is shown in seconds, not percent** — a deliberate departure from
   the fixture, which pre-computes `sla_headroom_pct` for you. At 14:45 Billing
   is `+46%` over its target and Live Chat `+44%`: near-identical numbers that
   suggest Billing is the worse problem. In real terms Billing's oldest ticket
   is **55s** past its promise and Live Chat's is **1m 20s** — Live Chat is
   clearly worse. The percentages mislead because each is a percentage of a
   *different* deadline (46% of 2 minutes vs 44% of 3). An ops manager
   deciding where to move an agent acts on minutes a customer has been left
   waiting, so the table shows "1m 20s over target" and keeps the percentage
   out of it. The brief explicitly allows this: the pre-computed fields are
   "a suggestion, not a constraint".
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
| `Delta` | Signed change; **polarity is a prop** (`polarity="lower-is-better"`) — +25% volume is bad, +25% attainment is good — with a `quietBand` |
| `Duration` | Tabular-figure durations, `human` ("2m 55s") or `clock` ("2:55") |
| `Sparkline` | Micro area chart with optional threshold line and hover tooltip |
| `StatCard` | One headline number; composes `Delta`, has a matching skeleton |
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
- **Exactly one component has `className`: `Skeleton`.** A skeleton *is* a
  shape, so utility classes (`h-4 w-24`, `size-8 rounded-full`) are its
  natural API. Every other primitive renders one way everywhere — status
  color can't be painted over, and placement belongs to the parent layout
  (the page's own grid/flex wrappers), not to a pass-through prop.
- **Row hover is a reading aid, not an affordance.** `DataTable` body rows
  wash on hover (`bg-hover`) purely to help the eye track one line across a
  wide table — rows aren't clickable and don't pretend to be: the pointer
  cursor appears only on real controls (sort headers, buttons, disclosures).
  This is the one deliberate exception to "hover means interactive"; the full
  hover/focus vocabulary is shown, forced via the pseudo-states addon, on
  Storybook's *Foundation → Interaction states* page.
- **Renames are cheap early; ambiguity is expensive forever.** `Delta`'s
  polarity prop began as `positiveIsGood?: boolean` and was renamed to
  `polarity: 'higher-is-better' | 'lower-is-better'` — "positive" read as the
  value's sign as easily as the metric's direction, and the common call site
  was a double negative (`positiveIsGood={false}`). The enum also leaves room
  for a valence-free `'none'` without a second boolean.

## Tokens and theming

`src/tokens/tokens.css` is the single source of truth. The palette is derived
from Assembled's own brand (assembled.com): warm cream neutrals and the
near-black ink `#0b1215`, the evergreen family for "healthy", brand indigo
`#516be9` as the interactive/info voice (deliberately a different hue from the
healthy green, so actions never impersonate status), and a dark mode built
from the brand ink itself rather than a generic gray.

Five status families each ship four roles (`accent` mark, contrast-safe
`text`, tinted `surface`, `border`); every text token is contrast-checked
programmatically rather than eyeballed — see Accessibility below. Rebranding
the entire app, both themes, was a one-file change, which is the point of the
token layer.

Light and dark are the same token names redefined under `.dark`; `index.css`
maps them into Tailwind v4's `@theme inline`, so components only ever use
semantic utilities (`bg-surface`, `text-breach-text`) and are theme-agnostic
for free. Storybook has a light/dark toolbar; the app persists the choice and
applies it pre-paint (inline script in `index.html`, so there's no flash).

**Hex vs `rgba` is deliberate, not inconsistency.** Surface/border tints are
flat hex in light mode but alpha `rgba` in dark mode: dark mode's elevations
(page/surface/sunken) are far enough apart in lightness that a flat tint tuned
for one looks wrong on another, where an alpha overlay composites correctly
over all of them. The full rule is documented at the top of `tokens.css`.

## Live data as a lifecycle

`useDashboardFeed` owns the full lifecycle the components were designed
against: `connecting → live → (paused | stale → error) → recovery`. Stale is
derived from data age, error from consecutive failed ticks; the last good
frame is always retained (an ops page should degrade to "old truth, clearly
labeled" — never a blank screen). The page communicates this through one
`FreshnessIndicator` and one banner, not per-component panic. Swapping the
replay for real polling/SSE changes only this hook.

## Accessibility

Targeting **WCAG 2.1 AA**. The approach is that accessibility claims should be
executable, so most of this is enforced in CI rather than asserted here.

**Colour**
- Every text token clears 4.5:1 against every surface it can actually render
  on; marks (status dots, sparkline strokes) clear the 3:1 non-text threshold.
- Status is never carried by colour alone — `StatusBadge` always pairs the
  colour with a text label and a dot.

**Keyboard**
- One global `:focus-visible` rule in `src/index.css`, so every focusable
  element gets the same visible ring; the ring colour itself clears 3:1.
  Full-bleed targets (sort headers, the SimPanel header) flip the ring's
  offset negative so it draws inward — the adjacent scroll container or
  rounded panel would otherwise clip it.
- Every interactive element is a native `<button>` / `<input>` — no
  `div`-with-`onClick`, so activation, focus, and Enter/Space come from the
  platform rather than from re-implemented handlers.
- The full tab order, focus rings (both themes), and Enter/Space activation
  are pinned by tests that run in CI (below).

**Motion**
- A global `prefers-reduced-motion` guard in `src/index.css`. This page is
  meant to stay open all morning and the "live" dot pulses indefinitely —
  motion that starts on its own and never stops is what WCAG 2.2.2 (Level A)
  addresses. Nothing conveys meaning through motion alone, so suppressing it
  costs no information. Asserted by a test, not just declared.

**Semantics**
- `aria-sort` on sortable column headers; required `ariaLabel` props on
  `DataTable` and `Sparkline` (the type system won't let you ship an unlabeled
  one).
- `role="status"` for feed changes, `role="alert"` for the disconnect banner.
- `aria-expanded` on disclosures, via Base UI's `Collapsible`.
- `<header>`/`<main>` landmarks.

What isn't covered is listed in [Known gaps](#known-gaps) below, in one place
rather than scattered through this document.

## Testing, linting, and CI

Unit tests are scoped deliberately: the feed state machine (fake timers) and
the formatting utilities — the logic that's easy to get subtly wrong — plus
Storybook as visual verification for every component state. One is a
regression test: the hook must tolerate a `fixture` prop constructed inline on
every render (see "Where AI was used").

**Accessibility is enforced by CI in four layers**, each catching a class the
others structurally can't:

1. **Token contrast** — `src/tokens/tokens.contrast.test.ts` parses
   `tokens.css` directly (so it can't drift from the real values) and asserts
   contrast for every real text/background pairing, *including compositing* —
   e.g. secondary text inside `QueuesPanel`'s breached-row wash, not just text
   on a plain card. This caught light and dark `ink-muted` failures plus two
   status marks that landed just under 3:1, all introduced by the brand
   rebrand.
2. **axe per story** — `pnpm test-storybook:ci` runs axe-core over every story
   in headless Chromium. The rendering-level complement to the maths above:
   opacity, stacking, missing labels.
3. **axe on the assembled page** — `pnpm test:e2e`
   ([e2e/a11y.spec.ts](e2e/a11y.spec.ts)) runs axe over the real dashboard,
   light and dark, plus the loading skeleton. This is not a duplicate of
   layer 2: a per-story audit has to switch off `landmark-one-main`,
   `region`, `page-has-heading-one`, `document-title` and `html-has-lang`,
   because one component on a bare page cannot satisfy them. Those five are
   asserted here by name. Everything else it catches is composition —
   duplicate `id`s once a table renders twelve of a component, a heading
   level that jumps once panels stack, contrast that only fails over a wash
   a parent applies.
4. **Keyboard navigation** — `pnpm test:e2e`
   ([e2e/keyboard-nav.spec.ts](e2e/keyboard-nav.spec.ts)) walks the built app
   with real Tab presses. Seven tests pin: the **entire tab order** (role +
   accessible name per stop, read from Playwright's accessibility engine —
   roughly what a screen reader announces); an accessible name on every stop;
   a visible focus ring on every stop, **in both light and dark** (the ring is
   a themed token, so asserting one theme would leave half the claim
   unguarded); and Enter/Space activation with correct `aria-expanded` /
   `aria-sort`, including that the disclosure's panel content actually appears
   and not merely that its trigger's `aria-expanded` flipped; and that the
   `prefers-reduced-motion` guard actually suppresses the indefinite
   animations.

   Layer 3 exists because layers 1 and 2 both missed a real bug. Recharts
   defaults `accessibilityLayer` on, which put `tabIndex=0 role="application"`
   on every sparkline SVG: six extra unnamed tab stops per page, nested inside
   the component's own `role="img"`. Valid markup, no contrast implication, no
   axe rule — invisible to both, and obvious the moment you press Tab. Fixed
   in [`Sparkline.tsx`](src/components/ui/Sparkline.tsx), and the test was
   verified by reverting that fix and watching it fail rather than assuming it
   would.

**Linting:** oxlint with `react` / `typescript` / `oxc` plugins. It currently
reports warnings in `useDashboardFeed` (refs read during render, `Date.now()`
in render, `setState` in an effect) — these are React Compiler purity hints
that are real and worth addressing, not noise I've suppressed; they're on the
list below.

## Known gaps

Everything I know isn't covered, in one place. Three CI layers make it easy to
imply more rigour than actually exists, so this is the counterweight — the
list a reviewer would otherwise have to find by poking.

**Accessibility**

| Gap | Detail |
|---|---|
| No real screen-reader pass | The keyboard suite reads roles and names from Playwright's accessibility engine, which is a good proxy for *what would be announced* — but nobody has run VoiceOver or NVDA over this. Proxy ≠ the real thing. |
| `Sparkline` tooltip is mouse-only | Exact per-point values aren't keyboard-reachable. The trend is conveyed by the `role="img"` label. A defensible trade for a micro-chart; a full chart would need a data-table equivalent. |
| Contrast test is an enumerated list | `tokens.contrast.test.ts` checks the pairings I wrote down, not every pairing that exists. A genuinely new text-on-background combination has to be added to the list — the file says so, but it's a maintenance contract, not automatic discovery. |
| Keyboard untested at narrow widths | The suite runs one desktop viewport. Responsive behaviour down to ~768px is hand-checked only. |
| Storybook stories aren't keyboard-tested | Stories get axe (static audit); only the assembled page gets the Tab walk. |

**Testing**

| Gap | Detail |
|---|---|
| Visual regression reviews are manual | Chromatic runs in CI — every story, including the assembled `Pages/Dashboard`, snapshots at 375/768/1280px against accepted baselines. The remaining softness: diffs don't fail the build (`exitZeroOnChanges`), so a visual change ships unless someone reviews it in Chromatic. |
| Primitives have no unit tests | Unit coverage is the feed state machine, the formatters, and the tokens. Component behaviour is verified through Storybook plus the two a11y suites, which is deliberate at this size but wouldn't scale. |
| E2E is Chromium-only | One browser, one viewport. No Firefox or WebKit. |

**Code quality**

| Gap | Detail |
|---|---|
| oxlint purity warnings | `useDashboardFeed` reads refs during render, calls `Date.now()` in render, and sets state in an effect. These are real React Compiler hazards, left visible rather than suppressed. |
| `DataTable` incompatible-library warning | TanStack Table returns functions React Compiler can't memoize; flagged, not yet addressed. |

**Scale**

| Gap | Detail |
|---|---|
| No row virtualization | Fine for 6 queues and 13 agents; a floor of hundreds of agents would need it. |

**API review notes**

Smaller observations from a props audit — known, not (yet) acted on:

| Note | Detail |
|---|---|
| Unused API surface | `StatusBadge size="md"` (the default), `EmptyState size="default"`, and `ErrorState size="compact"` have no in-app call sites — fine for a system, worth knowing when reading coverage. |
| `--color-focus` unused as a utility | The token is mapped into Tailwind but the focus ring comes from the raw `:focus-visible` rule; no utility class references it. |
| `StatCard intent` is hue-only | Unlike `Duration`, the colored value gets no weight change. Both current uses pair the number with a label, so nothing is color-alone today — but the primitive doesn't enforce it. |
| Hand-rolled disconnect banner | `DashboardPage` builds the reconnect banner from raw breach tokens instead of composing `ErrorState` — candidate for a `Banner` primitive if a second one appears. |
| `SimPanel` bypasses the system | Demo-only control panel, hand-rolled; a real deployment ships without it. |

## Where AI was used, and how it was verified

Built pair-programming with Claude Code (Claude drafting, me directing scope,
stack, and product calls). The build started from a written plan — stack
decisions, component inventory, build order — agreed before any code, so the
scope calls were made deliberately rather than discovered halfway through;
that plan is in git history. Verification was layered rather than trust-based:

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
- **Claims checked against the machine, not memory**: the keyboard audit was
  done by hand first, and the automated suite then corrected *two* of its
  conclusions — a column header I'd reported as skipped was in fact a tab
  stop, and a control I'd flagged as unlabeled turned out to be correctly
  labeled by a wrapping `<label>` (my checking script was wrong, not the app).
  Both corrections are recorded in the git history rather than quietly fixed.

## If I had more time

Closing the [Known gaps](#known-gaps) comes first — starting with the
`useDashboardFeed` purity warnings. Beyond fixing what's already broken, the
things I'd *add*:

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
- Queue → agents cross-filtering (click a queue, see its staff).
- Real transport behind `useDashboardFeed` (SSE with backoff), same interface.
- A denser "wall mode" for the second monitor: larger type, no demo controls.
