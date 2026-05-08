'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Plus, Trash2, AlertTriangle, Clock, Upload } from 'lucide-react'
import { CSVUploader } from '@/components/csv/CSVUploader'
import { addDays, differenceInDays, isPast } from 'date-fns'
import { motion } from 'framer-motion'

interface Apartado {
  id: string
  estado: string
  fechaExpira: string
  notas?: string | null
  usuario: { id: string; nombre: string }
  proyecto?: { nombre: string } | null
  items: Array<{ articulo: { nombre: string; unidad: string }; cantidad: number }>
}

export default function ApartadosPage() {
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol
  const userId = (session?.user as any)?.id
  const [apartados, setApartados] = useState<Apartado[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [articulos, setArticulos] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const [formItems, setFormItems] = useState([{ articuloId: '', cantidad: 1 }])
  const [proyectoId, setProyectoId] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchApartados = useCallback(async () => {
    const res = await fetch('/api/apartados')
    if (res.ok) {
      const data = await res.json()
      setApartados(data.apartados)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchApartados()
    Promise.all([
      fetch('/api/articulos?limit=200').then((r) => r.json()),
      fetch('/api/proyectos').then((r) => r.json()),
    ]).then(([a, p]) => {
      setArticulos(a.articulos ?? [])
      setProyectos(p.filter((pr: any) => pr.estado === 'ACTIVO'))
    })
  }, [fetchApartados])

  async function crearApartado() {
    if (formItems.some((i) => !i.articuloId || i.cantidad < 1)) {
      toast.error('Completa todos los artículos')
      return
    }
    setSaving(true)
    const res = await fetch('/api/apartados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyectoId: proyectoId || undefined, notas, items: formItems }),
    })
    if (res.ok) {
      toast.success('Apartado creado')
      setShowForm(false)
      setFormItems([{ articuloId: '', cantidad: 1 }])
      fetchApartados()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setSaving(false)
  }

  async function cancelarApartado(id: string) {
    const res = await fetch(`/api/apartados/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Apartado cancelado')
      fetchApartados()
    }
  }

  async function convertirASalida(id: string) {
    const res = await fetch(`/api/apartados/${id}/convertir`, { method: 'POST' })
    if (res.ok) {
      toast.success('Apartado convertido a salida')
      fetchApartados()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
  }

  const vencimientoLabel = (fecha: string) => {
    const dias = differenceInDays(new Date(fecha), new Date())
    if (isPast(new Date(fecha))) return { text: 'Vencido', color: 'var(--accent-danger)' }
    if (dias <= 1) return { text: `Vence en ${dias}d`, color: 'var(--accent-warning)' }
    return { text: `${dias} días`, color: 'var(--text-muted)' }
  }

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Apartados activos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCsvOpen(true)}>
            <Upload size={14} /> Cargar CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Nuevo apartado</Button>
        </div>
        {csvOpen && (
          <CSVUploader tipo="apartado" onProcesado={fetchApartados} onClose={() => setCsvOpen(false)} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apartados.map((a, i) => {
          const vc = vencimientoLabel(a.fechaExpira)
          const canEdit = rol === 'ADMIN' || a.usuario.id === userId
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card-industrial p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium">{a.usuario.nombre}</p>
                  {a.proyecto && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.proyecto.nombre}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} style={{ color: vc.color }} />
                  <span className="text-xs" style={{ color: vc.color }}>{vc.text}</span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {a.items.map((item, j) => (
                  <div key={j} className="flex justify-between text-xs p-2 rounded"
                    style={{ background: 'var(--bg-tertiary)' }}>
                    <span>{item.articulo.nombre}</span>
                    <span className="font-mono-data" style={{ color: 'var(--accent-purple)' }}>
                      {item.cantidad} {item.articulo.unidad}
                    </span>
                  </div>
                ))}
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  {rol !== 'USUARIO' && (
                    <Button variant="secondary" size="sm" onClick={() => convertirASalida(a.id)}>
                      Convertir a salida
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => cancelarApartado(a.id)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {apartados.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
          No hay apartados activos
        </p>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo apartado" size="lg">
        <div className="space-y-4">
          {/* Aviso de vencimiento */}
          <div className="p-4 rounded-lg border" style={{ background: 'color-mix(in srgb, var(--accent-warning) 8%, transparent)', borderColor: 'var(--accent-warning)' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--accent-warning)' }}>
                  Aviso importante
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Los artículos apartados quedan reservados por <strong>7 días calendario</strong> a partir de hoy
                  ({formatDate(addDays(new Date(), 7))}). Después de esa fecha, los artículos quedarán disponibles
                  automáticamente para otros usuarios. Asegúrate de procesar la salida antes del vencimiento.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Proyecto (opcional)
            </label>
            <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md text-sm outline-none border"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <option value="">Sin proyecto</option>
              {proyectos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Artículos</label>
              <Button variant="ghost" size="sm" onClick={() => setFormItems((f) => [...f, { articuloId: '', cantidad: 1 }])}>
                <Plus size={12} /> Agregar
              </Button>
            </div>
            {formItems.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <select value={item.articuloId}
                  onChange={(e) => setFormItems((f) => f.map((fi, idx) => idx === i ? { ...fi, articuloId: e.target.value } : fi))}
                  className="flex-1 px-3 py-2.5 rounded-md text-sm outline-none border"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">Seleccionar artículo...</option>
                  {articulos.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                <input type="number" min={1} value={item.cantidad}
                  onChange={(e) => setFormItems((f) => f.map((fi, idx) => idx === i ? { ...fi, cantidad: parseInt(e.target.value) || 1 } : fi))}
                  className="w-20 px-3 py-2.5 rounded-md text-sm outline-none border font-mono-data"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                {formItems.length > 1 && (
                  <button onClick={() => setFormItems((f) => f.filter((_, idx) => idx !== i))}>
                    <Trash2 size={14} style={{ color: 'var(--accent-danger)' }} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Input label="Notas (opcional)" value={notas} onChange={(e) => setNotas(e.target.value)} />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={crearApartado} loading={saving}>Crear apartado</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
