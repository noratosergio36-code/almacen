'use client'

import { useTheme } from '@/components/theme/ThemeProvider'

export function useChartColors() {
  const { theme } = useTheme()
  return {
    primary:   theme === 'light' ? '#CE0037' : '#00D4FF',
    secondary: theme === 'light' ? '#2E1A47' : '#7C4DFF',
    success:   theme === 'light' ? '#1A7A4A' : '#00E676',
    warning:   theme === 'light' ? '#B36200' : '#FFB300',
    danger:    theme === 'light' ? '#CE0037' : '#FF3D57',
    grid:      theme === 'light' ? '#D5D8DD' : '#252830',
    text:      theme === 'light' ? '#827691' : '#8B9099',
  }
}
