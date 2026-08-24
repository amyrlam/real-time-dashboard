import type { Meta, StoryObj } from '@storybook/react-vite'

/** Renders the raw token palette so theming changes can be reviewed at a glance. */
function Swatch({ name, label }: { name: string; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="size-8 shrink-0 rounded-md border border-line"
        style={{ background: `var(${name})` }}
      />
      <code className="text-xs text-ink-secondary">{label ?? name}</code>
    </div>
  )
}

function Group({ title, names }: { title: string; names: string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {names.map((n) => (
          <Swatch key={n} name={n} />
        ))}
      </div>
    </section>
  )
}

function TokensPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Group
        title="Surfaces & lines"
        names={[
          '--t-bg-page',
          '--t-bg-surface',
          '--t-bg-sunken',
          '--t-border',
          '--t-border-strong',
          '--t-gridline',
        ]}
      />
      <Group
        title="Ink"
        names={['--t-ink', '--t-ink-secondary', '--t-ink-muted', '--t-accent']}
      />
      {(['healthy', 'risk', 'breach', 'info', 'neutral'] as const).map(
        (status) => (
          <Group
            key={status}
            title={`Status: ${status}`}
            names={[
              `--t-${status}-accent`,
              `--t-${status}-text`,
              `--t-${status}-surface`,
              `--t-${status}-border`,
            ]}
          />
        ),
      )}
    </div>
  )
}

const meta = {
  title: 'Foundation/Tokens',
  component: TokensPage,
} satisfies Meta<typeof TokensPage>
export default meta

export const Palette: StoryObj<typeof meta> = {}
