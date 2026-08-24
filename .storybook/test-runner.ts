import type { TestRunnerConfig } from '@storybook/test-runner'
import { checkA11y, injectAxe } from 'axe-playwright'

/**
 * Runs axe-core against every story in a real headless browser — the
 * complement to `src/tokens/tokens.contrast.test.ts`. The token test
 * catches contrast math from the source of truth; this catches rendering-
 * level issues the token test can't (opacity, z-index stacking, one-off
 * inline styles, missing labels) by actually painting each story and
 * inspecting the DOM.
 *
 * Runs via `pnpm test-storybook` against a built/served Storybook. See
 * `.github/workflows/ci.yml` for how it wires into CI.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page) {
    await checkA11y(page, '#storybook-root', {
      axeOptions: {
        rules: {
          // Stories render in isolation without the app's <html lang>,
          // landmark structure, or page <title> — those are exercised at
          // the app level, not per-component.
          'landmark-one-main': { enabled: false },
          region: { enabled: false },
          'page-has-heading-one': { enabled: false },
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
        },
      },
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  },
}

export default config
