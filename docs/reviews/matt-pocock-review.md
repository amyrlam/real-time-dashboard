# Matt Pocock skills — code quality review

*2026-08-25 · [mattpocock/skills](https://github.com/mattpocock/skills): `code-review` (two-axis, parallel isolated sub-agents) + `improve-codebase-architecture` (with the `codebase-design` vocabulary). A frozen snapshot of the repo at review time, not a living doc.*

The branch had no diff, so the `code-review` skill's two axes were widened from "the diff" to the whole repo: the README served as the standards document (it declares itself the source of truth), and the Assembled Notion brief as the spec (fetched verbatim).

## Standards axis

**Hard violations (documented standards):**

1. **`StatusBadge` had a `className` prop** (`src/components/ui/StatusBadge.tsx`) — contradicting three README claims ("no `color`/`className` overrides on status colors"; "exactly one component has `className`: `Skeleton`"; StatusBadge "clean of ad-hoc className passthrough"). No call site used it. **Fixed: prop removed.**
2. **Ad-hoc status coloring in the feature layer** (`QueuesPanel.tsx`, staffing cell) — the "0 free" sub-label paints `text-risk-text` directly when `agents_available === 0`, the one state color that bypasses `StatusBadge` ("the single source of status color"). A badge is too heavy for an 11px sub-label. **Resolved by documenting: the README claim was reworded from "the single source of status color" to "the home of status color" with a linked exception, and a Known-gaps entry now covers the color-and-weight-only cue plus the more-than-color options (leading intent dot, text prefix, or a `StatusText` primitive).**

**Baseline smells (Fowler, *Refactoring* ch. 3 — judgement calls, documented rather than churned):**

- *Duplicated Code* — `SummaryRow.tsx:37,63`: two inline lambdas re-implement `formatSignedPct`'s shape (true-minus U+2212, plus-prefix, rounding). Fix: a `formatSigned(value, suffix)` in `format.ts`, passed through `Delta`'s existing `format` prop.
- *Duplicated Code* — `useDashboardFeed.ts`: `deliver` (96–107) and the tick effect (137–148) build the same six-field frame-advance object; the tick body is `deliver(prev.frameIndex + 1)` in disguise.
- *Mysterious Name* — `useDashboardFeed.ts:122`: `failures: 99` as a "past the error threshold" sentinel; a named constant would say what it means.
- *Duplicated Code* — `EmptyState`/`ErrorState`: identical container classes and size ternaries; a shared shell (or one component with a tone) would keep them in sync.
- *Message Chains* — `DataTable.tsx`: `cell.column.columnDef.meta?.hideBelow` walked three times; mild, confined to the designated TanStack wrapper.

Everything else held: intents-not-domain-values everywhere (`domain.ts` the only mapper), native elements throughout, the token grammar self-consistent.

## Spec axis (against the Notion brief)

**(a) Missing or partial.** Two of the brief's three mandated questions are fully met (queues healthy vs breaching; agents out of adherence). **"How is volume tracking against forecast?" is partial**: it exists only as a per-queue table column — no aggregate in `SummaryRow`'s four stats, no volume trend sparkline, and the column carries `hideBelow: 'sm'`, so below that breakpoint the question vanishes from the page. Component catalog and "public API as first-class deliverable": met.

**(b) Scope creep.** The brief puts "production deployment, CI/CD, infra-as-code" out of scope; the repo ships GitHub Actions, two Vercel projects, and Chromatic. Actions/Vercel are openly declared and argued in the README; Chromatic surfaces only in the Known-gaps table — the least-declared piece. SimPanel and the e2e suites exceed the ask but are declared (and the e2e work serves the brief's "how did you verify" axis).

**(c) Implemented but debatable.**
- *Adherence "2 vs 3":* verified — the fixture's `summary.agents_out_of_adherence` is 3 with three matching agents; the brief prose ("two agents") is stale. Building from data is the defensible call; the README documents it correctly.
- *Worst-first tie-break:* real, verified in the fixture. `QueuesPanel` sorts solely by `SLA_STATUS_RANK`; TanStack's stable sort preserves fixture order within a tier, so Billing (55s over target) renders above Live Chat (80s over) — contradicting the README's own seconds-not-percent argument. A secondary key (seconds over target, desc) inside a `compareQueuesWorstFirst` would fix it.

**(d) Brief-alignment scorecard.** ① Component API/reuse: strong. ② States & polish: strong; docked for the hidden volume column at narrow widths. ③ Tokens/theming: strongest axis. ④ Product thinking: weakest axis — one mandated question lacks headline presence, and the centerpiece ordering contradicts its own argument within a tier. ⑤ AI taste & judgment: strong (concrete verification narrative, self-reported gaps). *(Post-review: the volume-headline half of ④ — and ②'s dock — were closed by the derived summary-row card; the worst-first tie-break half of ④ remains open.)*

## Architecture axis

Full visual report: [architecture-review.html](architecture-review.html). Verdict: **deepen, don't restructure** — the feed lifecycle, `DataTable`, and the test-enforced token layer are already deep modules at real seams.

| Candidate | Strength | One-liner |
|---|---|---|
| Feed clock seam | Strong | `useDashboardFeed` creates its time dependency (`Date.now()` in render, a `staleTick` re-render counter) instead of subscribing to the `useNow` store; zero interface change, fake-timer suite is the safety net. Subsumes the oxlint purity warnings. |
| Deepen `domain.ts` into triage functions | Strong | `queueLateness`, `compareQueuesWorstFirst`, `staffingPressure`, `partitionAgents` — gives the seconds-not-percent centerpiece a test surface; also the natural home for the tie-break fix and the queue-ID→name mapping. |
| Banner primitive | Speculative | Don't build it: one banner = one adapter = a hypothetical seam. Half-step: route the disconnect banner through `INTENT_CLASSES`. |
| Signed formatter | Speculative | Return the sign policy to `format.ts` (same finding as the Standards smell above). |

Three independent reviewers converged on the same spot: the queue triage logic in `QueuesPanel` is where a standards smell, the one spec deviation, and the best architecture story meet.
