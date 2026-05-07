'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArticuloSchema } from '@/lib/validations'
import { z } from 'zod'
import { Plus, Search, Package } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type ArticuloForm = z.input<typeof ArticuloSchema>

interface Articulo {
  id: string
  nombre: string
  marca?: string | null
  numeroParte?: string | null
  unidad: string
  fotoUrl?: string | null
  stockMinimo?: number | null
  lotesEntrada: Array<{ cantidadDisponible: number }>
}

export default function ArticulosPage() {
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ArticuloForm>({
    resolver: zodResolver(ArticuloSchema),
  })

  const fetchArticulos = useCallback(async () => {
    const res = await fetch(`/api/articulos?q=${query}&limit=50`)
    if (res.ok) {
      const data = await res.json()
      setArticulos(data.articulos)
    }
    setLoading(false)
  }, [query])

  useEffect(() => { fetchArticulos() }, [fetchArticulos])

  async function crearArticulo(data: ArticuloForm) {
    setSaving(true)
    const res = await fetch('/api/articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Artículo creado')
      setShowForm(false)
      reset()
      fetchArticulos()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artículo, marca, número de parte..."
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
            <Plus size={14} /> Nuevo artículo
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="card-industrial overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Artículo', 'Marca', 'N° Parte', 'Unidad', 'Stock', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articulos.map((a, i) => {
                const stock = a.lotesEntrada?.reduce((s, l) => s + l.cantidadDisponible, 0) ?? 0
                const stockBadge = stock === 0 ? 'danger' : (a.stockMinimo && stock <= a.stockMinimo) ? 'warning' : 'success'

                return (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ background: 'var(--bg-tertiary)' }}>
                          <Package size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <span className="font-medium">{a.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{a.marca ?? '—'}</td>
                    <td className="px-4 py-3 font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>
                      {a.numeroParte ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{a.unidad}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-data font-bold text-base"
                          style={{ color: 'var(--accent-primary)' }}>{stock}</span>
                        <Badge variant={stockBadge}>{stock === 0 ? 'Sin stock' : 'En stock'}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/articulos/${a.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {articulos.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              No hay artículos registrados
            </p>
          )}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo artículo">
        <form onSubmit={handleSubmit(crearArticulo)} className="space-y-4">
          <Input label="Nombre *" error={errors.nombre?.message} {...register('nombre')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" {...register('marca')} />
            <Input label="Número de parte" {...register('numeroParte')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Unidad" placeholder="pza" {...register('unidad')} />
            <Input label="Stock mínimo" type="number" {...register('stockMinimo', { valueAsNumber: true })} />
          </div>
          <Input label="Descripción" {...register('descripcion')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear artículo</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
