import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
