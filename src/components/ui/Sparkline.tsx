import { useId } from 'react'
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts'
import { INTENT_ACCENT_VAR, type Intent } from './intent'

export interface SparklineProps {
  /** Series values, oldest → newest. */
  data: number[]
  /** Colors the stroke/fill. Match the intent of the metric it illustrates. */
  intent?: Intent
  /** Optional reference value (e.g. an SLA target) drawn as a dashed line. */
  threshold?: number
  /** Format a point's value for the hover tooltip. Defaults to `String`. */
  formatValue?: (value: number) => string
  /** Required description for screen readers, e.g. "Billing wait trend". */
  ariaLabel: string
  /** Height in pixels; the chart fills its container's width. */
  height?: number
}

/**
 * A micro area chart for a table cell or stat card: no axes, no grid, just
 * shape — with an optional threshold line and a hover tooltip for reading
 * exact values. For anything that needs axes or a legend, use a full chart.
 */
export function Sparkline({
  data,
  intent = 'neutral',
  threshold,
  formatValue = String,
  ariaLabel,
  height = 32,
}: SparklineProps) {
  const gradientId = useId()
  const color = INTENT_ACCENT_VAR[intent]
  const points = data.map((value, i) => ({ i, value }))

  // Keep both the series and the threshold in view.
  const values = threshold === undefined ? data : [...data, threshold]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min || 1) * 0.15

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ height }}
      className="w-full min-w-0"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
          // Recharts' own keyboard-nav layer defaults on (tabIndex=0,
          // role="application" on the SVG) — redundant with, and in
          // conflict with, the role="img"/aria-label static description
          // above: an "application" region can't sit inside an atomic
          // "img" without contradicting it, and there's no exposed
          // keyboard interaction here to justify the tab stop.
          accessibilityLayer={false}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          {threshold !== undefined && (
            <ReferenceLine
              y={threshold}
              stroke="var(--t-ink-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}
          <Area
            dataKey="value"
            type="monotone"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
          <Tooltip
            cursor={{ stroke: 'var(--t-border-strong)', strokeWidth: 1 }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const value = payload[0]?.value
              if (typeof value !== 'number') return null
              return (
                <div className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink shadow-overlay">
                  {formatValue(value)}
                </div>
              )
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
