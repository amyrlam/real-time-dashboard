import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FeedStatus } from '../lib/types'
import type { DashboardFixture, DashboardFrame } from '../lib/types'

export interface DashboardFeedOptions {
  /** Milliseconds between simulated ticks. */
  tickMs?: number
  /** Simulated latency for the initial load. */
  initialLatencyMs?: number
  /** Age at which delivered data is flagged stale (no successful tick). */
  staleAfterMs?: number
  /** Consecutive failed ticks before the feed reports a hard error. */
  errorAfterFailures?: number
}

export interface DashboardFeedControls {
  /** Resume replay after a pause. */
  play: () => void
  /** Stop replay; data stays on screen and ages into staleness. */
  pause: () => void
  /** Jump to a specific frame (0-based). Pauses the replay. */
  seek: (index: number) => void
  /** Simulate the metrics API failing (true) or recovering (false). */
  setFailing: (failing: boolean) => void
  /** Drop everything and re-run the initial load (shows the loading state). */
  reload: () => void
}

export interface DashboardFeed {
  /** Latest successfully delivered frame; null until the first load resolves. */
  frame: DashboardFrame | null
  /** Frame from one tick earlier — for computing deltas at the page layer. */
  previousFrame: DashboardFrame | null
  status: FeedStatus
  /** Wall-clock time of the last successful delivery. */
  lastUpdatedAt: Date | null
  /** Set when status is 'error'. */
  error: string | null
  frameIndex: number
  frameCount: number
  playing: boolean
  failing: boolean
  controls: DashboardFeedControls
}

interface FeedState {
  frame: DashboardFrame | null
  previousFrame: DashboardFrame | null
  frameIndex: number
  lastUpdatedAt: Date | null
  loading: boolean
  failures: number
  staleTick: number // bumped by a timer so staleness re-derives
}

/**
 * Simulates a live metrics feed by replaying the fixture's history on a
 * timer, looping. Owns the full connection lifecycle the UI must handle:
 * loading → live → (paused | stale → error) → recovery.
 *
 * Real-world swap: replace the interval with polling/SSE and keep the same
 * return shape — the page doesn't know the difference.
 */
export function useDashboardFeed(
  fixture: DashboardFixture,
  {
    tickMs = 4000,
    initialLatencyMs = 900,
    staleAfterMs = 15000,
    errorAfterFailures = 3,
  }: DashboardFeedOptions = {},
): DashboardFeed {
  // history's last frame === current, so history alone is the replay reel.
  // Read frames through a ref so an unstable `fixture` identity (a caller
  // constructing it inline) can't retrigger the load/tick effects each render.
  const frames = fixture.history
  const framesRef = useRef(frames)
  framesRef.current = frames

  const [state, setState] = useState<FeedState>({
    frame: null,
    previousFrame: null,
    frameIndex: -1,
    lastUpdatedAt: null,
    loading: true,
    failures: 0,
    staleTick: 0,
  })
  const [playing, setPlaying] = useState(true)
  const [failing, setFailing] = useState(false)
  const [epoch, setEpoch] = useState(0) // bump to re-run the initial load

  const failingRef = useRef(failing)
  failingRef.current = failing

  const deliver = useCallback((index: number) => {
    const fs = framesRef.current
    setState((prev) => ({
      ...prev,
      previousFrame: prev.frame,
      frame: fs[index % fs.length] ?? null,
      frameIndex: index % fs.length,
      lastUpdatedAt: new Date(),
      loading: false,
      failures: 0,
    }))
  }, [])

  // Initial load (re-runs on reload()).
  useEffect(() => {
    setState({
      frame: null,
      previousFrame: null,
      frameIndex: -1,
      lastUpdatedAt: null,
      loading: true,
      failures: 0,
      staleTick: 0,
    })
    const t = setTimeout(() => {
      if (failingRef.current) {
        setState((prev) => ({ ...prev, loading: false, failures: 99 }))
      } else {
        deliver(0)
      }
    }, initialLatencyMs)
    return () => clearTimeout(t)
  }, [deliver, initialLatencyMs, epoch])

  // Replay ticks.
  useEffect(() => {
    if (!playing || state.loading) return
    const t = setInterval(() => {
      if (failingRef.current) {
        setState((prev) => ({ ...prev, failures: prev.failures + 1 }))
      } else {
        setState((prev) => {
          const fs = framesRef.current
          const next = (prev.frameIndex + 1) % fs.length
          return {
            ...prev,
            previousFrame: prev.frame,
            frame: fs[next] ?? null,
            frameIndex: next,
            lastUpdatedAt: new Date(),
            failures: 0,
          }
        })
      }
    }, tickMs)
    return () => clearInterval(t)
  }, [playing, state.loading, tickMs])

  // Staleness clock: re-derive "how old is the data" once a second while the
  // feed isn't delivering (paused or failing).
  useEffect(() => {
    if (state.loading || state.lastUpdatedAt === null) return
    if (playing && !failing) return
    const t = setInterval(() => {
      setState((prev) => ({ ...prev, staleTick: prev.staleTick + 1 }))
    }, 1000)
    return () => clearInterval(t)
  }, [playing, failing, state.loading, state.lastUpdatedAt])

  const hardError = state.failures >= errorAfterFailures
  const dataAge = state.lastUpdatedAt
    ? Date.now() - state.lastUpdatedAt.getTime()
    : 0

  let status: FeedStatus
  if (state.loading) {
    status = 'connecting'
  } else if (hardError) {
    status = 'error'
  } else if (state.frame === null) {
    status = 'connecting'
  } else if (dataAge > staleAfterMs) {
    status = 'stale'
  } else if (!playing) {
    status = 'paused'
  } else {
    status = 'live'
  }

  const controls = useMemo<DashboardFeedControls>(
    () => ({
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      seek: (index: number) => {
        setPlaying(false)
        deliver(index)
      },
      setFailing,
      reload: () => {
        setPlaying(true)
        setEpoch((e) => e + 1)
      },
    }),
    [deliver],
  )

  return {
    frame: state.frame,
    previousFrame: state.previousFrame,
    status,
    lastUpdatedAt: state.lastUpdatedAt,
    error: hardError ? 'Lost connection to the metrics feed.' : null,
    frameIndex: state.frameIndex,
    frameCount: frames.length,
    playing,
    failing,
    controls,
  }
}
