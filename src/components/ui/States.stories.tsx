import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

const meta = {
  title: 'Primitives/States',
  component: EmptyState,
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-lg border border-line bg-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>
export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    title: 'No agents out of adherence',
    description: 'Good news — everyone is doing what they’re scheduled to do.',
  },
}

export const EmptyCompact: Story = {
  args: {
    title: 'No queues configured',
    size: 'compact',
  },
}

export const ErrorWithRetry: Story = {
  args: { title: '' },
  render: () => (
    <ErrorState
      title="Couldn't load queue data"
      description="The metrics feed didn’t respond."
      onRetry={() => {}}
    />
  ),
}


