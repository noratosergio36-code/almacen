import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { ProveedorSchema } from '@/lib/validations'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const body = await req.json()
  const parsed = ProveedorSchema.partial().safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR')

  const proveedor = await prisma.proveedor.update({ where: { id: params.id }, data: parsed.data })
  return successResponse(proveedor)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  await prisma.proveedor.update({ where: { id: params.id }, data: { activo: false } })
  return successResponse({ ok: true })
}
