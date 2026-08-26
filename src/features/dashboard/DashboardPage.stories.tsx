import type { Meta, StoryObj } from '@storybook/react-vite'
import { DashboardPage } from './DashboardPage'

const meta = {
  title: 'Pages/Dashboard',
  component: DashboardPage,
  parameters: {
    docs: {
      description: {
        component: [
          'The assembled page, composed entirely from the primitives. It lives',
          'in Storybook for two reasons: reviewers can see the composition next',
          'to the building blocks, and Chromatic snapshots it at phone, tablet,',
          'and desktop widths — so visual regression covers the real layout,',
          'not just isolated components.',
          '',
          'The story freezes the replay (one immediate frame, no further',
          'ticks, staleness pushed out) so snapshots are deterministic; the',
          'live-updating behavior is exercised by the e2e suites instead.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof DashboardPage>
export default meta

type Story = StoryObj<typeof meta>

export const Assembled: Story = {
  args: {
    // Deterministic feed for snapshots: first frame lands immediately, the
    // next tick and the staleness threshold are effectively never.
    feedOptions: {
      initialLatencyMs: 0,
      tickMs: 3_600_000,
      staleAfterMs: 3_600_000,
    },
  },
}
