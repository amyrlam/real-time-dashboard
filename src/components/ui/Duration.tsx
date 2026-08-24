import { cn } from '../../lib/cn'
import { formatClock, formatDuration } from '../../lib/format'
import { INTENT_CLASSES, type Intent } from './intent'

export interface DurationProps {
  /** Duration in seconds. */
  seconds: number
  /** `human` → "2m 55s"; `clock` → "2:55" (aligns in table columns). */
  variant?: 'human' | 'clock'
  /**
   * Colors the duration to flag it. Omit for the common case — a duration
   * that is merely information inherits the surrounding ink.
   *
   * Colored durations also render semibold: on this dashboard the only
   * reason to color one is that it needs attention, and weight is what
   * makes it findable when a table is full of them.
   */
  intent?: Intent
}

/**
 * A duration, rendered with tabular figures so columns of them align and
 * don't jitter as values tick. Static by design: durations on this dashboard
 * come pre-computed per frame, and interpolating between frames would invent
 * precision the data doesn't have.
 */
export function Duration({ seconds, variant = 'human', intent }: DurationProps) {
  return (
    <span
      className={cn(
        'tabular-nums',
        intent && [INTENT_CLASSES[intent].text, 'font-semibold'],
      )}
    >
      {variant === 'clock' ? formatClock(seconds) : formatDuration(seconds)}
    </span>
  )
}
