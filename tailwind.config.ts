import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        accent: {
          primary: '#00D4FF',
          secondary: '#0099BB',
          success: '#00E676',
          warning: '#FFB300',
          danger: '#FF3D57',
          purple: '#7C4DFF',
        },
        bg: {
          primary: '#0A0C0F',
          secondary: '#111318',
          tertiary: '#1A1D24',
        },
        border: {
          DEFAULT: '#252830',
          active: '#3A3F4B',
        },
      },
    },
  },
  plugins: [],
}
export default config
