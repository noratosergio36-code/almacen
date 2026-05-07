export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { UbicacionSchema } from '@/lib/validations'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const ubicaciones = await prisma.ubicacion.findMany({
    where: { activa: true },
    orderBy: { nombre: 'asc' },
    include: {
      articuloUbicaciones: {
        include: { articulo: { select: { id: true, nombre: true, fotoUrl: true } } },
      },
    },
  })

  return successResponse(ubicaciones)
}

export async function POST(req: Request) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol === Rol.USUARIO) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const body = await req.json()
  const parsed = UbicacionSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR')

  const ubicacion = await prisma.ubicacion.create({ data: parsed.data })
  return successResponse(ubicacion, 201)
}

