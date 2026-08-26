/**
 * Domain → design-system mapping. This is the only place that knows what an
 * SLA status or agent state should look like; the UI primitives just take an
 * `Intent`. New domain concepts get mapped here, not inside components.
 */
import type { Intent } from '../components/ui/intent'
import type { AgentState, QueueSnapshot, SlaStatus } from './types'

export const SLA_STATUS_INTENT: Record<SlaStatus, Intent> = {
  healthy: 'healthy',
  at_risk: 'risk',
  breached: 'breach',
}

export const SLA_STATUS_LABEL: Record<SlaStatus, string> = {
  healthy: 'Healthy',
  at_risk: 'At risk',
  breached: 'Breached',
}

/** Sort order: worst first. */
export const SLA_STATUS_RANK: Record<SlaStatus, number> = {
  breached: 0,
  at_risk: 1,
  healthy: 2,
}

/**
 * Agent states are activities, not judgments — an agent on break might be
 * right on schedule. States render neutrally (info for active work) and
 * *adherence* carries the alarm, so the page doesn't cry wolf.
 */
export const AGENT_STATE_INTENT: Record<AgentState, Intent> = {
  available: 'healthy',
  on_call: 'info',
  on_break: 'neutral',
  in_meeting: 'neutral',
  offline: 'neutral',
}

/**
 * Floor-level volume vs forecast, derived by summing the per-queue figures —
 * the fixture's `summary` carries no aggregate, and the brief invites
 * deriving what the design needs. Null when there's nothing to divide by.
 */
export function volumeVsForecast(
  queues: QueueSnapshot[],
): { actual: number; forecast: number; pct: number } | null {
  const actual = queues.reduce((sum, q) => sum + q.volume_last_15m, 0)
  const forecast = queues.reduce(
    (sum, q) => sum + q.volume_forecast_next_15m,
    0,
  )
  if (forecast === 0) return null
  return {
    actual,
    forecast,
    pct: Math.round(((actual - forecast) / forecast) * 100),
  }
}
