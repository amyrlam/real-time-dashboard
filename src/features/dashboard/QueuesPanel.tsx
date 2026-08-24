import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '../../components/ui/DataTable'
import { Delta } from '../../components/ui/Delta'
import { Duration } from '../../components/ui/Duration'
import { EmptyState } from '../../components/ui/EmptyState'
import { Panel } from '../../components/ui/Panel'
import { Sparkline } from '../../components/ui/Sparkline'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  SLA_STATUS_INTENT,
  SLA_STATUS_LABEL,
  SLA_STATUS_RANK,
} from '../../lib/domain'
import { formatClock, formatDuration } from '../../lib/format'
import type { QueueSnapshot } from '../../lib/types'

export interface QueuesPanelProps {
  queues: QueueSnapshot[]
  loading?: boolean
}

const col = createColumnHelper<QueueSnapshot>()

/**
 * The centerpiece: every queue, worst first. Attention is carried by the
 * status column and a row wash on breached queues only — everything else
 * stays quiet so the page reads at a glance.
 */
export function QueuesPanel({ queues, loading }: QueuesPanelProps) {
  const columns = useMemo(
    () => [
      col.accessor('name', {
        id: 'queue',
        header: 'Queue',
        cell: (info) => (
          <span className="font-medium text-ink">{info.getValue()}</span>
        ),
      }),
      col.accessor('sla_status', {
        id: 'status',
        header: 'SLA status',
        sortingFn: (a, b) =>
          SLA_STATUS_RANK[a.original.sla_status] -
          SLA_STATUS_RANK[b.original.sla_status],
        cell: (info) => {
          const status = info.getValue()
          return (
            <StatusBadge size="sm" intent={SLA_STATUS_INTENT[status]}>
              {SLA_STATUS_LABEL[status]}
            </StatusBadge>
          )
        },
      }),
      col.accessor('longest_wait_sec', {
        id: 'wait',
        header: 'Longest wait',
        meta: { align: 'end' },
        cell: (info) => {
          const q = info.row.original
          const over = q.longest_wait_sec - q.sla_target_sec
          return (
            <div className="flex flex-col items-end">
              <Duration
                seconds={q.longest_wait_sec}
                variant="clock"
                intent={over > 0 ? 'breach' : undefined}
              />
              <span className="text-2xs text-ink-muted">
                {over > 0
                  ? `${formatDuration(over)} over target`
                  : `target ${formatClock(q.sla_target_sec)}`}
              </span>
            </div>
          )
        },
      }),
      col.display({
        id: 'trend',
        header: 'Wait trend',
        enableSorting: false,
        cell: (info) => {
          const q = info.row.original
          return (
            <div className="w-24 min-w-20">
              <Sparkline
                data={q.wait_trend_sec}
                intent={SLA_STATUS_INTENT[q.sla_status]}
                threshold={q.sla_target_sec}
                formatValue={(v) => `wait ${formatClock(v)}`}
                ariaLabel={`${q.name} longest-wait trend, currently ${formatDuration(q.longest_wait_sec)} against a ${formatDuration(q.sla_target_sec)} target`}
              />
            </div>
          )
        },
      }),
      col.accessor('tickets_waiting', {
        id: 'waiting',
        header: 'Waiting',
        meta: { align: 'end' },
        cell: (info) => (
          <span className="tabular-nums text-ink">{info.getValue()}</span>
        ),
      }),
      col.display({
        id: 'staffing',
        header: 'Agents',
        enableSorting: false,
        meta: { align: 'end' },
        cell: (info) => {
          const q = info.row.original
          return (
            <div className="flex flex-col items-end">
              <span className="tabular-nums text-ink">
                {q.agents_on_call} on call
              </span>
              <span
                className={
                  q.agents_available === 0
                    ? 'text-2xs font-medium text-risk-text'
                    : 'text-2xs text-ink-muted'
                }
              >
                {q.agents_available} free
              </span>
            </div>
          )
        },
      }),
      col.accessor('volume_vs_forecast_pct', {
        id: 'volume',
        header: 'Volume vs forecast',
        meta: { align: 'end' },
        cell: (info) => {
          const q = info.row.original
          return (
            <div className="flex flex-col items-end">
              <Delta
                value={q.volume_vs_forecast_pct}
                positiveIsGood={false}
                quietBand={10}
                srLabel="vs forecast"
              />
              <span className="text-2xs text-ink-muted">
                {q.volume_last_15m} in last 15m
              </span>
            </div>
          )
        },
      }),
    ],
    [],
  )

  return (
    <Panel
      title="Queues"
      subtitle="Sorted by SLA status, worst first"
      padded={false}
    >
      <DataTable
        columns={columns}
        data={queues}
        ariaLabel="Queue SLA status"
        getRowId={(q) => q.queue_id}
        loading={loading}
        loadingRows={6}
        initialSorting={[{ id: 'status', desc: false }]}
        rowIntent={(q) => (q.sla_status === 'breached' ? 'breach' : undefined)}
        empty={
          <EmptyState
            size="compact"
            title="No queues configured"
            description="Queues will appear here as soon as the feed reports them."
          />
        }
      />
    </Panel>
  )
}
