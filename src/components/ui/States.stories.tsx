import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { Skeleton } from './Skeleton'

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

/**
 * The Retry button's hover state, forced via the pseudo-states addon. Its
 * focus treatment is the global `:focus-visible` ring (`src/index.css`) —
 * components don't own focus styles — shown here on the same button.
 */
export const RetryInteractionStates: Story = {
  args: { title: '' },
  parameters: {
    pseudo: { hover: ['button'], focusVisible: ['button'] },
  },
  render: () => (
    <ErrorState
      title="Couldn't load queue data"
      description="The metrics feed didn’t respond."
      onRetry={() => {}}
    />
  ),
}

export const SkeletonBlocks: Story = {
  args: { title: '' },
  render: () => (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-4 w-full" />
    </div>
  ),
}
