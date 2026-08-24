import type { Meta, StoryObj } from '@storybook/react-vite'
import { formatClock } from '../../lib/format'
import { Sparkline } from './Sparkline'

const rising = [48, 55, 70, 88, 105, 118, 132, 150, 168, 175]
const recovering = [140, 210, 290, 310, 280, 240, 205, 180, 168, 150]
const flat = [40, 42, 39, 41, 40, 43, 41, 40, 42, 41]

const meta = {
  title: 'Primitives/Sparkline',
  component: Sparkline,
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sparkline>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    data: rising,
    intent: 'breach',
    threshold: 120,
    ariaLabel: 'Wait trend, rising past target',
  },
}

export const IntentAndShape: Story = {
  args: { data: rising, ariaLabel: '' },
  render: () => (
    <div className="flex flex-col gap-4">
      <Sparkline
        data={rising}
        intent="breach"
        threshold={120}
        formatValue={(v) => `wait ${formatClock(v)}`}
        ariaLabel="Rising past the target"
      />
      <Sparkline
        data={recovering}
        intent="risk"
        threshold={300}
        formatValue={(v) => `wait ${formatClock(v)}`}
        ariaLabel="Spiked, now recovering"
      />
      <Sparkline
        data={flat}
        intent="healthy"
        threshold={120}
        formatValue={(v) => `wait ${formatClock(v)}`}
        ariaLabel="Steady, well under target"
      />
    </div>
  ),
}

export const NoThreshold: Story = {
  args: { data: recovering, intent: 'info', ariaLabel: 'Volume trend' },
}

export const SinglePoint: Story = {
  args: {
    data: [48],
    intent: 'neutral',
    threshold: 120,
    ariaLabel: 'Trend with one sample so far',
  },
}
