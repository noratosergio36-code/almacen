'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface Articulo { id: string; nombre: string; unidad: string }
interface Proveedor { id: string; nombre: string }
interface Ubicacion { id: string; nombre: string }

interface LoteItem {
  articuloId: string
  ubicacionId: string
  cantidadOriginal: number
}

export default function NuevaEntradaPage() {
  const router = useRouter()
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [proveedorId, setProveedorId] = useState('')
  const [notas, setNotas] = useState('')
  const [lotes, setLotes] = useState<LoteItem[]>([{ articuloId: '', ubicacionId: '', cantidadOriginal: 1 }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/articulos?limit=200').then((r) => r.json()),
      fetch('/api/proveedores').then((r) => r.json()),
      fetch('/api/ubicaciones').then((r) => r.json()),
    ]).then(([a, p, u]) => {
      setArticulos(a.articulos ?? [])
      setProveedores(p)
      setUbicaciones(u)
    })
  }, [])

  function addLote() {
    setLotes((l) => [...l, { articuloId: '', ubicacionId: '', cantidadOriginal: 1 }])
  }

  function removeLote(i: number) {
    setLotes((l) => l.filter((_, idx) => idx !== i))
  }

  function updateLote(i: number, field: keyof LoteItem, value: string | number) {
    setLotes((l) => l.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  async function submit() {
    if (lotes.some((l) => !l.articuloId || l.cantidadOriginal < 1)) {
      toast.error('Completa todos los artículos y cantidades')
      return
    }
    setSaving(true)
    const res = await fetch('/api/entradas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proveedorId: proveedorId || undefined, notas: notas || undefined, lotes }),
    })
    if (res.ok) {
      const data = await res.json()
      toast.success('Entrada registrada correctamente')
      router.push(`/entradas/${data.id}`)
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="card-industrial p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold">Datos generales</h2>
        <div>
          <label className="block text-xs uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            Proveedor (opcional)
          </label>
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none border"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <Input label="Notas (opcional)" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>

      <div className="card-industrial p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Artículos</h2>
          <Button variant="outline" size="sm" onClick={addLote}><Plus size={14} /> Agregar</Button>
        </div>

        {lotes.map((lote, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg"
            style={{ background: 'var(--bg-tertiary)' }}>
            <div className="col-span-5">
              <label className="block text-xs uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}>Artículo</label>
              <select
                value={lote.articuloId}
                onChange={(e) => updateLote(i, 'articuloId', e.target.value)}
                className="w-full px-3 py-2.5 rounded-md text-sm outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">Seleccionar...</option>
                {articulos.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="col-span-4">
              <label className="block text-xs uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}>Ubicación</label>
              <select
                value={lote.ubicacionId}
                onChange={(e) => updateLote(i, 'ubicacionId', e.target.value)}
                className="w-full px-3 py-2.5 rounded-md text-sm outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">Sin ubicación</option>
                {ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <Input
                label="Cantidad"
                type="number"
                min={1}
                value={lote.cantidadOriginal}
                onChange={(e) => updateLote(i, 'cantidadOriginal', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-span-1">
              {lotes.length > 1 && (
                <button onClick={() => removeLote(i)} className="p-2.5 rounded-md hover:bg-red-500/20 transition-colors">
                  <Trash2 size={14} style={{ color: 'var(--accent-danger)' }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={() => router.push('/entradas')}>Cancelar</Button>
        <Button onClick={submit} loading={saving}>Registrar entrada</Button>
      </div>
    </div>
  )
}
