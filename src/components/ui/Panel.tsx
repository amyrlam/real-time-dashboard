import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface PanelProps {
  /** Panel heading. Rendered as an <h2> for page landmarks. */
  title?: ReactNode
  /** Secondary line under the title (counts, context). */
  subtitle?: ReactNode
  /** Right-aligned header slot for filters, toggles, badges. */
  actions?: ReactNode
  /** Set false when the body manages its own edge (e.g. a full-bleed table). */
  padded?: boolean
  children: ReactNode
}

/**
 * The layout unit of a page: a raised surface with an optional titled header.
 * Panels own the surface and border; content owns everything inside.
 */
export function Panel({
  title,
  subtitle,
  actions,
  padded = true,
  children,
}: PanelProps) {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-raised">
      {(title || subtitle || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
            )}
            {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      <div className={cn('min-h-0 flex-1', padded && 'p-4')}>{children}</div>
    </section>
  )
}
