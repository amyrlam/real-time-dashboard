/**
 * Formatting helpers shared across the dashboard. All output is plain text so
 * components can render it in any typographic context.
 */

/**
 * Compact duration for dense UI: "45s", "2m 55s", "1h 05m".
 * Durations on this dashboard are short (waits, breaks), so seconds are shown
 * under an hour and dropped after.
 */
export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec))
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m < 60) return s === 0 ? `${m}m` : `${m}m ${pad2(s)}s`
  const h = Math.floor(m / 60)
  return `${h}h ${pad2(m % 60)}m`
}

/** Clock-style duration for tight table cells: "0:45", "2:55", "1:02:03". */
export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`
}

/** Signed percent: "+25%", "−8%", "0%". Uses a true minus sign. */
export function formatSignedPct(pct: number): string {
  const rounded = Math.round(pct)
  if (rounded === 0) return '0%'
  return rounded > 0 ? `+${rounded}%` : `−${Math.abs(rounded)}%`
}

/** Relative time against `now`: "just now", "12s ago", "3m ago", "2h ago". */
export function formatRelativeTime(iso: string | number | Date, now: Date): string {
  const then = new Date(iso).getTime()
  const sec = Math.round((now.getTime() - then) / 1000)
  if (sec < 5) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

/** "14:45" wall-clock label (UTC) for a frame timestamp. */
export function formatTickTime(iso: string): string {
  const d = new Date(iso)
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`
}

/** Humanize an agent state id: "on_break" → "On break". */
export function formatAgentState(state: string): string {
  const label = state.replaceAll('_', ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}
