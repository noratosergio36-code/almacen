import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'InventaPro — Control de Inventario',
  description: 'Sistema profesional de control de inventario para almacenes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-active)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
