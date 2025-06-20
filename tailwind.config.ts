import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Ignore the editor's error on this line. This is the correct place for it.
  safelist: [
    {
      pattern: /prose/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
  ],
}
export default config