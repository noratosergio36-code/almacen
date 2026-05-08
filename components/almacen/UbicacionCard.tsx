'use client'

import { motion } from 'framer-motion'
import { StatusLED } from '@/components/ui/StatusLED'
import { MapPin } from 'lucide-react'

interface UbicacionCardProps {
  id: string
  nombre: string
  descripcion?: string | null
  totalArticulos: number
  totalStock: number
  onClick: () => void
  index?: number
}

export function UbicacionCard({ nombre, descripcion, totalArticulos, totalStock, onClick, index = 0 }: UbicacionCardProps) {
  const ledStatus = totalStock === 0 ? 'danger' : totalStock < 5 ? 'warning' : 'ok'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="card-industrial p-4 text-left w-full hover:card-industrial-active transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: 'var(--accent-primary)' }} />
          <span className="font-mono-data text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {nombre}
          </span>
        </div>
        <StatusLED status={ledStatus} />
      </div>

      {descripcion && (
        <p className="text-xs mb-3 truncate" style={{ color: 'var(--text-muted)' }}>{descripcion}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded p-2" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Artículos</p>
          <p className="font-mono-data text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {totalArticulos}
          </p>
        </div>
        <div className="rounded p-2" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Unidades</p>
          <p className="font-mono-data text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
            {totalStock}
          </p>
        </div>
      </div>
    </motion.button>
  )
}
