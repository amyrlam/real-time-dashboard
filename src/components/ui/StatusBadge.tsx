import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { INTENT_CLASSES, type Intent } from './intent'

export interface StatusBadgeProps {
  /** Visual state. Map domain statuses to intents at the page layer. */
  intent: Intent
  /** Label text. Always required — color never carries meaning alone. */
  children: ReactNode
  /** `sm` fits dense table rows; `md` is the default chip. */
  size?: 'sm' | 'md'
  /** Hide the leading dot (e.g. when a count or icon precedes the label). */
  dot?: boolean
}

/**
 * A small tinted chip that names a state: "Breached", "On break", "Live".
 * The home of status color in the system — anything that needs to label a
 * state renders one of these rather than coloring text ad hoc. One documented
 * exception: QueuesPanel's 11px "0 free" sub-label, where a chip would be too
 * heavy (see the README's API review notes).
 */
export function StatusBadge({
  intent,
  children,
  size = 'md',
  dot = true,
}: StatusBadgeProps) {
  const c = INTENT_CLASSES[intent]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap',
        c.text,
        c.surface,
        c.border,
        size === 'sm' ? 'px-1.5 py-px text-2xs' : 'px-2 py-0.5 text-xs',
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn('size-1.5 shrink-0 rounded-full', c.accent)}
        />
      )}
      {children}
    </span>
  )
}
