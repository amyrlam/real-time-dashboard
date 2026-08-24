/**
 * Intent is the visual vocabulary for state across the design system.
 *
 * Components take an `Intent`, not a domain status — mapping domain values
 * (e.g. `sla_status: "breached"`) to an intent happens at the page/feature
 * layer (`src/lib/domain.ts`). That keeps the primitives reusable on pages
 * that have nothing to do with SLAs.
 */
export type Intent = 'healthy' | 'risk' | 'breach' | 'info' | 'neutral'

interface IntentClasses {
  /** Contrast-safe text color on page/surface backgrounds. */
  text: string
  /** Subtle tinted fill for chips, badges, and row washes. */
  surface: string
  /** Border that reads against the tinted fill. */
  border: string
  /** Solid mark color (dots, bars, strokes). */
  accent: string
}

export const INTENT_CLASSES: Record<Intent, IntentClasses> = {
  healthy: {
    text: 'text-healthy-text',
    surface: 'bg-healthy-surface',
    border: 'border-healthy-border',
    accent: 'bg-healthy',
  },
  risk: {
    text: 'text-risk-text',
    surface: 'bg-risk-surface',
    border: 'border-risk-border',
    accent: 'bg-risk',
  },
  breach: {
    text: 'text-breach-text',
    surface: 'bg-breach-surface',
    border: 'border-breach-border',
    accent: 'bg-breach',
  },
  info: {
    text: 'text-info-text',
    surface: 'bg-info-surface',
    border: 'border-info-border',
    accent: 'bg-info',
  },
  neutral: {
    text: 'text-neutral-text',
    surface: 'bg-neutral-surface',
    border: 'border-neutral-border',
    accent: 'bg-neutral',
  },
}

/** Raw CSS variable for an intent's mark color — for SVG/chart strokes. */
export const INTENT_ACCENT_VAR: Record<Intent, string> = {
  healthy: 'var(--t-healthy-accent)',
  risk: 'var(--t-risk-accent)',
  breach: 'var(--t-breach-accent)',
  info: 'var(--t-info-accent)',
  neutral: 'var(--t-neutral-accent)',
}
