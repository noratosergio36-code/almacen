import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Obtener datos base existentes
  const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } })
  if (!admin) throw new Error('No hay usuario admin. Ejecuta el seed primero.')

  let proveedor = await prisma.proveedor.findFirst()
  if (!proveedor) {
    proveedor = await prisma.proveedor.create({
      data: { nombre: 'Proveedor General', contacto: 'contacto@proveedor.com' },
    })
  }

  let proyecto = await prisma.proyecto.findFirst()
  if (!proyecto) {
    proyecto = await prisma.proyecto.create({ data: { nombre: 'Proyecto Demo 1' } })
  }

  const ubicaciones = await prisma.ubicacion.findMany()
  let ubicacion = ubicaciones[0]
  if (!ubicacion) {
    ubicacion = await prisma.ubicacion.create({ data: { nombre: 'A1' } })
  }

  // Crear artículos si no existen suficientes
  const articulosData = [
    { nombre: 'Cable UTP Cat6', marca: 'Belden', unidad: 'mts', stockMinimo: 50 },
    { nombre: 'Switch 24 puertos', marca: 'Cisco', unidad: 'pza', stockMinimo: 2 },
    { nombre: 'Patch Panel 24p', marca: 'AMP', unidad: 'pza', stockMinimo: 1 },
    { nombre: 'Rack 12U', marca: 'Panduit', unidad: 'pza', stockMinimo: 1 },
    { nombre: 'Conector RJ45', marca: 'Tyco', unidad: 'pza', stockMinimo: 100 },
  ]

  const articulos = []
  for (const data of articulosData) {
    const existente = await prisma.articulo.findFirst({ where: { nombre: data.nombre } })
    if (existente) {
      articulos.push(existente)
    } else {
      articulos.push(await prisma.articulo.create({ data }))
    }
  }

  console.log('Artículos listos:', articulos.map(a => a.nombre).join(', '))

  // ─── 5 ENTRADAS ────────────────────────────────────────────────────────────
  const entradasCreadas: { id: string; lotes: { id: string; articuloId: string; cantidadDisponible: number }[] }[] = []

  const entradasData = [
    {
      notas: 'Reposición mensual de materiales de red',
      items: [
        { articuloIdx: 0, cantidad: 500, precio: 12.5 },  // 500m cable
        { articuloIdx: 4, cantidad: 200, precio: 3.2 },   // 200 conectores
      ],
    },
    {
      notas: 'Compra equipos activos Q1',
      items: [
        { articuloIdx: 1, cantidad: 4, precio: 4800 },    // 4 switches
        { articuloIdx: 2, cantidad: 6, precio: 850 },     // 6 patch panels
      ],
    },
    {
      notas: 'Infraestructura racks nuevas oficinas',
      items: [
        { articuloIdx: 3, cantidad: 3, precio: 3200 },    // 3 racks
        { articuloIdx: 0, cantidad: 300, precio: 11.8 },  // 300m cable
      ],
    },
    {
      notas: 'Urgente: reposición conectores agotados',
      items: [
        { articuloIdx: 4, cantidad: 500, precio: 2.9 },   // 500 conectores
      ],
    },
    {
      notas: 'Compra trimestral switches y patch panels',
      items: [
        { articuloIdx: 1, cantidad: 2, precio: 5100 },    // 2 switches
        { articuloIdx: 2, cantidad: 4, precio: 900 },     // 4 patch panels
        { articuloIdx: 0, cantidad: 200, precio: 12.0 },  // 200m cable
      ],
    },
  ]

  for (const [i, ed] of entradasData.entries()) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - (20 - i * 3))

    const entrada = await prisma.entrada.create({
      data: {
        fecha,
        usuarioId: admin.id,
        proveedorId: proveedor.id,
        notas: ed.notas,
      },
    })

    const lotes = []
    for (const item of ed.items) {
      const art = articulos[item.articuloIdx]
      const lote = await prisma.loteEntrada.create({
        data: {
          entradaId: entrada.id,
          articuloId: art.id,
          ubicacionId: ubicacion.id,
          cantidadOriginal: item.cantidad,
          cantidadDisponible: item.cantidad,
          precioUnitario: item.precio,
          precioPendiente: false,
        },
      })

      // Actualizar stock en ArticuloUbicacion
      await prisma.articuloUbicacion.upsert({
        where: { articuloId_ubicacionId: { articuloId: art.id, ubicacionId: ubicacion.id } },
        update: { cantidad: { increment: item.cantidad } },
        create: { articuloId: art.id, ubicacionId: ubicacion.id, cantidad: item.cantidad },
      })

      lotes.push({ id: lote.id, articuloId: art.id, cantidadDisponible: item.cantidad })
    }

    entradasCreadas.push({ id: entrada.id, lotes })
    console.log(`Entrada ${i + 1} creada: ${ed.notas}`)
  }

  // ─── 5 SALIDAS ─────────────────────────────────────────────────────────────
  // Índice de lotes disponibles por artículo
  const lotesPorArticulo: Record<string, { loteId: string; disponible: number }[]> = {}
  for (const entrada of entradasCreadas) {
    for (const lote of entrada.lotes) {
      if (!lotesPorArticulo[lote.articuloId]) lotesPorArticulo[lote.articuloId] = []
      lotesPorArticulo[lote.articuloId].push({ loteId: lote.id, disponible: lote.cantidadDisponible })
    }
  }

  function consumirLote(articuloId: string, cantidad: number) {
    const lotes = lotesPorArticulo[articuloId]
    if (!lotes?.length) return null
    const lote = lotes[0]
    if (lote.disponible < cantidad) return null
    lote.disponible -= cantidad
    return { loteId: lote.loteId, cantidad }
  }

  const salidasData = [
    {
      notas: 'Instalación piso 3 - torre B',
      items: [
        { articuloIdx: 0, cantidad: 120 },   // 120m cable
        { articuloIdx: 4, cantidad: 48 },    // 48 conectores
      ],
    },
    {
      notas: 'Sala de servidores datacenter principal',
      items: [
        { articuloIdx: 1, cantidad: 2 },     // 2 switches
        { articuloIdx: 3, cantidad: 1 },     // 1 rack
        { articuloIdx: 2, cantidad: 2 },     // 2 patch panels
      ],
    },
    {
      notas: 'Mantenimiento preventivo oficinas norte',
      items: [
        { articuloIdx: 0, cantidad: 80 },    // 80m cable
        { articuloIdx: 4, cantidad: 60 },    // 60 conectores
      ],
    },
    {
      notas: 'Ampliación red piso 5',
      items: [
        { articuloIdx: 2, cantidad: 2 },     // 2 patch panels
        { articuloIdx: 0, cantidad: 150 },   // 150m cable
        { articuloIdx: 4, cantidad: 80 },    // 80 conectores
      ],
    },
    {
      notas: 'Nuevo laboratorio de cómputo',
      items: [
        { articuloIdx: 1, cantidad: 1 },     // 1 switch
        { articuloIdx: 2, cantidad: 1 },     // 1 patch panel
        { articuloIdx: 0, cantidad: 100 },   // 100m cable
        { articuloIdx: 4, cantidad: 50 },    // 50 conectores
      ],
    },
  ]

  for (const [i, sd] of salidasData.entries()) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - (10 - i * 2))

    let costoTotal = 0
    const itemsValidos: { loteId: string; cantidad: number; precio: number | null }[] = []

    for (const item of sd.items) {
      const art = articulos[item.articuloIdx]
      const consumo = consumirLote(art.id, item.cantidad)
      if (!consumo) {
        console.warn(`  Sin stock suficiente para ${art.nombre}, saltando...`)
        continue
      }
      const loteDb = await prisma.loteEntrada.findUnique({ where: { id: consumo.loteId } })
      const precio = loteDb?.precioUnitario ?? null
      costoTotal += (precio ?? 0) * consumo.cantidad
      itemsValidos.push({ loteId: consumo.loteId, cantidad: consumo.cantidad, precio })
    }

    if (!itemsValidos.length) {
      console.warn(`Salida ${i + 1} sin ítems válidos, omitida.`)
      continue
    }

    const salida = await prisma.salida.create({
      data: {
        fecha,
        usuarioId: admin.id,
        proyectoId: proyecto.id,
        notas: sd.notas,
        costoTotal,
      },
    })

    for (const it of itemsValidos) {
      await prisma.salidaItem.create({
        data: {
          salidaId: salida.id,
          loteEntradaId: it.loteId,
          cantidad: it.cantidad,
          precioUnitario: it.precio,
          costoTotal: (it.precio ?? 0) * it.cantidad,
        },
      })

      // Descontar stock y actualizar lote disponible
      const lote = await prisma.loteEntrada.findUnique({ where: { id: it.loteId } })
      if (lote) {
        await prisma.loteEntrada.update({
          where: { id: it.loteId },
          data: { cantidadDisponible: lote.cantidadDisponible - it.cantidad },
        })
        await prisma.articuloUbicacion.updateMany({
          where: { articuloId: lote.articuloId, ubicacionId: ubicacion.id },
          data: { cantidad: { decrement: it.cantidad } },
        })
      }
    }

    console.log(`Salida ${i + 1} creada: ${sd.notas} — costo $${costoTotal.toFixed(2)}`)
  }

  console.log('\n✓ Demo data generada: 5 entradas + 5 salidas')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
