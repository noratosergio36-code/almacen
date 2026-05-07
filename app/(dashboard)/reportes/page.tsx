'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'

type TipoReporte = 'entradas' | 'salidas' | 'inventario'

export default function ReportesPage() {
  const [tipo, setTipo] = useState<TipoReporte>('inventario')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null)

  async function descargar(formato: 'pdf' | 'excel') {
    setLoading(formato)
    const params = new URLSearchParams({ formato, ...(desde && { desde }), ...(hasta && { hasta }) })
    const res = await fetch(`/api/reportes/${tipo}?${params}`)
    if (!res.ok) {
      toast.error('Error al generar el reporte')
      setLoading(null)
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(null)
  }

  const reportes: Array<{ id: TipoReporte; label: string; desc: string }> = [
    { id: 'inventario', label: 'Valorización del inventario', desc: 'Stock actual con valorización FIFO por artículo y ubicación' },
    { id: 'entradas', label: 'Reporte de entradas', desc: 'Historial de entradas con precios y proveedores' },
    { id: 'salidas', label: 'Reporte de salidas', desc: 'Salidas por proyecto con costos FIFO' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-3">
        {reportes.map((r) => (
          <button
            key={r.id}
            onClick={() => setTipo(r.id)}
            className="card-industrial p-4 text-left transition-all"
            style={tipo === r.id ? {
              borderColor: 'var(--accent-primary)',
              background: 'rgba(0,212,255,0.06)',
            } : {}}
          >
            <div className="flex items-center gap-2 mb-1">
              {tipo === r.id && (
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
              )}
              <p className="text-sm font-medium">{r.label}</p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
          </button>
        ))}
      </div>

      {tipo !== 'inventario' && (
        <div className="card-industrial p-4 grid grid-cols-2 gap-4">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={() => descargar('pdf')} loading={loading === 'pdf'} variant="secondary">
          <FileText size={16} />
          Exportar PDF
        </Button>
        <Button onClick={() => descargar('excel')} loading={loading === 'excel'}>
          <FileSpreadsheet size={16} />
          Exportar Excel
        </Button>
      </div>
    </div>
  )
}
