import { cn } from '../../lib/cn'
import { formatSignedPct } from '../../lib/format'
import { INTENT_CLASSES, type Intent } from './intent'

export interface DeltaProps {
  /** The delta. Positive renders ▲, negative ▼, zero a neutral dash. */
  value: number
  /**
   * Whether an increase is good news. Volume over forecast: `false`.
   * SLA attainment up: `true`. Polarity is a prop, never an assumption.
   */
  positiveIsGood?: boolean
  /** Render the value; defaults to a signed percent ("+25%"). */
  format?: (value: number) => string
  /**
   * Deviations with |value| below this render in neutral ink — small moves
   * shouldn't shout on a dense page. Default 0 (color every move).
   */
  quietBand?: number
  /** Screen-reader context, e.g. "vs forecast". Appended after the value. */
  srLabel?: string
}

/**
 * A signed change indicator: direction arrow + value, colored by whether the
 * move is good or bad (not by its sign). Text-only — designed to sit inline
 * in stat cards and table cells without adding visual weight.
 */
export function Delta({
  value,
  positiveIsGood = true,
  format = formatSignedPct,
  quietBand = 0,
  srLabel,
}: DeltaProps) {
  const rounded = Math.round(value)
  const direction = rounded === 0 ? 'flat' : rounded > 0 ? 'up' : 'down'
  const quiet = direction === 'flat' || Math.abs(rounded) < quietBand
  const good = quiet ? null : (rounded > 0) === positiveIsGood
  const intent: Intent =
    good === null ? 'neutral' : good ? 'healthy' : 'breach'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
        INTENT_CLASSES[intent].text,
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
