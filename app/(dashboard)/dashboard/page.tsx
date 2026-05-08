'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign, Package, TrendingDown, Activity,
  AlertCircle, Clock, FolderOpen, ArrowDownToLine,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import Link from 'next/link'

interface KPIs {
  valorInventario: number
  articulosEnStock: number
  articulosEnCero: number
  movimientosMes: number
  lotesSinPrecio: number
  apartadosProximosVencer: number
  proyectosActivos: number
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-active)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 12,
  },
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setKpis(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (!kpis) return null

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <KPICard title="Valor del Inventario" value={formatCurrency(kpis.valorInventario)}
          icon={DollarSign} color="cyan" index={0} />
        <KPICard title="Artículos en Stock" value={kpis.articulosEnStock}
          icon={Package} color="green" index={1} />
        <KPICard title="Artículos en Cero" value={kpis.articulosEnCero}
          icon={TrendingDown} color="danger" index={2} />
        <KPICard title="Movimientos del Mes" value={kpis.movimientosMes}
          icon={Activity} color="cyan" index={3} />
        <KPICard
          title="Lotes Sin Precio"
          value={kpis.lotesSinPrecio}
          icon={AlertCircle}
          color={kpis.lotesSinPrecio > 0 ? 'warning' : 'green'}
          subtitle={kpis.lotesSinPrecio > 0 ? 'Requieren asignación' : 'Todos con precio'}
          index={4}
        />
        <KPICard
          title="Apartados por Vencer"
          value={kpis.apartadosProximosVencer}
          icon={Clock}
          color={kpis.apartadosProximosVencer > 0 ? 'warning' : 'green'}
          subtitle="Próximas 24h"
          index={5}
        />
        <KPICard title="Proyectos Activos" value={kpis.proyectosActivos}
          icon={FolderOpen} color="purple" index={6} />
      </div>

      {/* Alerta de lotes sin precio */}
      {kpis.lotesSinPrecio > 0 && (
        <div className="flex items-center justify-between p-4 rounded-lg border"
          style={{ background: 'color-mix(in srgb, var(--accent-warning) 8%, transparent)', borderColor: 'var(--accent-warning)' }}>
          <div className="flex items-center gap-3">
            <ArrowDownToLine size={18} style={{ color: 'var(--accent-warning)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--accent-warning)' }}>
                {kpis.lotesSinPrecio} lote{kpis.lotesSinPrecio > 1 ? 's' : ''} sin precio asignado
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                El costo FIFO no puede calcularse hasta que se asignen los precios
              </p>
            </div>
          </div>
          <Link href="/entradas"
            className="px-4 py-2 rounded-md text-xs font-medium transition-colors"
            style={{ background: 'var(--accent-warning)', color: 'var(--bg-primary)' }}>
            Ir a entradas
          </Link>
        </div>
      )}

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-industrial p-5">
          <h3 className="font-display font-semibold text-sm mb-4 tracking-wide">
            Movimientos últimos 30 días
          </h3>
          <div className="h-48 flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">Conecta la base de datos para ver datos reales</p>
          </div>
        </div>
        <div className="card-industrial p-5">
          <h3 className="font-display font-semibold text-sm mb-4 tracking-wide">
            Top artículos del mes
          </h3>
          <div className="h-48 flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">Conecta la base de datos para ver datos reales</p>
          </div>
        </div>
      </div>
    </div>
  )
}
