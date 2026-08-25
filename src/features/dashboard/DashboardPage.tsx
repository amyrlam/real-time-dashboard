import { ErrorState } from '../../components/ui/ErrorState'
import { FreshnessIndicator } from '../../components/ui/FreshnessIndicator'
import {
  useDashboardFeed,
  type DashboardFeedOptions,
} from '../../data/useDashboardFeed'
import fixture from '../../data/dashboard_state.json'
import { useTheme } from '../../lib/useTheme'
import type { DashboardFixture } from '../../lib/types'
import { AgentsPanel } from './AgentsPanel'
import { QueuesPanel } from './QueuesPanel'
import { SimPanel } from './SimPanel'
import { SummaryRow } from './SummaryRow'

const data = fixture as DashboardFixture

/**
 * The page an ops manager keeps on a second monitor: summary numbers, queues
 * worst-first, and the agents who need a tap on the shoulder. The page owns
 * layout and feed wiring only — every visual element is a reusable primitive.
 */
export interface DashboardPageProps {
  /**
   * Feed timing overrides for stories and tests (e.g. a frozen replay for
   * visual snapshots). The app renders with the defaults.
   */
  feedOptions?: DashboardFeedOptions
}

export function DashboardPage({ feedOptions }: DashboardPageProps = {}) {
  const feed = useDashboardFeed(data, feedOptions)
  const { theme, toggle } = useTheme()

  const loading = feed.status === 'connecting'
  const frame = feed.frame

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 p-4 lg:p-6">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold text-ink">
            {data.meta.org} · Floor status
          </h1>
          <FreshnessIndicator
            status={feed.status}
            lastUpdatedAt={feed.lastUpdatedAt}
          />
        </div>
        <button
          type="button"
          onClick={toggle}
          className="rounded-md border border-line-strong bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary hover:bg-hover"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      {feed.status === 'error' && frame && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-breach-border bg-breach-surface px-4 py-2.5 text-sm text-breach-text"
        >
          <span>
            {feed.error} Showing the last data received
            {feed.lastUpdatedAt ? ' — check the connection.' : '.'}
          </span>
          <button
            type="button"
            onClick={() => feed.controls.setFailing(false)}
            className="rounded-md border border-breach-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-hover"
          >
            Reconnect
          </button>
        </div>
      )}

      {feed.status === 'error' && !frame ? (
        <div className="flex flex-1 items-center justify-center">
          <ErrorState
            title="Couldn't load the dashboard"
            description={feed.error}
            onRetry={() => {
              feed.controls.setFailing(false)
              feed.controls.reload()
            }}
          />
        </div>
      ) : (
        <main
          aria-busy={loading}
          className="flex flex-col gap-4"
        >
          <SummaryRow
            summary={frame?.summary ?? null}
            previous={feed.previousFrame?.summary ?? null}
            loading={loading}
          />
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <QueuesPanel queues={frame?.queues ?? []} loading={loading} />
            <AgentsPanel agents={frame?.agents ?? []} loading={loading} />
          </div>
        </main>
      )}

      <SimPanel feed={feed} />
    </div>
  )
}
