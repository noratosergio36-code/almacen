export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { requireAuth, getPaginationParams } from '@/lib/apiHelpers'
import { ArticuloSchema } from '@/lib/validations'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function GET(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const { skip, limit } = getPaginationParams(req.url)
  const q = searchParams.get('q')

  const where = {
    activo: true,
    ...(q ? { OR: [
      { nombre: { contains: q, mode: 'insensitive' as const } },
      { marca: { contains: q, mode: 'insensitive' as const } },
      { numeroParte: { contains: q, mode: 'insensitive' as const } },
    ]} : {}),
  }

  const [articulos, total] = await Promise.all([
    prisma.articulo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
      include: {
        ubicaciones: { include: { ubicacion: true } },
        lotesEntrada: { where: { cantidadDisponible: { gt: 0 } }, select: { cantidadDisponible: true } },
        _count: { select: { apartadoItems: true } },
      },
    }),
    prisma.articulo.count({ where }),
  ])

  return successResponse({ articulos, total, page: Math.ceil(skip / limit) + 1, limit })
}

export async function POST(req: Request) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol === Rol.USUARIO) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const body = await req.json()
  const parsed = ArticuloSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR')

  const articulo = await prisma.articulo.create({ data: parsed.data })
  return successResponse(articulo, 201)
}

