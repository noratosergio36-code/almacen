'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Entrada {
  id: string
  fecha: string
  usuario: { nombre: string }
  proveedor?: { nombre: string } | null
  lotes: Array<{
    id: string
    articuloId: string
    cantidadOriginal: number
    precioPendiente: boolean
    articulo: { nombre: string }
  }>
}

export default function EntradasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntradas = useCallback(async () => {
    const res = await fetch('/api/entradas?limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntradas(data.entradas)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntradas() }, [fetchEntradas])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Registro de entradas</h2>
        <Link href="/entradas/nueva">
          <Button size="sm"><Plus size={14} /> Nueva entrada</Button>
        </Link>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="card-industrial overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Fecha', 'Artículos', 'Proveedor', 'Almacenista', 'Estado', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entradas.map((e, i) => {
                const sinPrecio = e.lotes.some((l) => l.precioPendiente)
                return (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono-data text-xs">{formatDate(e.fecha)}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {e.lotes.slice(0, 2).map((l) => (
                          <p key={l.id} className="text-xs truncate max-w-40">
                            {l.cantidadOriginal}× {l.articulo.nombre}
                          </p>
                        ))}
                        {e.lotes.length > 2 && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{e.lotes.length - 2} más</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {e.proveedor?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {e.usuario.nombre}
                    </td>
                    <td className="px-4 py-3">
                      {sinPrecio ? (
                        <Badge variant="warning">
                          <AlertCircle size={10} className="mr-1" />Sin precio
                        </Badge>
                      ) : (
                        <Badge variant="success">Con precio</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/entradas/${e.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {entradas.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              No hay entradas registradas
            </p>
          )}
        </div>
      )}
    </div>
  )
}
