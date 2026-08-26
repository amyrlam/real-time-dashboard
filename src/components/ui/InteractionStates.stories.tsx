import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from './DataTable'

/**
 * The interactive vocabulary is deliberately small — two shared treatments,
 * owned in exactly one place each:
 *
 * - **Hover** is the `--t-bg-hover` wash (`hover:bg-hover`), the same token
 *   on every hoverable surface: buttons, disclosure triggers, sortable
 *   headers, table rows.
 * - **Focus** is one global `:focus-visible` rule (`src/index.css`) — a 2px
 *   `--t-focus-ring` outline with 2px offset. Components never declare their
 *   own focus styles, so every focusable element gets the identical ring.
 *
 * Each row below renders the same element three times, with the hover and
 * focus columns forced via the pseudo-states addon.
 */

// The same triptych markup for every element: resting, then forced hover,
// then forced focus. The pseudo-states addon targets the marker classes.
function StateRow({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr_1fr_1fr] items-center gap-x-4 border-t border-line py-3">
      <div>
        <p className="text-xs font-medium text-ink">{label}</p>
        {note && <p className="mt-0.5 text-2xs text-ink-muted">{note}</p>}
      </div>
      <div className="demo-rest min-w-0">{children}</div>
      <div className="demo-hover min-w-0">{children}</div>
      <div className="demo-focus min-w-0">{children}</div>
    </div>
  )
}

function ColumnHeadings() {
  return (
    <div className="grid grid-cols-[9rem_1fr_1fr_1fr] gap-x-4 pb-2">
      <span />
      {['Resting', 'Hover', 'Focus-visible'].map((h) => (
        <span key={h} className="text-2xs font-medium text-ink-muted uppercase">
          {h}
        </span>
      ))}
    </div>
  )
}

// A miniature real DataTable (not recreated markup), so the header and row
// treatments shown here can't drift from the component.
interface MiniRow {
  id: string
  name: string
  waiting: number
}
const col = createColumnHelper<MiniRow>()
const miniColumns = [
  col.accessor('name', { header: 'Queue' }),
  col.accessor('waiting', {
    header: 'Waiting',
    meta: { align: 'end' },
    cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
  }),
]
const miniRows: MiniRow[] = [
  { id: 'billing', name: 'Billing', waiting: 32 },
  { id: 'vip', name: 'VIP', waiting: 12 },
]

function MiniTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <DataTable
        columns={miniColumns}
        data={miniRows}
        ariaLabel="Demo queues"
        getRowId={(r) => r.id}
        initialSorting={[{ id: 'waiting', desc: true }]}
      />
    </div>
  )
}

const meta = {
  title: 'Foundation/Interaction states',
  parameters: {
    docs: {
      description: {
        component: [
          'Every hover and focus treatment in the system, side by side. Two',
          'shared treatments, owned in one place each:',
          '',
          '- **Hover** is the `--t-bg-hover` wash (`hover:bg-hover`) — the',
          '  same token on every hoverable surface. Sortable table headers add',
          '  a `hover:text-ink` lift; the wash is what keeps hover visible on',
          '  an already-sorted (already full-ink) header.',
          '- **Focus** is one global `:focus-visible` rule (`src/index.css`):',
          '  a 2px `--t-focus-ring` outline, offset 2px. Components never own',
          '  focus styles, so the ring is identical everywhere — these',
          '  canvases force it on a few element kinds only to prove the rule.',
          '',
          'The hover and focus columns are *forced* via the pseudo-states',
          'addon; nothing here is focused for real. One deliberate exception',
          'to "hover means clickable": table body rows wash on hover purely',
          'as a reading aid for tracking a line across columns — rows are not',
          'interactive.',
        ].join('\n'),
      },
    },
    // Scoped so the mini table forces one state per element kind (the sorted
    // header, the first row, one sort button) instead of every match at once.
    //
    // `rootSelector` is required here, and it must be a container that exists
    // *before* the story renders (the addon resolves it during render, and
    // nothing re-applies after mount). The addon's default docs-mode root is
    // the `story--<id>` anchor, which a docs page's *primary* story doesn't
    // get — it renders under `story--<id>--primary`, and this page's only
    // story is always the primary. The first branch matches the normal story
    // view (`#storybook-root` is `[hidden]` on docs pages), the second the
    // docs-page primary anchor; exactly one exists per view mode.
    pseudo: {
      rootSelector:
        '#storybook-root:not([hidden]), #story--foundation-interaction-states--overview--primary',
      hover: [
        '.demo-hover :is(button):not(table *)',
        '.demo-hover th:last-child button',
        '.demo-hover tbody tr:first-child',
      ],
      focusVisible: [
        '.demo-focus :is(button, input):not(table *)',
        '.demo-focus th:first-child button',
      ],
    },
  },
} satisfies Meta
export default meta

type Story = StoryObj

export const Overview: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col">
      <ColumnHeadings />

      <StateRow
        label="Secondary button"
        note="ErrorState retry, sim controls, page header actions"
      >
        <button
          type="button"
          className="rounded-md border border-line-strong bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-hover"
        >
          Retry
        </button>
      </StateRow>

      <StateRow
        label="Inline trigger"
        note="AgentsPanel roster disclosure (Base UI Collapsible)"
      >
        <button
          type="button"
          className="rounded-md px-1.5 py-0.5 text-xs font-medium text-accent-text hover:bg-hover"
        >
          Show all
        </button>
      </StateRow>

      <StateRow
        label="Panel disclosure"
        note="SimPanel “Demo controls” header (Base UI Collapsible)"
      >
        <div className="max-w-56 rounded-lg border border-line bg-surface">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary hover:bg-hover"
          >
            Demo controls
            <span aria-hidden className="text-ink-muted">
              ▴
            </span>
          </button>
        </div>
      </StateRow>

      <StateRow
        label="Range input"
        note="SimPanel replay scrubber — native control, accent-tinted"
      >
        <input
          type="range"
          defaultValue={40}
          className="w-full max-w-56 accent-(--t-accent)"
          aria-label="Replay tick"
        />
      </StateRow>

      <StateRow
        label="DataTable"
        note="Hover column: sorted-header wash + first-row reading aid. Focus column: the ring on a sort button."
      >
        <MiniTable />
      </StateRow>
    </div>
  ),
}
