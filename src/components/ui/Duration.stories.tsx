import type { Meta, StoryObj } from '@storybook/react-vite'
import { Duration } from './Duration'

const meta = {
  title: 'Primitives/Duration',
  component: Duration,
  parameters: {
    docs: {
      description: {
        component: [
          'A duration with tabular figures, so a column of them stays aligned',
          'and does not jitter as values tick.',
          '',
          'Most durations are plain information and inherit the surrounding ink.',
          'When one needs flagging — a wait past its SLA target, an agent off',
          'plan — pass `intent` rather than a color class, so the judgement is a',
          "system decision instead of each panel's own.",
        ].join('\n'),
      },
    },
  },
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

/**
 * `intent` colors a duration that needs attention — and adds weight, because
 * on a dense table color alone is easy to skim past.
 */
export const Flagged: Story = {
  args: { seconds: 3723 },
  render: () => (
    <dl className="grid w-max grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
      <dt className="text-ink-secondary">within target</dt>
      <dd><Duration seconds={95} variant="clock" /></dd>
      <dt className="text-ink-secondary">nearing target</dt>
      <dd><Duration seconds={240} variant="clock" intent="risk" /></dd>
      <dt className="text-ink-secondary">past target</dt>
      <dd><Duration seconds={512} variant="clock" intent="breach" /></dd>
    </dl>
  ),
}
