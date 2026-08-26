import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface EmptyStateProps {
  /** One short line naming the vacancy: "No agents out of adherence". */
  title: ReactNode
  /** Optional second line of context or reassurance. */
  description?: ReactNode
  /** Optional action (button/link) to resolve the vacancy. */
  action?: ReactNode
  /** `compact` fits inside table bodies and small panels. */
  size?: 'compact' | 'default'
}

/**
 * The system's vocabulary for "nothing here" — deliberately calm, since on an
 * ops dashboard an empty list is usually good news.
 */
export function EmptyState({
  title,
  description,
  action,
  size = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'compact' ? 'gap-1 px-4 py-6' : 'gap-1.5 px-6 py-10',
      )}
    >
      <p className={cn('font-medium text-ink-secondary', size === 'compact' ? 'text-sm' : 'text-base')}>
        {title}
      </p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
