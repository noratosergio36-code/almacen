export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { ProveedorSchema } from '@/lib/validations'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function GET() {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol === Rol.USUARIO) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const proveedores = await prisma.proveedor.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })

  return successResponse(proveedores)
}

export async function POST(req: Request) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const body = await req.json()
  const parsed = ProveedorSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR')

  const proveedor = await prisma.proveedor.create({ data: parsed.data })
  return successResponse(proveedor, 201)
}

