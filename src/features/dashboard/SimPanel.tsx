import { useState } from 'react'
import { cn } from '../../lib/cn'
import { formatTickTime } from '../../lib/format'
import type { DashboardFeed } from '../../data/useDashboardFeed'

/**
 * Demo-only controls for the simulated feed: scrub the replay, drop the
 * connection, reload. This exists so every feed state is reachable during a
 * walkthrough — a real deployment would ship without it.
 */
export function SimPanel({ feed }: { feed: DashboardFeed }) {
  const [open, setOpen] = useState(true)

  return (
    <aside
      aria-label="Demo controls"
      className="fixed right-4 bottom-4 z-20 w-64 rounded-lg border border-line bg-surface shadow-overlay"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-ink-secondary"
      >
        Demo controls
        <span aria-hidden className="text-ink-muted">
          {open ? '▾' : '▴'}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-3 py-3">
          <label className="flex flex-col gap-1 text-xs text-ink-secondary">
            <span>
              Replay tick{' '}
              <span className="tabular-nums text-ink-muted">
                {feed.frame ? formatTickTime(feed.frame.ts) : '—'} (
                {feed.frameIndex + 1}/{feed.frameCount})
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, feed.frameCount - 1)}
              value={Math.max(0, feed.frameIndex)}
              onChange={(e) => feed.controls.seek(Number(e.target.value))}
              disabled={feed.frame === null}
              className="accent-(--t-accent)"
            />
          </label>

          <div className="flex flex-wrap gap-1.5">
            <SimButton
              onClick={() =>
                feed.playing ? feed.controls.pause() : feed.controls.play()
              }
            >
              {feed.playing ? 'Pause' : 'Play'}
            </SimButton>
            <SimButton
              active={feed.failing}
              onClick={() => feed.controls.setFailing(!feed.failing)}
            >
              {feed.failing ? 'Restore feed' : 'Drop feed'}
            </SimButton>
            <SimButton onClick={() => feed.controls.reload()}>
              Reload
            </SimButton>
          </div>

          <p className="text-2xs text-ink-muted">
            Pause long enough and the data goes stale; a dropped feed errors
            after a few failed ticks.
          </p>
        </div>
      )}
    </aside>
  )
}

function SimButton({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-breach-border bg-breach-surface text-breach-text'
          : 'border-line-strong bg-surface text-ink hover:bg-hover',
      )}
    >
      {children}
    </button>
  )
}
