import type { Meta, StoryObj } from '@storybook/react-vite'
import { DeltaChip } from './DeltaChip'

const meta = {
  title: 'Primitives/DeltaChip',
  component: DeltaChip,
} satisfies Meta<typeof DeltaChip>
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { value: 25, positiveIsGood: false },
}

/** Polarity is a prop: the same +25% is bad for volume, good for attainment. */
export const PolarityMatters: Story = {
  args: { value: 25 },
  render: () => (
    <dl className="grid w-max grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
      <dt className="text-ink-secondary">Volume vs forecast</dt>
      <dd><DeltaChip value={25} positiveIsGood={false} /></dd>
      <dt className="text-ink-secondary">SLA attainment</dt>
      <dd><DeltaChip value={25} positiveIsGood /></dd>
      <dt className="text-ink-secondary">Under forecast</dt>
      <dd><DeltaChip value={-8} positiveIsGood={false} /></dd>
      <dt className="text-ink-secondary">No change</dt>
      <dd><DeltaChip value={0} /></dd>
    </dl>
  ),
}

/** Small moves inside the quiet band stay neutral so dense pages read calm. */
export const QuietBand: Story = {
  args: { value: 4 },
  render: () => (
    <div className="flex items-center gap-4">
      <DeltaChip value={4} positiveIsGood={false} quietBand={10} />
      <DeltaChip value={-6} positiveIsGood={false} quietBand={10} />
      <DeltaChip value={22} positiveIsGood={false} quietBand={10} />
    </div>
  ),
}
