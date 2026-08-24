import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'Primitives/StatusBadge',
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { intent: 'breach', children: 'Breached' },
}

export const AllIntents: Story = {
  args: { intent: 'healthy', children: '' },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge intent="healthy">Healthy</StatusBadge>
      <StatusBadge intent="risk">At risk</StatusBadge>
      <StatusBadge intent="breach">Breached</StatusBadge>
      <StatusBadge intent="info">On call</StatusBadge>
      <StatusBadge intent="neutral">Offline</StatusBadge>
    </div>
  ),
}

export const SmallInDenseRows: Story = {
  args: { intent: 'healthy', children: '' },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge size="sm" intent="healthy">Healthy</StatusBadge>
      <StatusBadge size="sm" intent="risk">At risk</StatusBadge>
      <StatusBadge size="sm" intent="breach">Breached</StatusBadge>
    </div>
  ),
}

export const WithoutDot: Story = {
  args: { intent: 'info', children: '3 queues', dot: false },
}
