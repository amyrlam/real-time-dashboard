import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ErrorStateProps {
  /** What failed, in plain words: "Couldn't load queue data". */
  title: ReactNode
  /** Optional detail (error message, guidance). */
  description?: ReactNode
  /** Called when the user asks to retry; renders a Retry button when set. */
  onRetry?: () => void
  /** `compact` fits inside table bodies and small panels. */
  size?: 'compact' | 'default'
}

/**
 * The system's vocabulary for "this failed to load". Announced assertively to
 * assistive tech via `role="alert"` — an error interrupting is the point —
 * with an optional retry affordance.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  size = 'default',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'compact' ? 'gap-1 px-4 py-6' : 'gap-1.5 px-6 py-10',
      )}
    >
      <p className={cn('font-medium text-breach-text', size === 'compact' ? 'text-sm' : 'text-base')}>
        {title}
      </p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md border border-line-strong bg-surface px-3 py-1 text-sm font-medium text-ink hover:bg-hover"
        >
          Retry
        </button>
      )}
    </div>
  )
}
