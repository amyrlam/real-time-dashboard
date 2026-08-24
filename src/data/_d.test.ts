import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDashboardFeed } from './useDashboardFeed'
import type { DashboardFixture } from '../lib/types'

const frame = (i: number) => ({
  ts: '2026-05-26T14:00:00Z',
  summary: {
    sla_attainment_pct: 90 + i,
    queues_total: 1,
    queues_breaching: 0,
    queues_at_risk: 0,
    tickets_waiting_total: i,
    agents_total: 1,
    agents_online: 1,
    agents_out_of_adherence: 0,
  },
  queues: [],
  agents: [],
})
const fixture: DashboardFixture = {
  generated_at: '2026-05-26T15:00:00Z',
  meta: { org: 'Test', window_start: '2026-05-26T14:00:00Z', tick_interval_sec: 300, notes: '' },
  current: frame(2),
  history: [frame(0), frame(1), frame(2)],
}

describe('feed smoke d', () => {
  it('advances', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() =>
      useDashboardFeed(fixture, {
        tickMs: 1000, initialLatencyMs: 100, staleAfterMs: 5000, errorAfterFailures: 3,
      }),
    )
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.status).toBe('live')
    unmount()
    vi.useRealTimers()
  })
})
