import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: [
          'A pulsing placeholder block. Compose several to sketch a loading',
          'layout that matches the loaded content\'s silhouette, so nothing',
          'jumps when data arrives.',
          '',
          'Skeleton is the one primitive whose `className` is not an escape',
          'hatch but the API itself: a skeleton *is* a shape, and utility',
          'classes (`h-4 w-24`, `size-8 rounded-full`) are the most direct way',
          'to describe one. Every other primitive in the system has no',
          '`className` at all — data components render one way everywhere, and',
          'placement belongs to the parent layout.',
          '',
          'The pulse is decorative: the element is `aria-hidden`, and the',
          'animation stops under `prefers-reduced-motion` (a static block',
          'still reads as a placeholder).',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Skeleton>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { className: 'h-4 w-48' },
}

/** Sketching a stat-card silhouette: label, headline number, footnote. */
export const Silhouette: Story = {
  args: { className: 'h-4 w-24' },
  render: () => (
    <div className="flex w-48 flex-col gap-2 rounded-lg border border-line bg-surface p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="my-1 h-7 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  ),
}
