'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { registrarAudit } from '@/lib/audit'

export default function PerfilPage() {
  const { data: session } = useSession()
  const [paso, setPaso] = useState<'idle' | 'token'>('idle')
  const [token, setToken] = useState('')

  async function generarToken() {
    const res = await fetch('/api/perfil/telegram-token', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setToken(data.token)
      setPaso('token')
    } else {
      toast.error('Error al generar token')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="card-industrial p-5">
        <h2 className="font-display text-lg font-semibold mb-4">Información de cuenta</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}>
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session?.user?.email}</p>
              <p className="text-xs mt-0.5 font-mono-data" style={{ color: 'var(--accent-primary)' }}>
                {(session?.user as any)?.rol}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-industrial p-5">
        <h2 className="font-display text-lg font-semibold mb-2">Vinculación con Telegram</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Vincula tu cuenta de Telegram para recibir notificaciones de inventario en tiempo real.
        </p>

        {paso === 'idle' ? (
          <Button onClick={generarToken}>Vincular Telegram</Button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--accent-primary)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                1. Abre el bot en Telegram
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                2. Envía este mensaje al bot:
              </p>
              <code className="block p-3 rounded font-mono-data text-sm"
                style={{ background: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>
                /vincular {token}
              </code>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                El token expira en 10 minutos.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setPaso('idle')}>Cancelar</Button>
          </div>
        )}
      </div>
    </div>
  )
}
