'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { QrCode, Image, Plus, Trash2, Bookmark, ArrowLeftRight } from 'lucide-react'
import NextImage from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { addDays } from 'date-fns'
import { MoverComponenteModal } from './MoverComponenteModal'

interface ArticuloNivel {
  cantidad: number
  apartadoReservado: number
  articulo: { id: string; nombre: string; marca?: string | null; fotoUrl?: string | null; unidad: string }
}

interface Nivel {
  id: string
  nombre: string
  numero: number
  articuloNiveles: ArticuloNivel[]
}

interface Proyecto { id: string; nombre: string }

interface UbicacionDetailModalProps {
  ubicacion: {
    id: string
    nombre: string
    niveles: Nivel[]
  } | null
  open: boolean
  onClose: () => void
  onRefresh?: () => void
}

const selectStyle = {
  background: 'var(--bg-tertiary)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
} as const

export function UbicacionDetailModal({ ubicacion, open, onClose, onRefresh }: UbicacionDetailModalProps) {
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol
  const canEdit = rol === 'ADMIN' || rol === 'ALMACENISTA'

  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [nivelSeleccionado, setNivelSeleccionado] = useState<string | null>(null)
  const [addingNivel, setAddingNivel] = useState(false)

  // Mover state
  const [moverData, setMoverData] = useState<{
    articulo: { id: string; nombre: string; marca?: string }
    cantidadTotal: number
    cantidadApartada: number
  } | null>(null)

  // Apartado state
  const [apartandoId, setApartandoId] = useState<string | null>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [apartadoForm, setApartadoForm] = useState({ cantidad: 1, proyectoId: '', notas: '' })
  const [savingApartado, setSavingApartado] = useState(false)

  const nivelesActivos = ubicacion?.niveles.filter(n => n) ?? []
  const nivelActualId = nivelSeleccionado ?? nivelesActivos[0]?.id ?? null
  const nivelActual = nivelesActivos.find(n => n.id === nivelActualId) ?? nivelesActivos[0] ?? null

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

  async function agregarNivel() {
    if (!ubicacion) return
    setAddingNivel(true)
    const res = await fetch(`/api/ubicaciones/${ubicacion.id}/niveles`, { method: 'POST' })
    if (res.ok) {
      toast.success('Nivel agregado')
      onRefresh?.()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setAddingNivel(false)
  }

  async function eliminarNivel(nivelId: string) {
    if (!ubicacion) return
    const res = await fetch(`/api/ubicaciones/${ubicacion.id}/niveles/${nivelId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Nivel eliminado')
      if (nivelSeleccionado === nivelId) setNivelSeleccionado(null)
      onRefresh?.()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
  }

  function abrirApartar(articuloId: string) {
    setApartandoId(articuloId)
    setApartadoForm({ cantidad: 1, proyectoId: '', notas: '' })
    if (proyectos.length === 0) {
      fetch('/api/proyectos').then(r => r.json()).then(data => {
        setProyectos(data.filter((p: any) => p.estado === 'ACTIVO'))
      })
    }
  }

  async function crearApartado() {
    if (!apartandoId) return
    if (!apartadoForm.proyectoId) {
      toast.error('Debes seleccionar un proyecto para apartar')
      return
    }
    setSavingApartado(true)
    const fechaExpira = addDays(new Date(), 7).toISOString()
    const res = await fetch('/api/apartados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyectoId: apartadoForm.proyectoId,
        notas: apartadoForm.notas || undefined,
        fechaExpira,
        items: [{ articuloId: apartandoId, cantidad: apartadoForm.cantidad }],
      }),
    })
    if (res.ok) {
      toast.success('Apartado creado correctamente')
      setApartandoId(null)
      onRefresh?.()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setSavingApartado(false)
  }

  if (!ubicacion) return null

  return (
    <>
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

          {/* Dos paneles */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)', minHeight: 320, maxHeight: '60vh' }}>
            {/* Panel izquierdo — Niveles */}
            <div className="flex flex-col" style={{ width: 200, borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="px-3 py-2 text-xs uppercase tracking-widest font-medium"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                Niveles
              </div>
              <div className="flex-1 overflow-y-auto">
                {nivelesActivos.map((nivel) => {
                  const totalArticulos = nivel.articuloNiveles.filter(an => an.cantidad > 0).length
                  const activo = nivel.id === nivelActualId
                  const tieneStock = nivel.articuloNiveles.some(an => an.cantidad > 0)
                  return (
                    <button
                      key={nivel.id}
                      onClick={() => setNivelSeleccionado(nivel.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors group"
                      style={{
                        background: activo ? 'var(--bg-tertiary)' : undefined,
                        borderLeft: activo ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        color: activo ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: tieneStock ? 'var(--accent-success, #00e676)' : 'var(--accent-danger)' }} />
                      <span className="font-mono text-xs flex-1">
                        {ubicacion.nombre}-{nivel.nombre}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({totalArticulos})</span>
                      {!tieneStock && rol === 'ADMIN' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); eliminarNivel(nivel.id) }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </button>
                  )
                })}
              </div>
              {canEdit && (
                <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <Button variant="ghost" size="sm" className="w-full" onClick={agregarNivel} loading={addingNivel}>
                    <Plus size={12} /> Nivel
                  </Button>
                </div>
              )}
            </div>

            {/* Panel derecho — Componentes */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 text-xs uppercase tracking-widest font-medium"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                Componentes {nivelActual ? `— ${ubicacion.nombre}-${nivelActual.nombre}` : ''}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={nivelActualId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    {!nivelActual || nivelActual.articuloNiveles.filter(an => an.cantidad > 0).length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                        Sin artículos en este nivel
                      </p>
                    ) : (
                      nivelActual.articuloNiveles
                        .filter(an => an.cantidad > 0)
                        .map((an, i) => {
                          const disponible = Math.max(0, an.cantidad - an.apartadoReservado)
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                              style={{ background: 'var(--bg-tertiary)' }}>
                              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--border)' }}>
                                {an.articulo.fotoUrl ? (
                                  <NextImage src={an.articulo.fotoUrl} alt="" width={40} height={40} className="rounded object-cover" />
                                ) : (
                                  <Image size={16} style={{ color: 'var(--text-muted)' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{an.articulo.nombre}</p>
                                {an.articulo.marca && (
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{an.articulo.marca}</p>
                                )}
                                {an.apartadoReservado > 0 && (
                                  <p className="text-xs mt-0.5" style={{ color: 'var(--accent-warning)' }}>
                                    {an.apartadoReservado} apartado
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="text-right">
                                  <p className="font-mono-data text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                                    {disponible}
                                  </p>
                                  {an.apartadoReservado > 0 && (
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                      de {an.cantidad}
                                    </p>
                                  )}
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{an.articulo.unidad}</p>
                                </div>
                                {disponible > 0 && (
                                  <Button variant="ghost" size="sm" onClick={() => abrirApartar(an.articulo.id)} title="Apartar">
                                    <Bookmark size={12} />
                                  </Button>
                                )}
                                {canEdit && an.cantidad > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Mover"
                                    onClick={() => setMoverData({
                                      articulo: { id: an.articulo.id, nombre: an.articulo.nombre, marca: an.articulo.marca ?? undefined },
                                      cantidadTotal: an.cantidad,
                                      cantidadApartada: an.apartadoReservado,
                                    })}
                                    style={{ color: 'var(--text-secondary)' }}
                                  >
                                    <ArrowLeftRight size={12} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Apartar */}
      <Modal
        open={!!apartandoId}
        onClose={() => setApartandoId(null)}
        title="Apartar artículo"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              Proyecto <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <select
              value={apartadoForm.proyectoId}
              onChange={(e) => setApartadoForm(f => ({ ...f, proyectoId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-md text-sm outline-none border"
              style={selectStyle}
            >
              <option value="">Seleccionar proyecto...</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {proyectos.length === 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Cargando proyectos activos...
              </p>
            )}
          </div>
          <Input
            label="Cantidad *"
            type="number"
            min={1}
            value={apartadoForm.cantidad}
            onChange={(e) => setApartadoForm(f => ({ ...f, cantidad: Math.max(1, parseInt(e.target.value) || 1) }))}
          />
          <div className="rounded-md px-3 py-2.5 text-sm"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            Vigencia: <span style={{ color: 'var(--text-primary)' }}>7 días calendario</span>
          </div>
          <Input
            label="Notas (opcional)"
            value={apartadoForm.notas}
            onChange={(e) => setApartadoForm(f => ({ ...f, notas: e.target.value }))}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setApartandoId(null)}>Cancelar</Button>
            <Button
              onClick={crearApartado}
              loading={savingApartado}
              disabled={!apartadoForm.proyectoId}
            >
              <Bookmark size={14} /> Apartar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Mover */}
      {moverData && nivelActual && (
        <MoverComponenteModal
          isOpen={!!moverData}
          onClose={() => setMoverData(null)}
          onMoveSuccess={() => { setMoverData(null); onRefresh?.() }}
          articulo={moverData.articulo}
          nivelOrigen={{ id: nivelActual.id, nombre: nivelActual.nombre, ubicacion: { nombre: ubicacion.nombre } }}
          cantidadTotal={moverData.cantidadTotal}
          cantidadApartada={moverData.cantidadApartada}
        />
      )}
    </>
  )
}
