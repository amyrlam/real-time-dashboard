# Impeccable — critique & audit of the dashboard page

*2026-08-25 · [Impeccable](https://github.com/pbakaus/impeccable) v3.9.1, `critique` + `audit`, product register. Method: dual-agent (isolated design-review and detector/browser-evidence sub-agents) against the live app. A frozen snapshot, not a living doc.*

## Critique — Design Health Score 32/40 (Good)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Stale — the state most likely to mislead — changes only an 11px amber word while every number stays confident |
| 2 | Match system / real world | 3 | Raw queue IDs (`billing, tier_2`) leak into the agents table beside display names |
| 3 | User control and freedom | 3 | Reconnect/Retry present; no "reset to worst-first" after re-sorting |
| 4 | Consistency and standards | 4 | — |
| 5 | Error prevention | 3 | Read-only surface; slider correctly disabled pre-load |
| 6 | Recognition over recall | 4 | — |
| 7 | Flexibility and efficiency | 2 | No shortcuts, filtering, or queue→agent cross-link; trend values mouse-only |
| 8 | Aesthetic and minimalist | 4 | — |
| 9 | Error recovery | 4 | Banner names the failure, keeps last data, offers the fix |
| 10 | Help and documentation | 2 | Panel subtitles are good micro-docs; nothing beyond them |

**Anti-patterns verdict: PASS.** Deterministic detector: zero findings. Design review: "reads like a tool by people fluent in Linear/Stripe-grade software"; every ban checked explicitly. In-page detector reported 6, of which 4 were false positives on inspection; real residue is pervasive 11px (`text-2xs`) microcopy.

**Priority issues**

- **[P1]** Raw queue IDs in the agents table (`AgentsPanel.tsx` renders `a.queues.join(', ')`). Fix: map `queue_id → queue.name` in `domain.ts`.
- **[P1]** The freshness live region ticks every second (`FreshnessIndicator` wraps the ticking timestamp in `role="status"`; for data aged 5–60s a screen reader hears it every second). Fix: state word only in the live region; timestamp as a sibling.
- **[P2]** Stale is under-signaled: one 11px word changes; two-minute-old breach numbers look live. Fix: a quiet risk-tinted strip or dimmed panels, calmer than the error banner.
- **[P2]** Sortable headers are invisible affordances (identical to unsortable until hover). Fix: persistent low-contrast sort glyph.
- **[P3]** "On break for 0s" at tick boundaries. Fix: floor `formatDuration` to "just now".

**Persona highlights.** *Alex:* sparkline values tooltip-only; no queue→staff path. *Sam:* the two P1s; otherwise strong (`aria-sort`/`aria-expanded` verified live, sparkline `role="img"` labels excellent). *Riley:* the demo hint promises "a dropped feed errors after a few failed ticks", but dropping while paused never errors (failures only accrue on ticks); the replay loops 14:45→14:00 silently.

## Audit — 18/20 (Excellent)

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 3 | Contrast flawless (every text pair ≥4.5:1, both themes, CI-enforced); held back by the live-region tick, announced raw IDs, and 5–7px-tall focusable sparkline elements |
| 2 | Performance | 4 | No console errors; only `animate-pulse` + `transition-colors` |
| 3 | Responsive | 3 | Zero horizontal overflow at 375px; but four hidden columns' data has no mobile surface, and nothing meets 44×44 touch targets |
| 4 | Theming | 4 | Two-tier token system, test-enforced contrast; one raw `text-risk-text` bypass of the intent layer |
| 5 | Anti-patterns | 4 | Detector clean; design review pass |

**Systemic:** 11px microcopy carrying real information, and uniformly sub-44px targets — both defensible for a desktop ops tool, both worth a deliberate decision. **Keep:** the `prefers-reduced-motion` block citing WCAG 2.2.2, skeleton-not-spinner loading, the token contract enforced by `tokens.contrast.test.ts`.

## Brief alignment

Read against the Assembled brief's five evaluation axes: axis 2's "calm and legible under dense, fast-moving data" is exactly what the stale-signaling P2 threatens (old data looking calm *and* live), which argues for promoting it; axis 1's "clear, minimal, composable" prop interfaces endorses the `StatusBadge` `className` removal made after this review; axis 4 (product thinking) is where the critique's "what do I do next" question and the missing queue→agent path land.

*The critique snapshot also lives in `.impeccable/critique/` for `/impeccable polish` to consume.*
