import { expect, test, type Page } from '@playwright/test'

/**
 * Keyboard-navigation contract for the dashboard.
 *
 * Why this layer exists: `src/tokens/tokens.contrast.test.ts` checks colour
 * maths, and the Storybook axe pass (`.storybook/test-runner.ts`) audits a
 * static DOM snapshot per story. Neither one *walks the page*. A charting
 * library silently shipping `tabIndex=0` on six SVGs is invisible to both —
 * it's valid markup with no contrast implication — but it's the difference
 * between a keyboard user reaching the next control in one keystroke or
 * seven. Only pressing Tab finds that. (It did: see the `accessibilityLayer`
 * comment in `src/components/ui/Sparkline.tsx`.)
 *
 * Names here come from Playwright's accessibility engine, not a hand-rolled
 * approximation — so what these tests assert is close to what a screen
 * reader actually announces.
 */

// Pin the colour scheme: the theme toggle's label ("Dark mode" / "Light
// mode") derives from `prefers-color-scheme` on first load, so an unpinned
// runner would flip the expected accessible name.
test.use({ colorScheme: 'light' })

interface Stop {
  /** `role "accessible name"`, as the a11y tree reports it. */
  label: string
  name: string
  outlineWidth: string
}

/**
 * `ariaSnapshot()` yields e.g. `- button "Dark mode"`, `- slider "Replay tick
 * 14:00 (1/10)": "0"`, or `- button "Demo controls" [expanded]`. Reduce that
 * to a stable `role "name"`.
 */
function parseAriaSnapshot(snapshot: string) {
  const match = snapshot.trim().match(/^-\s+([a-z]+)(?:\s+"((?:[^"\\]|\\.)*)")?/)
  if (!match) return { role: snapshot.trim(), name: '' }

  const role = match[1]
  // The replay slider's name embeds the live tick readout, which advances
  // while the test runs; collapse it to its stable prefix.
  const name = (match[2] ?? '').replace(/^Replay tick.*/, 'Replay tick')
  return { role, name }
}

/**
 * Press Tab repeatedly, recording each stop until focus leaves the document
 * or we hit the cap — the tab order as a keyboard user experiences it.
 */
async function collectTabOrder(page: Page, cap = 40): Promise<Stop[]> {
  const stops: Stop[] = []

  for (let i = 0; i < cap; i++) {
    await page.keyboard.press('Tab')

    const focused = page.locator(':focus')
    if ((await focused.count()) === 0) break

    const { role, name } = parseAriaSnapshot(await focused.ariaSnapshot())
    const outlineWidth = await focused.evaluate(
      (el) => getComputedStyle(el).outlineWidth,
    )

    stops.push({ label: `${role} "${name}"`, name, outlineWidth })
  }

  return stops
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Wait out the loading state so we're walking the real page.
  await expect(
    page.getByRole('table', { name: 'Queue SLA status' }),
  ).toBeVisible()
  await expect(page.getByText('Billing')).toBeVisible()
})

test('tab order reaches every control, in reading order, and nothing else', async ({
  page,
}) => {
  const stops = await collectTabOrder(page)

  // The complete keyboard experience of this page, in order. If this list
  // changes, the keyboard experience changed — review it, don't re-record it.
  expect(stops.map((s) => s.label)).toEqual([
    // Header.
    'button "Dark mode"',
    // Queues panel — sortable column headers only. "Wait trend" and "Agents"
    // are presentational and must NOT be stops; in particular each row's
    // sparkline is a static role="img", not a focusable chart widget.
    'button "Queue"',
    'button "SLA status"',
    'button "Longest wait"',
    'button "Waiting"',
    'button "Volume vs forecast"',
    // Agents panel — sortable headers, then the roster disclosure.
    'button "Agent"',
    'button "Doing now"',
    'button "Off plan for"',
    'button "Show all"',
    // Demo controls (a walkthrough affordance; would not ship).
    'button "Demo controls"',
    'slider "Replay tick"',
    'button "Pause"',
    'button "Drop feed"',
    'button "Reload"',
  ])
})

test('every tab stop has an accessible name', async ({ page }) => {
  const stops = await collectTabOrder(page)
  const unnamed = stops.filter((s) => s.name.trim() === '')

  // Guards the general rule behind the Sparkline regression: anything
  // reachable by Tab must announce itself. An unnamed stop is either a
  // missing label or — more often — something that shouldn't be focusable.
  expect(
    unnamed,
    `Focusable elements with no accessible name: ${JSON.stringify(unnamed)}`,
  ).toEqual([])
})

test('every tab stop shows a visible focus ring', async ({ page }) => {
  const stops = await collectTabOrder(page)
  const noRing = stops.filter(
    (s) => s.outlineWidth === 'none' || parseFloat(s.outlineWidth) === 0,
  )

  // Guards the single global `:focus-visible` rule in `src/index.css`.
  expect(
    noRing,
    `Tab stops with no focus outline: ${JSON.stringify(noRing)}`,
  ).toEqual([])
})

test('the roster disclosure is operable by keyboard and reports its state', async ({
  page,
}) => {
  const collapsed = page.getByRole('button', { name: 'Show all' })
  await expect(collapsed).toHaveAttribute('aria-expanded', 'false')

  // Assert the panel's *content*, not just the trigger's aria-expanded —
  // aria-expanded lives on the trigger, so it would keep flipping happily
  // even if the panel stopped rendering entirely.
  const roster = page.getByRole('listitem')
  await expect(roster).toHaveCount(0)

  await collapsed.focus()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('button', { name: 'Hide roster' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(roster.first()).toBeVisible()

  // ...and closes again with Space, the other native activation key.
  await page.keyboard.press(' ')
  await expect(page.getByRole('button', { name: 'Show all' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(roster).toHaveCount(0)
})

test('column headers sort by keyboard and expose sort state', async ({
  page,
}) => {
  const header = page.getByRole('button', { name: 'Longest wait' })
  const cell = page.getByRole('columnheader', { name: 'Longest wait' })

  await expect(cell).not.toHaveAttribute('aria-sort', /.*/)

  await header.focus()
  await page.keyboard.press('Enter')
  await expect(cell).toHaveAttribute('aria-sort', 'descending')

  await page.keyboard.press('Enter')
  await expect(cell).toHaveAttribute('aria-sort', 'ascending')
})
