export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { errorResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'
import * as XLSX from 'xlsx'

export async function GET(req: Request) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const { searchParams } = new URL(req.url)
  const formato = searchParams.get('formato') ?? 'excel'

  const lotes = await prisma.loteEntrada.findMany({
    where: { cantidadDisponible: { gt: 0 }, precioPendiente: false },
    include: {
      articulo: { select: { nombre: true, marca: true, unidad: true } },
    },
    orderBy: { articulo: { nombre: 'asc' } },
  })

  const rows = lotes.map((l) => ({
    Artículo: l.articulo.nombre,
    Marca: l.articulo.marca ?? '—',
    Unidad: l.articulo.unidad,
    Stock: l.cantidadDisponible,
    'Precio unitario': l.precioUnitario ?? 0,
    'Valor total': (l.cantidadDisponible * (l.precioUnitario ?? 0)).toFixed(2),
  }))

  const totalValor = lotes.reduce((s, l) => s + l.cantidadDisponible * (l.precioUnitario ?? 0), 0)
  rows.push({ Artículo: 'TOTAL', Marca: '', Unidad: '', Stock: 0, 'Precio unitario': 0, 'Valor total': totalValor.toFixed(2) })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="inventario.xlsx"',
    },
  })
}

