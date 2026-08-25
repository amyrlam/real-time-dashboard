import { cn } from '../../lib/cn'
import { formatRelativeTime } from '../../lib/format'
import type { FeedStatus } from '../../lib/types'
import { useNow } from '../../lib/useNow'
import { INTENT_CLASSES, type Intent } from './intent'

export interface FreshnessIndicatorProps {
  /** Connection state of the data feed. */
  status: FeedStatus
  /** When data last arrived successfully. Null before the first tick. */
  lastUpdatedAt?: Date | null
}

const STATUS_META: Record<FeedStatus, { label: string; intent: Intent }> = {
  connecting: { label: 'Connecting', intent: 'neutral' },
  live: { label: 'Live', intent: 'healthy' },
  paused: { label: 'Paused', intent: 'neutral' },
  stale: { label: 'Stale', intent: 'risk' },
  error: { label: 'Disconnected', intent: 'breach' },
}

/**
 * Tells the viewer whether they can trust what's on screen: feed state plus
 * how old the data is. Announced via a polite live region so state changes
 * reach assistive tech without interrupting.
 */
export function FreshnessIndicator({
  status,
  lastUpdatedAt,
}: FreshnessIndicatorProps) {
  const now = useNow()
  const meta = STATUS_META[status]

  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-xs">
      <span
        aria-hidden
        className={cn(
          'size-2 shrink-0 rounded-full',
          INTENT_CLASSES[meta.intent].accent,
          status === 'live' && 'animate-pulse',
        )}
      />
      <span className={cn('font-medium', INTENT_CLASSES[meta.intent].text)}>
        {meta.label}
      </span>
      {lastUpdatedAt && (
        // chromatic-ignore: the relative timestamp ticks with wall-clock time,
        // so visual snapshots exclude this span rather than flake on it.
        <span className="chromatic-ignore text-ink-secondary">
          · updated {formatRelativeTime(lastUpdatedAt, now)}
        </span>
      )}
    </span>
  )
}
