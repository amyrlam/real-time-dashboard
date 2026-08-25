import { expect, test, type Page } from '@playwright/test'
import { getViolations, injectAxe } from 'axe-playwright'

/**
 * Page-level axe audit of the real dashboard.
 *
 * Why this exists alongside the Storybook axe pass: that one audits each
 * story in isolation, so it has to switch five rules off — `landmark-one-main`,
 * `region`, `page-has-heading-one`, `document-title`, `html-has-lang` —
 * because a single component rendered on a bare page can't satisfy them. Its
 * config says those are "exercised at the app level"; until this file, they
 * weren't exercised anywhere.
 *
 * The rest of what's caught here is composition. A component that is
 * flawless alone can still produce a duplicate `id` when a table renders
 * twelve of it, a heading that jumps h2 → h4 once panels are stacked, or
 * text that only fails contrast over the row wash a parent applies. Per-story
 * audits are structurally blind to all of it.
 */

/** Wait out the loading state so we audit the real page, not its skeleton. */
async function waitForData(page: Page) {
  await expect(
    page.getByRole('table', { name: 'Queue SLA status' }),
  ).toBeVisible()
  await expect(page.getByText('Billing')).toBeVisible()
}

/** Human-readable failure: axe's raw objects are unreadable in CI logs. */
function format(violations: Awaited<ReturnType<typeof getViolations>>) {
  return violations
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help}\n` +
        v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n'),
    )
    .join('\n')
}

async function auditPage(page: Page) {
  await injectAxe(page)
  const violations = await getViolations(page)
  expect(violations, `axe violations:\n${format(violations)}`).toEqual([])
}

test.describe('light theme', () => {
  test.use({ colorScheme: 'light' })

  test('the loaded dashboard has no axe violations', async ({ page }) => {
    await page.goto('/')
    await waitForData(page)
    await auditPage(page)
  })

  /**
   * The five rules the Storybook pass cannot check, asserted by name rather
   * than left to the blanket audit above — so deleting one here is a visible
   * change rather than a silent loss of the only coverage they have.
   */
  test('the document-level rules Storybook has to skip all pass', async ({
    page,
  }) => {
    await page.goto('/')
    await waitForData(page)
    await injectAxe(page)

    const violations = await getViolations(page, undefined, {
      runOnly: {
        type: 'rule',
        values: [
          'landmark-one-main',
          'region',
          'page-has-heading-one',
          'document-title',
          'html-has-lang',
        ],
      },
    })

    expect(violations, `axe violations:\n${format(violations)}`).toEqual([])
  })

  /**
   * The skeleton is a distinct DOM tree, not the loaded page with a class on
   * it, so it needs its own audit — it ships its own labelling and is what a
   * screen-reader user meets first on a cold load.
   *
   * `aria-busy` is asserted first on purpose. Without it this test would be a
   * race: today the first frame lands after `goto()` resolves, but if the
   * feed ever got faster this would quietly start auditing the *loaded* page
   * and still pass, so the skeleton would lose its only coverage silently.
   * Pinning to the busy state means that regression fails loudly instead.
   */
  test('the loading state has no axe violations', async ({ page }) => {
    await page.goto('/')

    const main = page.getByRole('main')
    await expect(main).toHaveAttribute('aria-busy', 'true')
    await expect(page.getByText('Billing')).toHaveCount(0)

    await injectAxe(page)
    const violations = await getViolations(page)
    expect(violations, `axe violations:\n${format(violations)}`).toEqual([])
  })
})

test.describe('dark theme', () => {
  test.use({ colorScheme: 'dark' })

  /**
   * Dark mode is a separate token set, so its contrast is a separate claim.
   * `tokens.contrast.test.ts` proves the maths on both themes; this proves
   * the maths survived contact with real composition.
   */
  test('the loaded dashboard has no axe violations', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await waitForData(page)
    await auditPage(page)
  })
})
