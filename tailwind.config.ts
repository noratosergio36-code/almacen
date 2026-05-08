import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-barlow)', 'Barlow Semi Condensed', 'sans-serif'],
        body:    ['var(--font-barlow)', 'Barlow Semi Condensed', 'sans-serif'],
        mono:    ['var(--font-barlow)', 'Barlow Semi Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
