import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel } from './Panel'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'Primitives/Panel',
  component: Panel,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Panel>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    title: 'Queues',
    subtitle: 'Sorted by SLA status, worst first',
    children: <p className="text-sm text-ink-secondary">Panel content.</p>,
  },
}

export const WithActions: Story = {
  args: {
    title: 'Agents needing attention',
    actions: <StatusBadge intent="breach">2 off plan</StatusBadge>,
    children: <p className="text-sm text-ink-secondary">Panel content.</p>,
  },
}

/** `padded={false}` lets full-bleed content (tables) own the edges. */
export const Unpadded: Story = {
  args: {
    title: 'Full-bleed content',
    padded: false,
    children: (
      <ul className="text-sm">
        {['First row', 'Second row', 'Third row'].map((r) => (
          <li key={r} className="border-b border-line px-4 py-2 last:border-b-0">
            {r}
          </li>
        ))}
      </ul>
    ),
  },
}

export const Untitled: Story = {
  args: {
    children: <p className="text-sm text-ink-secondary">Just a surface.</p>,
  },
}
