import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  // Every component gets a generated Docs page. The prop tables are built from
  // the JSDoc on each props interface, so the "why" lives next to the code.
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Design-token theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle(
        'dark',
        context.globals.theme === 'dark',
      )
      return (
        <div className="min-h-32 bg-page p-6 text-ink">
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    layout: 'fullscreen',
    // Chromatic snapshots every story at phone / tablet / desktop widths, so
    // visual regression covers responsive behavior, not just the default
    // viewport. No-op unless a CHROMATIC_PROJECT_TOKEN is configured.
    chromatic: { viewports: [375, 768, 1280] },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
