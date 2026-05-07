import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { ArticuloSchema } from '@/lib/validations'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  const articulo = await prisma.articulo.findUnique({
    where: { id: params.id },
    include: {
      ubicaciones: { include: { ubicacion: true } },
      lotesEntrada: {
        orderBy: { createdAt: 'asc' },
        include: { entrada: { include: { usuario: true, proveedor: true } } },
      },
    },
  })

  if (!articulo) return errorResponse('Artículo no encontrado', 'NOT_FOUND', 404)
  return successResponse(articulo)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const body = await req.json()
  const parsed = ArticuloSchema.partial().safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR')

  const articulo = await prisma.articulo.update({ where: { id: params.id }, data: parsed.data })
  return successResponse(articulo)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  await prisma.articulo.update({ where: { id: params.id }, data: { activo: false } })
  return successResponse({ ok: true })
}
