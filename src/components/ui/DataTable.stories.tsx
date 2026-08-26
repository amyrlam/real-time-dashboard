import type { Meta, StoryObj } from '@storybook/react-vite'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { EmptyState } from './EmptyState'
import { StatusBadge } from './StatusBadge'
import type { Intent } from './intent'

interface DemoRow {
  id: string
  name: string
  status: 'ok' | 'warn' | 'down'
  waiting: number
}

const rows: DemoRow[] = [
  { id: 'billing', name: 'Billing', status: 'down', waiting: 32 },
  { id: 'vip', name: 'VIP', status: 'warn', waiting: 12 },
  { id: 'tier2', name: 'Tier 2', status: 'ok', waiting: 5 },
  { id: 'chat', name: 'Live Chat', status: 'ok', waiting: 8 },
]

const STATUS_INTENT: Record<DemoRow['status'], Intent> = {
  ok: 'healthy',
  warn: 'risk',
  down: 'breach',
}

const col = createColumnHelper<DemoRow>()
const columns = [
  col.accessor('name', { header: 'Queue' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <StatusBadge size="sm" intent={STATUS_INTENT[info.getValue()]}>
        {info.getValue()}
      </StatusBadge>
    ),
  }),
  col.accessor('waiting', {
    header: 'Waiting',
    meta: { align: 'end' },
    cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
  }),
]

// DataTable is generic, so stories use explicit render functions — Storybook's
// Meta<typeof Component> can't carry the row-type parameter through `args`.
// `component` is still set so docgen can build the Docs-page props table.
const meta = {
  title: 'Primitives/DataTable',
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component: [
          'A dense, sortable table — the workhorse of every ops page. A thin',
          'wrapper over TanStack Table: column defs stay in the caller\'s hands;',
          'this component owns rhythm, sticky header, sorting affordances, and',
          'the loading/empty states, so tables look identical across pages.',
          '',
          'It is generic over the row type, which is why these stories use',
          'explicit `render` functions instead of `args` — Storybook\'s',
          '`Meta<typeof Component>` can\'t carry the type parameter through.',
          '',
          '### Color and accessibility',
          '',
          '`rowIntent` tints a row by state — and the wash is *reinforcement*,',
          'never the only signal. The contract: the tinted state must also be',
          'named in a column. In the app, breached queues get the red wash *and*',
          'a StatusBadge reading "Breached" — the WCAG 1.4.1 pattern of color as',
          'a redundant cue. For context, TanStack Table is headless (no opinion)',
          'and AG Grid\'s built-in row highlighting is also color-only by',
          'default; the industry answer is exactly this redundant text column,',
          'so the contract is documented here rather than adding row chrome.',
          '',
          'Contrast is enforced, not hoped for: every intent-text ×',
          'intent-wash pairing (e.g. a green Delta on a red breached row) is',
          'checked at WCAG AA in both themes by `tokens.contrast.test.ts`.',
          '',
          'Each table also requires an `ariaLabel`, sortable headers carry',
          '`aria-sort`, and sort toggles are real buttons — keyboard-operable',
          'with the global focus ring.',
          '',
          '### Narrow viewports',
          '',
          'Two mechanisms, both owned by the table. Columns can declare',
          '`meta: { hideBelow: "sm" | "md" | "lg" }` so a phone shows a',
          'deliberate subset (the triage columns) instead of a truncated',
          'superset — the caller ranks its own columns, the table stays one',
          'table with no second layout. Whatever still overflows scrolls',
          'horizontally inside the table container, with a CSS-only edge fade',
          'hinting that more columns exist off-screen.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg overflow-hidden rounded-lg border border-line bg-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta
export default meta

// Not StoryObj<typeof meta>: with a generic `component`, Storybook infers the
// row type as `unknown` and demands `args` on every story. These stories are
// render-only, so the untyped StoryObj is the honest annotation.
type Story = StoryObj

export const Sortable: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={rows}
      ariaLabel="Demo queues"
      getRowId={(r) => r.id}
    />
  ),
}

/**
 * A row wash marks rows that need attention — sparingly, or nothing stands
 * out. Note the Status column: the washed row's state is also named in text
 * ("down"), so color only reinforces what the badge already says.
 */
export const RowIntent: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={rows}
      ariaLabel="Demo queues"
      getRowId={(r) => r.id}
      rowIntent={(r) => (r.status === 'down' ? 'breach' : undefined)}
      initialSorting={[{ id: 'waiting', desc: true }]}
    />
  ),
}

/**
 * Interaction states, forced via the pseudo-states addon: the first body row
 * shows its `hover:bg-hover` wash, the Status header its `hover:text-ink`
 * lift, and the Queue header's sort button the focus ring. Focus styling is
 * not per-component — one global `:focus-visible` rule (`src/index.css`)
 * paints the same 2px `--t-focus-ring` outline on every focusable element,
 * so this story demonstrates the global contract, not table-specific CSS.
 */
export const InteractionStates: Story = {
  parameters: {
    pseudo: {
      hover: ['tbody tr:first-child', 'th:nth-child(2) button'],
      focusVisible: ['th:first-child button'],
    },
  },
  render: () => (
    <DataTable
      columns={columns}
      data={rows}
      ariaLabel="Demo queues"
      getRowId={(r) => r.id}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      ariaLabel="Demo queues"
      loading
      loadingRows={4}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      ariaLabel="Demo queues"
      empty={
        <EmptyState
          size="compact"
          title="No queues configured"
          description="Rows appear as the feed reports them."
        />
      }
    />
  ),
}
