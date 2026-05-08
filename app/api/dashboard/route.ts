export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'
import { startOfMonth, subDays } from 'date-fns'

export async function GET() {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const ahora = new Date()
  const inicioMes = startOfMonth(ahora)
  const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)

  const [
    lotesSinPrecio,
    loteConPrecio,
    articulosTotal,
    articulosEnCero,
    entradasMes,
    salidasMes,
    apartadosProximosVencer,
    proyectosActivos,
    movimientos30d,
    topArticulos,
  ] = await Promise.all([
    prisma.loteEntrada.count({ where: { precioPendiente: true, cantidadDisponible: { gt: 0 } } }),
    prisma.loteEntrada.findMany({
      where: { precioPendiente: false, cantidadDisponible: { gt: 0 } },
      select: { cantidadDisponible: true, precioUnitario: true },
    }),
    prisma.articulo.count({ where: { activo: true } }),
    prisma.articulo.count({
      where: {
        activo: true,
        lotesEntrada: { none: { cantidadDisponible: { gt: 0 } } },
      },
    }),
    prisma.entrada.count({ where: { fecha: { gte: inicioMes } } }),
    prisma.salida.count({ where: { fecha: { gte: inicioMes } } }),
    prisma.apartado.count({
      where: { estado: 'ACTIVO', fechaExpira: { lte: en24h } },
    }),
    prisma.proyecto.count({ where: { estado: 'ACTIVO' } }),
    prisma.$queryRaw`
      SELECT DATE("fecha") as dia, COUNT(*)::int as total, 'ENTRADA' as tipo
      FROM "Entrada" WHERE "fecha" >= ${subDays(ahora, 30)}
      GROUP BY DATE("fecha")
      UNION ALL
      SELECT DATE("fecha") as dia, COUNT(*)::int as total, 'SALIDA' as tipo
      FROM "Salida" WHERE "fecha" >= ${subDays(ahora, 30)}
      GROUP BY DATE("fecha")
      ORDER BY dia ASC
    `,
    prisma.salidaItem.groupBy({
      by: ['loteEntradaId'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
    }),
  ])

  const valorInventario = loteConPrecio.reduce(
    (sum, l) => sum + (l.cantidadDisponible * (l.precioUnitario ?? 0)), 0
  )

  return successResponse({
    valorInventario,
    articulosEnStock: articulosTotal - articulosEnCero,
    articulosEnCero,
    movimientosMes: entradasMes + salidasMes,
    lotesSinPrecio,
    apartadosProximosVencer,
    proyectosActivos,
    movimientos30d,
    topArticulos,
  })
}

