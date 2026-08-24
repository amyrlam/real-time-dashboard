import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardFixture } from '../lib/types'
import { useDashboardFeed } from './useDashboardFeed'

function makeFixture(frameCount = 3): DashboardFixture {
  const frame = (i: number) => ({
    ts: `2026-05-26T14:${String(i * 5).padStart(2, '0')}:00Z`,
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
  return {
    generated_at: '2026-05-26T15:00:00Z',
    meta: {
      org: 'Test',
      window_start: '2026-05-26T14:00:00Z',
      tick_interval_sec: 300,
      notes: '',
    },
    current: frame(frameCount - 1),
    history: Array.from({ length: frameCount }, (_, i) => frame(i)),
  }
}

const OPTS = {
  tickMs: 1000,
  initialLatencyMs: 100,
  staleAfterMs: 5000,
  errorAfterFailures: 3,
}

describe('useDashboardFeed', () => {
  // Scope faking to the APIs the hook uses — faking the full set (microtasks,
  // setImmediate) can stall the test worker's own scheduling.
  beforeEach(() =>
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'],
    }),
  )
  afterEach(() => vi.useRealTimers())

  it('starts connecting, then delivers the first frame and goes live', () => {
    const fixture = makeFixture()
    const { result } = renderHook(() => useDashboardFeed(fixture, OPTS))
    expect(result.current.status).toBe('connecting')
    expect(result.current.frame).toBeNull()

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.status).toBe('live')
    expect(result.current.frameIndex).toBe(0)
    expect(result.current.lastUpdatedAt).not.toBeNull()
  })

  it('advances frames on each tick and loops at the end', () => {
    const fixture = makeFixture(3)
    const { result } = renderHook(() => useDashboardFeed(fixture, OPTS))
    act(() => vi.advanceTimersByTime(100))
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.frameIndex).toBe(1)
    expect(result.current.previousFrame?.summary.sla_attainment_pct).toBe(90)

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.frameIndex).toBe(0) // wrapped 2 → 0
  })

  it('pauses, ages into stale, and resumes live', () => {
    const fixture = makeFixture()
    const { result } = renderHook(() => useDashboardFeed(fixture, OPTS))
    act(() => vi.advanceTimersByTime(100))

    act(() => result.current.controls.pause())
    expect(result.current.status).toBe('paused')

    act(() => vi.advanceTimersByTime(6000))
    expect(result.current.status).toBe('stale')
    // Paused feed keeps showing the last frame rather than blanking.
    expect(result.current.frame).not.toBeNull()

    act(() => result.current.controls.play())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.status).toBe('live')
  })

  it('reports a hard error after consecutive failed ticks, then recovers', () => {
    const fixture = makeFixture()
    const { result } = renderHook(() => useDashboardFeed(fixture, OPTS))
    act(() => vi.advanceTimersByTime(100))

    act(() => result.current.controls.setFailing(true))
    act(() => vi.advanceTimersByTime(3000)) // 3 failed ticks
    expect(result.current.status).toBe('error')
    expect(result.current.error).toMatch(/lost connection/i)
    // The last good frame is retained for context.
    expect(result.current.frame).not.toBeNull()

    act(() => result.current.controls.setFailing(false))
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.status).toBe('live')
    expect(result.current.error).toBeNull()
  })

  it('seek jumps to a frame and pauses the replay', () => {
    const fixture = makeFixture(3)
    const { result } = renderHook(() => useDashboardFeed(fixture, OPTS))
    act(() => vi.advanceTimersByTime(100))

    act(() => result.current.controls.seek(2))
    expect(result.current.frameIndex).toBe(2)
    expect(result.current.playing).toBe(false)
  })

  it('tolerates a fixture constructed inline on every render', () => {
    // Regression: an unstable fixture identity must not retrigger the load
    // effect each render (this previously looped the hook until OOM).
    const { result } = renderHook(() => useDashboardFeed(makeFixture(), OPTS))
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.status).toBe('live')
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.frameIndex).toBe(1)
  })

  it('reload re-runs the initial load from the connecting state', () => {
    const fixture = makeFixture()
    const { result } = renderHook(() => useDashboardFeed(fixture, OPTS))
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.status).toBe('live')

    act(() => result.current.controls.reload())
    expect(result.current.status).toBe('connecting')
    expect(result.current.frame).toBeNull()

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.status).toBe('live')
  })
})
