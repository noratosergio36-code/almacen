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
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')

  const salidas = await prisma.salida.findMany({
    where: {
      ...(desde || hasta ? {
        fecha: {
          ...(desde ? { gte: new Date(desde) } : {}),
          ...(hasta ? { lte: new Date(hasta) } : {}),
        },
      } : {}),
    },
    include: {
      usuario: { select: { nombre: true } },
      proyecto: { select: { nombre: true } },
      items: {
        include: {
          loteEntrada: { include: { articulo: { select: { nombre: true, unidad: true } } } },
        },
      },
    },
    orderBy: { fecha: 'desc' },
  })

  const rows = salidas.flatMap((s) =>
    s.items.map((item) => ({
      Fecha: s.fecha.toISOString().split('T')[0],
      Artículo: item.loteEntrada.articulo.nombre,
      Cantidad: item.cantidad,
      Unidad: item.loteEntrada.articulo.unidad,
      'Precio FIFO': item.precioUnitario ?? '—',
      'Costo total': item.costoTotal?.toFixed(2) ?? '—',
      Proyecto: s.proyecto?.nombre ?? '—',
      Usuario: s.usuario.nombre,
    }))
  )

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Salidas')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="salidas.xlsx"',
    },
  })
}

