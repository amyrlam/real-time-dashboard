import type { Meta, StoryObj } from '@storybook/react-vite'
import { Delta } from './Delta'

const meta = {
  title: 'Primitives/Delta',
  component: Delta,
  argTypes: {
    // Docgen otherwise dumps the whole formatSignedPct source into the table.
    format: { table: { defaultValue: { summary: 'formatSignedPct' } } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          'A signed change indicator. **The arrow and the color say different',
          'things**, and that split is the whole point of the component:',
          '',
          '- The **arrow** is direction — did the number go up or down.',
          '- The **color** is judgment — is that good news or bad news.',
          '',
          'Which direction counts as good is never assumed; the caller states it',
          'with `positiveIsGood`. So volume 25% *over* forecast is ▲ and red —',
          'more contacts than you staffed for — while 8% *under* forecast is ▼',
          'and green. Same component, opposite colors, because a rising queue and',
          'a rising SLA are not the same kind of news.',
          '',
          'Two knobs on top of that: `quietBand` keeps small moves in neutral ink',
          'so a dense page stays calm, and `format` controls how the number reads',
          '(signed percent by default).',
          '',
          'There is deliberately no `className` escape hatch. The color is derived',
          'from the polarity rule above, and letting a caller paint over it would',
          'defeat the point of the component.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Delta>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { value: 25, positiveIsGood: false },
}

/**
 * Polarity is a prop: the same +25% is bad for volume, good for attainment.
 * Note the third row — it is still a *volume* metric, so a fall is green.
 * Color follows the metric's polarity, never the sign of the number.
 */
export const PolarityMatters: Story = {
  args: { value: 25 },
  render: () => (
    <dl className="grid w-max grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
      <dt className="text-ink-secondary">Volume vs forecast</dt>
      <dd><Delta value={25} positiveIsGood={false} /></dd>
      <dt className="text-ink-secondary">SLA attainment</dt>
      <dd><Delta value={25} positiveIsGood /></dd>
      <dt className="text-ink-secondary">Volume under forecast</dt>
      <dd><Delta value={-8} positiveIsGood={false} /></dd>
      <dt className="text-ink-secondary">No change</dt>
      <dd><Delta value={0} /></dd>
    </dl>
  ),
}

/** Small moves inside the quiet band stay neutral so dense pages read calm. */
export const QuietBand: Story = {
  args: { value: 4 },
  render: () => (
    <div className="flex items-center gap-4">
      <Delta value={4} positiveIsGood={false} quietBand={10} />
      <Delta value={-6} positiveIsGood={false} quietBand={10} />
      <Delta value={22} positiveIsGood={false} quietBand={10} />
    </div>
  ),
}
