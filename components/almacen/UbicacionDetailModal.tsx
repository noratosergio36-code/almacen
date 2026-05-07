'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { QrCode, Image } from 'lucide-react'
import NextImage from 'next/image'

interface UbicacionDetailModalProps {
  ubicacion: {
    id: string
    nombre: string
    articuloUbicaciones: Array<{
      cantidad: number
      articulo: { id: string; nombre: string; marca?: string | null; fotoUrl?: string | null; unidad: string }
    }>
  } | null
  open: boolean
  onClose: () => void
}

export function UbicacionDetailModal({ ubicacion, open, onClose }: UbicacionDetailModalProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)

  async function generarQR() {
    if (!ubicacion) return
    setLoadingQr(true)
    const res = await fetch(`/api/ubicaciones/${ubicacion.id}/qr`)
    if (res.ok) {
      const data = await res.json()
      setQrUrl(data.qrUrl)
    }
    setLoadingQr(false)
  }

  if (!ubicacion) return null

  return (
    <Modal open={open} onClose={onClose} title={`Ubicación ${ubicacion.nombre}`} size="lg">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={generarQR} loading={loadingQr}>
            <QrCode size={14} />
            {qrUrl ? 'Ver QR' : 'Generar QR'}
          </Button>
        </div>

        {qrUrl && (
          <div className="flex justify-center p-4 rounded-lg" style={{ background: 'white' }}>
            <NextImage src={qrUrl} alt="QR" width={200} height={200} />
          </div>
        )}

        <div className="space-y-2">
          {ubicacion.articuloUbicaciones.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Sin artículos en esta ubicación
            </p>
          ) : (
            ubicacion.articuloUbicaciones.map((au, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}>
                <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--border)' }}>
                  {au.articulo.fotoUrl ? (
                    <NextImage src={au.articulo.fotoUrl} alt="" width={40} height={40} className="rounded object-cover" />
                  ) : (
                    <Image size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{au.articulo.nombre}</p>
                  {au.articulo.marca && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{au.articulo.marca}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono-data text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {au.cantidad}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{au.articulo.unidad}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
