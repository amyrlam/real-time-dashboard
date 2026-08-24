import { useMemo, useState } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '../../components/ui/DataTable'
import { Duration } from '../../components/ui/Duration'
import { EmptyState } from '../../components/ui/EmptyState'
import { Panel } from '../../components/ui/Panel'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { AGENT_STATE_INTENT } from '../../lib/domain'
import { formatAgentState } from '../../lib/format'
import type { AgentSnapshot } from '../../lib/types'

export interface AgentsPanelProps {
  agents: AgentSnapshot[]
  loading?: boolean
}

const col = createColumnHelper<AgentSnapshot>()

/**
 * Agents, framed as "who needs attention": out-of-adherence agents get the
 * table; everyone on plan is collapsed into a one-line roster summary with
 * the full list behind a disclosure. An agent on break isn't a problem —
 * an agent on an unscheduled break is.
 */
export function AgentsPanel({ agents, loading }: AgentsPanelProps) {
  const [rosterOpen, setRosterOpen] = useState(false)
  const outOfAdherence = useMemo(
    () =>
      agents
        .filter((a) => a.adherence_status === 'out_of_adherence')
        .sort((a, b) => b.out_of_adherence_sec - a.out_of_adherence_sec),
    [agents],
  )
  const adherent = useMemo(
    () => agents.filter((a) => a.adherence_status === 'adherent'),
    [agents],
  )
  const stateCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of adherent) {
      counts.set(a.state, (counts.get(a.state) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [adherent])

  const columns = useMemo(
    () => [
      col.accessor('name', {
        id: 'agent',
        header: 'Agent',
        cell: (info) => {
          const a = info.row.original
          return (
            <div className="flex flex-col">
              <span className="font-medium text-ink">{a.name}</span>
              <span className="text-2xs text-ink-muted">
                {a.queues.join(', ')}
              </span>
            </div>
          )
        },
      }),
      col.accessor('state', {
        id: 'state',
        header: 'Doing now',
        cell: (info) => {
          const a = info.row.original
          return (
            <div className="flex flex-col items-start gap-0.5">
              <StatusBadge size="sm" intent={AGENT_STATE_INTENT[a.state]}>
                {formatAgentState(a.state)}
              </StatusBadge>
              <span className="text-2xs text-ink-muted">
                for <Duration seconds={a.state_duration_sec} />
              </span>
            </div>
          )
        },
      }),
      col.accessor('out_of_adherence_sec', {
        id: 'off_plan',
        header: 'Off plan for',
        meta: { align: 'end' },
        cell: (info) => (
          <Duration
            seconds={info.getValue()}
            className="font-semibold text-breach-text"
          />
        ),
      }),
    ],
    [],
  )

  return (
    <Panel
      title="Agents needing attention"
      subtitle="Scheduled one thing, doing another"
      padded={false}
    >
      <DataTable
        columns={columns}
        data={outOfAdherence}
        ariaLabel="Agents out of adherence"
        getRowId={(a) => a.agent_id}
        loading={loading}
        loadingRows={3}
        initialSorting={[{ id: 'off_plan', desc: true }]}
        empty={
          <EmptyState
            size="compact"
            title="Everyone is on plan"
            description="No agents are out of adherence right now."
          />
        }
      />

      <div className="border-t border-line px-4 py-3">
        {loading ? (
          <Skeleton className="h-4 w-48" />
        ) : (
          <Collapsible.Root open={rosterOpen} onOpenChange={setRosterOpen}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-ink-secondary">
                {adherent.length} on plan
                {stateCounts.length > 0 && (
                  <span className="text-ink-muted">
                    {' · '}
                    {stateCounts
                      .map(([state, n]) => `${n} ${formatAgentState(state).toLowerCase()}`)
                      .join(' · ')}
                  </span>
                )}
              </p>
              <Collapsible.Trigger className="rounded-md px-1.5 py-0.5 text-xs font-medium text-accent-text hover:bg-hover">
                {rosterOpen ? 'Hide roster' : 'Show all'}
              </Collapsible.Trigger>
            </div>
            <Collapsible.Panel>
              <ul className="mt-2 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                {adherent.map((a) => (
                  <li
                    key={a.agent_id}
                    className="flex items-center justify-between gap-2 border-t border-line py-1.5 text-xs"
                  >
                    <span className="truncate text-ink">{a.name}</span>
                    <span className="shrink-0 text-ink-muted">
                      {formatAgentState(a.state)} ·{' '}
                      <Duration seconds={a.state_duration_sec} />
                    </span>
                  </li>
                ))}
              </ul>
            </Collapsible.Panel>
          </Collapsible.Root>
        )}
      </div>
    </Panel>
  )
}
