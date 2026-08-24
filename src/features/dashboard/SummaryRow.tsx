import { Delta } from '../../components/ui/Delta'
import { StatCard } from '../../components/ui/StatCard'
import type { SummarySnapshot } from '../../lib/types'

export interface SummaryRowProps {
  summary: SummarySnapshot | null
  /** Previous tick's summary, for deltas. Deltas hide when absent. */
  previous?: SummarySnapshot | null
  loading?: boolean
}

/**
 * The headline numbers an ops manager scans first: is SLA holding, how many
 * queues are on fire, how much work is queued, and who's off plan.
 */
export function SummaryRow({ summary, previous, loading }: SummaryRowProps) {
  const s = summary
  const attainmentDelta =
    s && previous ? s.sla_attainment_pct - previous.sla_attainment_pct : null
  const waitingDelta =
    s && previous
      ? s.tickets_waiting_total - previous.tickets_waiting_total
      : null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="SLA attainment"
        hint="trailing 15m"
        loading={loading}
        value={s ? `${s.sla_attainment_pct}%` : '—'}
        delta={
          attainmentDelta !== null && attainmentDelta !== 0 ? (
            <Delta
              value={attainmentDelta}
              positiveIsGood
              format={(v) => `${v > 0 ? '+' : '−'}${Math.abs(Math.round(v))}pt`}
              srLabel="since last tick"
            />
          ) : undefined
        }
      />
      <StatCard
        label="Queues breaching"
        loading={loading}
        value={s ? s.queues_breaching : '—'}
        intent={s && s.queues_breaching > 0 ? 'breach' : 'healthy'}
        hint={
          s
            ? `${s.queues_at_risk} at risk · ${s.queues_total} total`
            : undefined
        }
      />
      <StatCard
        label="Tickets waiting"
        loading={loading}
        value={s ? s.tickets_waiting_total : '—'}
        delta={
          waitingDelta !== null && waitingDelta !== 0 ? (
            <Delta
              value={waitingDelta}
              positiveIsGood={false}
              format={(v) => `${v > 0 ? '+' : '−'}${Math.abs(Math.round(v))}`}
              srLabel="since last tick"
            />
          ) : undefined
        }
        hint="across all queues"
      />
      <StatCard
        label="Out of adherence"
        loading={loading}
        value={s ? s.agents_out_of_adherence : '—'}
        intent={s && s.agents_out_of_adherence > 0 ? 'risk' : 'healthy'}
        hint={s ? `${s.agents_online} of ${s.agents_total} online` : undefined}
      />
    </div>
  )
}
