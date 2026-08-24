import type { Meta, StoryObj } from '@storybook/react-vite'
import { FreshnessIndicator } from './FreshnessIndicator'

const meta = {
  title: 'Primitives/FreshnessIndicator',
  component: FreshnessIndicator,
} satisfies Meta<typeof FreshnessIndicator>
export default meta

type Story = StoryObj<typeof meta>

const secondsAgo = (s: number) => new Date(Date.now() - s * 1000)

export const Live: Story = {
  args: { status: 'live', lastUpdatedAt: secondsAgo(4) },
}

export const AllStates: Story = {
  args: { status: 'live' },
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <FreshnessIndicator status="connecting" />
      <FreshnessIndicator status="live" lastUpdatedAt={secondsAgo(4)} />
      <FreshnessIndicator status="paused" lastUpdatedAt={secondsAgo(40)} />
      <FreshnessIndicator status="stale" lastUpdatedAt={secondsAgo(95)} />
      <FreshnessIndicator status="error" lastUpdatedAt={secondsAgo(200)} />
    </div>
  ),
}
