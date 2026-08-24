import type { Meta, StoryObj } from '@storybook/react-vite'
import { Duration } from './Duration'

const meta = {
  title: 'Primitives/Duration',
  component: Duration,
} satisfies Meta<typeof Duration>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { seconds: 175 },
}

export const Variants: Story = {
  args: { seconds: 175 },
  render: () => (
    <dl className="grid w-max grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
      <dt className="text-ink-secondary">human, 45s</dt>
      <dd><Duration seconds={45} /></dd>
      <dt className="text-ink-secondary">human, 175s</dt>
      <dd><Duration seconds={175} /></dd>
      <dt className="text-ink-secondary">human, 3900s</dt>
      <dd><Duration seconds={3900} /></dd>
      <dt className="text-ink-secondary">clock, 175s</dt>
      <dd><Duration seconds={175} variant="clock" /></dd>
      <dt className="text-ink-secondary">clock, 3723s</dt>
      <dd><Duration seconds={3723} variant="clock" /></dd>
    </dl>
  ),
}
