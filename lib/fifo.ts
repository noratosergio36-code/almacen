import { prisma } from './prisma'

interface FifoItem {
  loteEntradaId: string
  cantidad: number
  precioUnitario: number | null
  costoTotal: number | null
}

interface FifoResult {
  items: FifoItem[]
  costoTotal: number | null
  tieneLotesSinPrecio: boolean
}

export async function calcularFIFO(
  articuloId: string,
  cantidad: number
): Promise<FifoResult> {
  const lotes = await prisma.loteEntrada.findMany({
    where: { articuloId, cantidadDisponible: { gt: 0 } },
    orderBy: { createdAt: 'asc' },
  })

  const items: FifoItem[] = []
  let restante = cantidad
  let costoTotal = 0
  let tieneLotesSinPrecio = false

  for (const lote of lotes) {
    if (restante <= 0) break

    const consumir = Math.min(restante, lote.cantidadDisponible)
    const costo = lote.precioUnitario != null ? consumir * lote.precioUnitario : null

    if (lote.precioPendiente) tieneLotesSinPrecio = true

    items.push({
      loteEntradaId: lote.id,
      cantidad: consumir,
      precioUnitario: lote.precioUnitario,
      costoTotal: costo,
    })

    if (costo != null) costoTotal += costo
    restante -= consumir
  }

  return {
    items,
    costoTotal: tieneLotesSinPrecio ? null : costoTotal,
    tieneLotesSinPrecio,
  }
}
