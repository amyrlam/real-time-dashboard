import { readFileSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import { describe, expect, it } from 'vitest'

// Read tokens.css as plain text via Node `fs`, not a Vite module import —
// `@tailwindcss/vite` intercepts `.css` imports (even with `?raw`) and
// compiles them, so a normal import here would silently return something
// that isn't the source text.
const tokensCss = readFileSync(
  resolvePath(process.cwd(), 'src/tokens/tokens.css'),
  'utf-8',
)

/**
 * Enforces WCAG AA contrast for every token combination actually used in
 * the app — parsed live from `tokens.css` so this test can't drift from the
 * source of truth. If you introduce a new text/background pairing in a
 * component (a new `-text` on a new `-surface`, a token used somewhere
 * unexpected), add it to the lists below; that's the maintenance contract.
 *
 * Thresholds (WCAG 2.1 AA):
 *   - 4.5:1 for normal text (1.4.3)
 *   - 3:1 for large text (≥18px, or ≥14px bold) and non-text UI components /
 *     graphical objects like the status dots (1.4.11) — not currently
 *     exercised here since every text pairing below is small/normal weight,
 *     but the UI_MIN constant exists for the focus ring and status marks.
 */

const TEXT_MIN = 4.5
const UI_MIN = 3

function parseThemeBlock(css: string, selector: ':root' | '.dark') {
  const re =
    selector === ':root' ? /:root\s*\{([\s\S]*?)\}/ : /\.dark\s*\{([\s\S]*?)\}/
  const match = css.match(re)
  if (!match) throw new Error(`Could not find "${selector}" block in tokens.css`)
  const map = new Map<string, string>()
  const propRe = /(--t-[\w-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = propRe.exec(match[1]))) {
    map.set(m[1], m[2].trim())
  }
  return map
}

type RGB = readonly [number, number, number]

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function parseRgba(value: string): { rgb: RGB; a: number } {
  const m = value.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/,
  )
  if (!m) throw new Error(`Unsupported color value: ${value}`)
  return {
    rgb: [Number(m[1]), Number(m[2]), Number(m[3])],
    a: m[4] === undefined ? 1 : Number(m[4]),
  }
}

/** Composite a translucent color over an opaque background (both 0-255 RGB). */
function compositeOver(fg: RGB, a: number, bg: RGB): RGB {
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
  ]
}

/** Resolve a token's raw CSS value to an opaque RGB, compositing rgba() over `base` if needed. */
function resolve(value: string, base: RGB): RGB {
  if (value.startsWith('#')) return hexToRgb(value)
  if (value.startsWith('rgba') || value.startsWith('rgb')) {
    const { rgb, a } = parseRgba(value)
    return compositeOver(rgb, a, base)
  }
  throw new Error(`Unsupported color value: ${value}`)
}

function channelLuminance(c: number) {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: RGB) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

function contrastRatio(a: RGB, b: RGB) {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const INTENTS = ['healthy', 'risk', 'breach', 'info', 'neutral'] as const

/**
 * Background names resolve against the theme's token map:
 *   - 'page' / 'surface'      → the two elevations text actually renders on
 *   - '<intent>-surface'      → an intent's tinted fill, composited over
 *     `surface` (badges, banners, and DataTable's `rowIntent` row wash all
 *     live inside a Panel/table, i.e. on top of `bg-surface`)
 */
function resolveBackground(theme: Map<string, string>, name: string): RGB {
  const surfaceRgb = hexToRgb(theme.get('--t-bg-surface')!.replace(/^#/, '#'))
  if (name === 'page') return resolve(theme.get('--t-bg-page')!, surfaceRgb)
  if (name === 'surface') return surfaceRgb
  return resolve(theme.get(`--t-${name}`)!, surfaceRgb)
}

function resolveForeground(theme: Map<string, string>, varName: string): RGB {
  // Every -text/-ink/-accent/focus-ring token is opaque hex in both themes;
  // no compositing base needed, but resolve() wants one for the rgba branch.
  return resolve(theme.get(varName)!, [0, 0, 0])
}

interface Pair {
  label: string
  fg: string
  bg: string
  min: number
}

const TEXT_PAIRS: Pair[] = [
  { label: 'ink on page', fg: '--t-ink', bg: 'page', min: TEXT_MIN },
  { label: 'ink on surface', fg: '--t-ink', bg: 'surface', min: TEXT_MIN },
  {
    label: 'ink on breach row wash (QueuesPanel)',
    fg: '--t-ink',
    bg: 'breach-surface',
    min: TEXT_MIN,
  },
  {
    label: 'ink-secondary on page (FreshnessIndicator timestamp)',
    fg: '--t-ink-secondary',
    bg: 'page',
    min: TEXT_MIN,
  },
  {
    label: 'ink-secondary on surface (labels, buttons)',
    fg: '--t-ink-secondary',
    bg: 'surface',
    min: TEXT_MIN,
  },
  { label: 'ink-muted on page', fg: '--t-ink-muted', bg: 'page', min: TEXT_MIN },
  {
    label: 'ink-muted on surface (table headers, hints, subtitles)',
    fg: '--t-ink-muted',
    bg: 'surface',
    min: TEXT_MIN,
  },
  {
    label: 'accent-text on surface (links, disclosure triggers)',
    fg: '--t-accent-text',
    bg: 'surface',
    min: TEXT_MIN,
  },
  ...INTENTS.map((intent) => ({
    label: `${intent}-text on ${intent}-surface (StatusBadge, banners, ErrorState)`,
    fg: `--t-${intent}-text`,
    bg: `${intent}-surface`,
    min: TEXT_MIN,
  })),
  // ink-muted also shows up as secondary labels inside DataTable rows that
  // DataTable's `rowIntent` can tint by any intent (today only 'breach' is
  // used, in QueuesPanel) — checked against every intent so a future
  // rowIntent={() => 'risk'} etc. doesn't silently regress.
  ...INTENTS.map((intent) => ({
    label: `ink-muted on ${intent}-surface (secondary text inside an intent-tinted row)`,
    fg: '--t-ink-muted',
    bg: `${intent}-surface`,
    min: TEXT_MIN,
  })),
]

const UI_PAIRS: Pair[] = [
  { label: 'focus ring on page', fg: '--t-focus-ring', bg: 'page', min: UI_MIN },
  { label: 'focus ring on surface', fg: '--t-focus-ring', bg: 'surface', min: UI_MIN },
  ...INTENTS.flatMap((intent) => [
    {
      label: `${intent} accent mark on page (status dots, sparkline strokes)`,
      fg: `--t-${intent}-accent`,
      bg: 'page',
      min: UI_MIN,
    },
    {
      label: `${intent} accent mark on surface`,
      fg: `--t-${intent}-accent`,
      bg: 'surface',
      min: UI_MIN,
    },
  ]),
]

describe.each([
  ['light', ':root'],
  ['dark', '.dark'],
] as const)('%s theme contrast', (_themeName, selector) => {
  const theme = parseThemeBlock(tokensCss, selector)

  it.each([...TEXT_PAIRS, ...UI_PAIRS])(
    '$label ≥ $min:1',
    ({ fg, bg, min }) => {
      const fgRgb = resolveForeground(theme, fg)
      const bgRgb = resolveBackground(theme, bg)
      const ratio = contrastRatio(fgRgb, bgRgb)
      expect(ratio).toBeGreaterThanOrEqual(min)
    },
  )
})
