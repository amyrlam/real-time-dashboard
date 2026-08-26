import { Delta } from '../../components/ui/Delta'
import { StatCard } from '../../components/ui/StatCard'
import { volumeVsForecast } from '../../lib/domain'
import type { QueueSnapshot, SummarySnapshot } from '../../lib/types'

export interface SummaryRowProps {
  summary: SummarySnapshot | null
  /** Previous tick's summary, for deltas. Deltas hide when absent. */
  previous?: SummarySnapshot | null
  /**
   * Queue snapshots for the derived volume-vs-forecast headline (the fixture
   * summary carries no aggregate). The card shows "—" when absent.
   */
  queues?: QueueSnapshot[] | null
  loading?: boolean
}

/**
 * The headline numbers an ops manager scans first: is SLA holding, how many
 * queues are on fire, how much work is queued, who's off plan, and whether
 * volume is running hot against forecast.
 */
export function SummaryRow({
  summary,
  previous,
  queues,
  loading,
}: SummaryRowProps) {
  const s = summary
  const volume = queues && queues.length > 0 ? volumeVsForecast(queues) : null
  const attainmentDelta =
    s && previous ? s.sla_attainment_pct - previous.sla_attainment_pct : null
  const waitingDelta =
    s && previous
      ? s.tickets_waiting_total - previous.tickets_waiting_total
      : null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatCard
        label="SLA attainment"
        hint="trailing 15m"
        loading={loading}
        value={s ? `${s.sla_attainment_pct}%` : '—'}
        delta={
          attainmentDelta !== null && attainmentDelta !== 0 ? (
            <Delta
              value={attainmentDelta}
              polarity="higher-is-better"
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
              polarity="lower-is-better"
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
      <StatCard
        label="Volume vs forecast"
        loading={loading}
        value={
          volume
            ? `${volume.pct > 0 ? '+' : volume.pct < 0 ? '−' : ''}${Math.abs(volume.pct)}%`
            : '—'
        }
        intent={volume && volume.pct >= 10 ? 'risk' : undefined}
        hint={
          volume
            ? `${volume.actual} actual · ${volume.forecast} forecast, 15m`
            : undefined
        }
      />
    </div>
  )
}
