'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Salida {
  id: string
  fecha: string
  costoTotal?: number | null
  usuario: { nombre: string }
  proyecto?: { nombre: string } | null
  items: Array<{ loteEntrada: { articulo: { nombre: string } }; cantidad: number }>
}

export default function SalidasPage() {
  const [salidas, setSalidas] = useState<Salida[]>([])
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    const res = await fetch('/api/salidas?limit=50')
    if (res.ok) {
      const data = await res.json()
      setSalidas(data.salidas)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Registro de salidas</h2>
        <Link href="/salidas/nueva">
          <Button size="sm"><Plus size={14} /> Nueva salida</Button>
        </Link>
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="card-industrial overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Fecha', 'Artículos', 'Proyecto', 'Costo FIFO', 'Almacenista'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salidas.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <td className="px-4 py-3 font-mono-data text-xs">{formatDate(s.fecha)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {s.items.slice(0, 2).map((it, j) => (
                      <span key={j} className="block">{it.cantidad}× {it.loteEntrada.articulo.nombre}</span>
                    ))}
                    {s.items.length > 2 && <span style={{ color: 'var(--text-muted)' }}>+{s.items.length - 2} más</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {s.proyecto?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono-data font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {s.costoTotal != null ? formatCurrency(s.costoTotal) : (
                      <Badge variant="warning">Pendiente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{s.usuario.nombre}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {salidas.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              No hay salidas registradas
            </p>
          )}
        </div>
      )}
    </div>
  )
}
