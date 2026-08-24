import type { Meta, StoryObj } from '@storybook/react-vite'
import { Delta } from './Delta'
import { StatCard } from './StatCard'

const meta = {
  title: 'Primitives/StatCard',
  component: StatCard,
  decorators: [
    (Story) => (
      <div className="max-w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    label: 'SLA attainment',
    value: '86%',
    hint: 'trailing 15m',
  },
}

export const WithDelta: Story = {
  args: {
    label: 'Tickets waiting',
    value: 84,
    delta: (
      <Delta
        value={8}
        positiveIsGood={false}
        format={(v) => `+${v}`}
        srLabel="since last tick"
      />
    ),
    hint: 'across all queues',
  },
}

export const IntentValue: Story = {
  args: {
    label: 'Queues breaching',
    value: 2,
    intent: 'breach',
    hint: '1 at risk · 6 total',
  },
}

export const AllClear: Story = {
  args: {
    label: 'Out of adherence',
    value: 0,
    intent: 'healthy',
    hint: '13 of 13 online',
  },
}

export const Loading: Story = {
  args: {
    label: 'SLA attainment',
    value: '86%',
    hint: 'trailing 15m',
    loading: true,
  },
}
