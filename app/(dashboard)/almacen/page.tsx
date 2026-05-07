'use client'

import { useEffect, useState, useCallback } from 'react'
import { UbicacionCard } from '@/components/almacen/UbicacionCard'
import { UbicacionDetailModal } from '@/components/almacen/UbicacionDetailModal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UbicacionSchema } from '@/lib/validations'
import { z } from 'zod'
import { Plus, Search } from 'lucide-react'

type UbicacionForm = z.infer<typeof UbicacionSchema>

interface Ubicacion {
  id: string
  nombre: string
  descripcion?: string | null
  articuloUbicaciones: Array<{
    cantidad: number
    articulo: { id: string; nombre: string; marca?: string | null; fotoUrl?: string | null; unidad: string }
  }>
}

export default function AlmacenPage() {
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ubicacion | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UbicacionForm>({
    resolver: zodResolver(UbicacionSchema),
  })

  const fetchUbicaciones = useCallback(async () => {
    const res = await fetch('/api/ubicaciones')
    if (res.ok) setUbicaciones(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchUbicaciones() }, [fetchUbicaciones])

  async function crearUbicacion(data: UbicacionForm) {
    setSaving(true)
    const res = await fetch('/api/ubicaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Ubicación creada')
      setShowForm(false)
      reset()
      fetchUbicaciones()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setSaving(false)
  }

  const filtered = ubicaciones.filter((u) =>
    u.nombre.toLowerCase().includes(query.toLowerCase())
  )

  const grupos = filtered.reduce<Record<string, Ubicacion[]>>((acc, u) => {
    const prefix = u.nombre[0]?.toUpperCase() ?? '#'
    if (!acc[prefix]) acc[prefix] = []
    acc[prefix].push(u)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ubicación..."
            className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none border"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        {rol !== 'USUARIO' && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={14} /> Nueva ubicación
          </Button>
        )}
      </div>

      {Object.entries(grupos).sort().map(([prefix, items]) => (
        <div key={prefix}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono-data text-xs font-bold tracking-widest"
              style={{ color: 'var(--text-muted)' }}>
              PASILLO {prefix}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((u, i) => (
              <UbicacionCard
                key={u.id}
                {...u}
                onClick={() => setSelected(u)}
                index={i}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p>No hay ubicaciones registradas</p>
        </div>
      )}

      <UbicacionDetailModal
        ubicacion={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva ubicación" size="sm">
        <form onSubmit={handleSubmit(crearUbicacion)} className="space-y-4">
          <Input label="Nombre (ej: A1, B3)" error={errors.nombre?.message} {...register('nombre')} />
          <Input label="Descripción (opcional)" {...register('descripcion')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
