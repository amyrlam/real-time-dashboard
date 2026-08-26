import { useState } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'
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
      // Floats over the page on desktop; on phone widths it docks into the
      // page flow after the panels instead of hovering over dead space.
      className="fixed right-4 bottom-4 z-20 w-64 rounded-lg border border-line bg-surface shadow-overlay max-sm:static max-sm:w-full max-sm:shadow-raised"
    >
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger
          // Rounding tracks the panel's corners: top always, bottom only
          // while collapsed, so the hover wash never pokes past the border.
          className="flex w-full items-center justify-between rounded-t-lg px-3 py-2 text-xs font-semibold text-ink-secondary hover:bg-hover not-data-[panel-open]:rounded-b-lg"
        >
          Demo controls
          <span aria-hidden className="text-ink-muted">
            {open ? '▾' : '▴'}
          </span>
        </Collapsible.Trigger>

        <Collapsible.Panel>
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
        </Collapsible.Panel>
      </Collapsible.Root>
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
