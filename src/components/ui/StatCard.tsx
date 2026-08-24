import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { INTENT_CLASSES, type Intent } from './intent'
import { Skeleton } from './Skeleton'

export interface StatCardProps {
  /** What the number is: "SLA attainment". */
  label: ReactNode
  /** The headline value. Pre-formatted — the card does not format numbers. */
  value: ReactNode
  /** Optional change indicator; compose a <DeltaChip> here. */
  delta?: ReactNode
  /** Optional footnote under the value: "trailing 15m". */
  hint?: ReactNode
  /**
   * Colors the value when the number itself is a state (e.g. breaching
   * count > 0). Omit for plain metrics — most numbers should stay ink.
   */
  intent?: Intent
  /** Render a skeleton with the same silhouette while data loads. */
  loading?: boolean
  className?: string
}

/**
 * A headline number for the top of a page. One stat, one card — trends and
 * breakdowns belong in panels below, not crammed in here.
 */
export function StatCard({
  label,
  value,
  delta,
  hint,
  intent,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg border border-line bg-surface px-4 py-3 shadow-raised',
        className,
      )}
    >
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      {loading ? (
        <Skeleton className="my-1 h-7 w-20" />
      ) : (
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-2xl font-semibold tabular-nums',
              intent ? INTENT_CLASSES[intent].text : 'text-ink',
            )}
          >
            {value}
          </span>
          {delta}
        </span>
      )}
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
  )
}
