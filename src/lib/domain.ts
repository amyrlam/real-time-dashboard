/**
 * Domain → design-system mapping. This is the only place that knows what an
 * SLA status or agent state should look like; the UI primitives just take an
 * `Intent`. New domain concepts get mapped here, not inside components.
 */
import type { Intent } from '../components/ui/intent'
import type { AgentState, SlaStatus } from './types'

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
