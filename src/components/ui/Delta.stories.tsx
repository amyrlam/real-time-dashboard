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
          'with `polarity`. So volume 25% *over* forecast is ▲ and red — more',
          'contacts than you staffed for — while 8% *under* forecast is ▼',
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
          '',
          '### Naming',
          '',
          'This prop began life as `positiveIsGood?: boolean` and was renamed.',
          '"Positive" was ambiguous — it read as the *sign of the value* as easily',
          'as the direction of the metric — and the common call site was a double',
          'negative (`positiveIsGood={false}` for volume). The enum reads straight',
          'at the call site, and leaves room for a future `"none"` polarity',
          '(a metric with no valence) without adding a second boolean.',
          '',
          '### Screen readers',
          '',
          'The value is real text — `format(value)` renders "+25%" into the DOM —',
          'and the arrow is `aria-hidden`, so nothing is announced twice.',
          '`srLabel` adds *context*, not content, which is why it is optional:',
          '',
          '- **Skip it** when structure already names the baseline — in a table',
          '  column whose header reads "Volume vs forecast" (headers are announced',
          '  during table navigation), or a `StatCard` whose label names the',
          '  metric. Forcing a label there would only make rows more verbose.',
          '- **Pass it** when the Delta stands alone and nothing nearby names the',
          '  comparison: `srLabel="vs forecast"`, `srLabel="since last tick"`.',
          '',
          'Known gap, on purpose: direction is in the text (the sign), but the',
          '*judgment* — good news or bad — is carried only by color. A derived',
          '`sr-only` "(better)/(worse)" suffix was considered and deferred:',
          'valence is inferable from the metric name plus the sign, and the',
          'suffix would add noise to every delta on a dense page.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Delta>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { value: 25, polarity: 'lower-is-better' },
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
      <dd><Delta value={25} polarity="lower-is-better" /></dd>
      <dt className="text-ink-secondary">SLA attainment</dt>
      <dd><Delta value={25} polarity="higher-is-better" /></dd>
      <dt className="text-ink-secondary">Volume under forecast</dt>
      <dd><Delta value={-8} polarity="lower-is-better" /></dd>
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
      <Delta value={4} polarity="lower-is-better" quietBand={10} />
      <Delta value={-6} polarity="lower-is-better" quietBand={10} />
      <Delta value={22} polarity="lower-is-better" quietBand={10} />
    </div>
  ),
}
