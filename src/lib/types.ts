/**
 * Domain types for the dashboard metrics feed.
 *
 * These mirror the shape a metrics API would return (see
 * `src/data/dashboard_state.json`): fully aggregated, pre-computed values with
 * statuses and deltas already derived server-side. The frontend renders state;
 * it does not invent thresholds.
 */

export type SlaStatus = 'healthy' | 'at_risk' | 'breached'

export type AgentState =
  | 'available'
  | 'on_call'
  | 'on_break'
  | 'in_meeting'
  | 'offline'

export type AdherenceStatus = 'adherent' | 'out_of_adherence'

export interface QueueSnapshot {
  queue_id: string
  name: string
  sla_status: SlaStatus
  sla_target_sec: number
  longest_wait_sec: number
  /**
   * Percent over (+) or under (−) the SLA target. Present in the fixture but
   * deliberately unrendered: the UI shows absolute time over target instead,
   * because a percentage hides the size of the target it's a percentage of
   * (Billing at +46% is 55s late; Live Chat at +44% is 80s late — the smaller
   * percentage is the worse queue). See "Queues, worst first" in the README.
   */
  sla_headroom_pct: number
  tickets_waiting: number
  agents_available: number
  agents_on_call: number
  volume_last_15m: number
  volume_forecast_next_15m: number
  /** Percent over (+) or under (−) forecast. */
  volume_vs_forecast_pct: number
  /** Longest-wait trend across recent ticks, oldest → newest. */
  wait_trend_sec: number[]
}

export interface AgentSnapshot {
  agent_id: string
  name: string
  queues: string[]
  state: AgentState
  state_since: string
  state_duration_sec: number
  adherence_status: AdherenceStatus
  out_of_adherence_since: string | null
  out_of_adherence_sec: number
}

export interface SummarySnapshot {
  /** % of tickets answered within SLA, trailing 15m. */
  sla_attainment_pct: number
  queues_total: number
  queues_breaching: number
  queues_at_risk: number
  tickets_waiting_total: number
  agents_total: number
  agents_online: number
  agents_out_of_adherence: number
}

/** One tick of the feed — everything the dashboard needs to render "now". */
export interface DashboardFrame {
  ts: string
  summary: SummarySnapshot
  queues: QueueSnapshot[]
  agents: AgentSnapshot[]
}

export interface DashboardFixture {
  generated_at: string
  meta: {
    org: string
    window_start: string
    tick_interval_sec: number
    notes: string
  }
  current: DashboardFrame
  history: DashboardFrame[]
}
