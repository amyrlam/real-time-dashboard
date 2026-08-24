import { cn } from '../../lib/cn'
import { formatClock, formatDuration } from '../../lib/format'

export interface DurationProps {
  /** Duration in seconds. */
  seconds: number
  /** `human` → "2m 55s"; `clock` → "2:55" (aligns in table columns). */
  variant?: 'human' | 'clock'
  className?: string
}

/**
 * A duration, rendered with tabular figures so columns of them align and
 * don't jitter as values tick. Static by design: durations on this dashboard
 * come pre-computed per frame, and interpolating between frames would invent
 * precision the data doesn't have.
 */
export function Duration({ seconds, variant = 'human', className }: DurationProps) {
  return (
    <span className={cn('tabular-nums', className)}>
      {variant === 'clock' ? formatClock(seconds) : formatDuration(seconds)}
    </span>
  )
}
