import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Copiar proveedorNombre desde Proveedor a Entrada
  const entradas = await prisma.entrada.findMany({
    where: { proveedorId: { not: null } },
    include: { proveedor: true },
  })

  for (const entrada of entradas) {
    if (entrada.proveedor && !entrada.proveedorNombre) {
      await prisma.entrada.update({
        where: { id: entrada.id },
        data: { proveedorNombre: entrada.proveedor.nombre },
      })
    }
  }
  console.log(`✓ Migrado proveedorNombre en ${entradas.length} entradas`)

  // 2. Crear N1 para cada ubicación existente y migrar ArticuloUbicacion → ArticuloNivel
  const ubicaciones = await prisma.ubicacion.findMany({
    include: { articuloUbicaciones: true },
  })

  for (const ub of ubicaciones) {
    // Crear o encontrar N1
    const n1 = await prisma.nivel.upsert({
      where: { ubicacionId_numero: { ubicacionId: ub.id, numero: 1 } },
      update: {},
      create: {
        ubicacionId: ub.id,
        nombre: 'N1',
        numero: 1,
      },
    })

    // Migrar cada ArticuloUbicacion → ArticuloNivel
    for (const au of ub.articuloUbicaciones) {
      await prisma.articuloNivel.upsert({
        where: { nivelId_articuloId: { nivelId: n1.id, articuloId: au.articuloId } },
        update: { cantidad: au.cantidad },
        create: { nivelId: n1.id, articuloId: au.articuloId, cantidad: au.cantidad },
      })
    }

    console.log(`  Ubicación ${ub.nombre}: N1 creado, ${ub.articuloUbicaciones.length} artículos migrados`)
  }
  console.log(`✓ Niveles creados para ${ubicaciones.length} ubicaciones`)

  // 3. Actualizar nivelId en LoteEntrada existentes (apuntar al N1 de su ubicacionId)
  const lotes = await prisma.loteEntrada.findMany({
    where: { ubicacionId: { not: null }, nivelId: null },
  })

  for (const lote of lotes) {
    if (!lote.ubicacionId) continue
    const n1 = await prisma.nivel.findFirst({
      where: { ubicacionId: lote.ubicacionId, numero: 1 },
    })
    if (n1) {
      await prisma.loteEntrada.update({
        where: { id: lote.id },
        data: { nivelId: n1.id },
      })
    }
  }
  console.log(`✓ nivelId asignado en ${lotes.length} lotes de entrada`)

  console.log('\n✓ Migración de datos completada')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
