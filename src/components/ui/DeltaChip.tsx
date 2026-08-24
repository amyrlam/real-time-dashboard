import { cn } from '../../lib/cn'
import { formatSignedPct } from '../../lib/format'
import { INTENT_CLASSES, type Intent } from './intent'

export interface DeltaChipProps {
  /** The delta. Positive renders ▲, negative ▼, zero a neutral dash. */
  value: number
  /**
   * Whether an increase is good news. Volume over forecast: `false`.
   * SLA attainment up: `true`. Polarity is a prop, never an assumption.
   */
  positiveIsGood?: boolean
  /** Render the value; defaults to a signed percent ("+25%"). */
  format?: (value: number) => string
  /** Screen-reader context, e.g. "vs forecast". Appended after the value. */
  srLabel?: string
  className?: string
}

/**
 * A signed change indicator: direction arrow + value, colored by whether the
 * move is good or bad (not by its sign). Text-only — designed to sit inline
 * in stat cards and table cells without adding visual weight.
 */
export function DeltaChip({
  value,
  positiveIsGood = true,
  format = formatSignedPct,
  srLabel,
  className,
}: DeltaChipProps) {
  const rounded = Math.round(value)
  const direction = rounded === 0 ? 'flat' : rounded > 0 ? 'up' : 'down'
  const good = direction === 'flat' ? null : (rounded > 0) === positiveIsGood
  const intent: Intent =
    good === null ? 'neutral' : good ? 'healthy' : 'breach'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
        INTENT_CLASSES[intent].text,
        className,
      )}
    >
      <span aria-hidden>
        {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—'}
      </span>
      {format(value)}
      {srLabel && <span className="sr-only"> {srLabel}</span>}
    </span>
  )
}
