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
const meta = {
  title: 'Primitives/DataTable',
  decorators: [
    (Story) => (
      <div className="max-w-lg overflow-hidden rounded-lg border border-line bg-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta
export default meta

type Story = StoryObj<typeof meta>

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

/** A row wash marks rows that need attention — sparingly, or nothing stands out. */
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
