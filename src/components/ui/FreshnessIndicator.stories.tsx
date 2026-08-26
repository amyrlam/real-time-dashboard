import type { Meta, StoryObj } from '@storybook/react-vite'
import { FreshnessIndicator } from './FreshnessIndicator'

const meta = {
  title: 'Primitives/FreshnessIndicator',
  component: FreshnessIndicator,
  parameters: {
    docs: {
      description: {
        component: [
          "Tells the viewer whether they can trust what's on screen: feed",
          'state plus how old the data is.',
          '',
          'The **label** carries the state ("Live", "Paused", "Disconnected");',
          'the dot is decorative (`aria-hidden`) and redundant by design. It',
          'stays the same circle for every status on purpose — five distinct',
          'shapes at 8px would be noise, not signal, and the text two pixels',
          'away already says the word. That is also why `connecting` and',
          '`paused` render identical neutral dots: the label distinguishes',
          'them, the dot never has to.',
          '',
          "The pulse on `live` is the system's only decorative animation, and",
          'it is disabled under `prefers-reduced-motion`. The wrapper is a',
          '`role="status"` live region, so state changes ("Live" →',
          '"Disconnected") reach assistive tech politely, without',
          'interrupting.',
          '',
          'No `className` escape hatch — like Delta and Duration, this is a',
          'data-semantic primitive: it renders in one place, one way, and',
          'letting pages restyle it would fragment the one signal that must',
          'stay recognizable everywhere.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof FreshnessIndicator>
export default meta

type Story = StoryObj<typeof meta>

const secondsAgo = (s: number) => new Date(Date.now() - s * 1000)

export const Live: Story = {
  args: { status: 'live', lastUpdatedAt: secondsAgo(4) },
}

export const AllStates: Story = {
  args: { status: 'live' },
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <FreshnessIndicator status="connecting" />
      <FreshnessIndicator status="live" lastUpdatedAt={secondsAgo(4)} />
      <FreshnessIndicator status="paused" lastUpdatedAt={secondsAgo(40)} />
      <FreshnessIndicator status="stale" lastUpdatedAt={secondsAgo(95)} />
      <FreshnessIndicator status="error" lastUpdatedAt={secondsAgo(200)} />
    </div>
  ),
}
