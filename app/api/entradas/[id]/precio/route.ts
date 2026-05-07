import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { PrecioLoteSchema } from '@/lib/validations'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { error, rol, userId } = await requireAuth()
  if (error) return error
  if (rol !== Rol.ADMIN) return errorResponse('Solo Admin puede asignar precios', 'FORBIDDEN', 403)

  const body = await req.json()

  const lotes: Array<{ loteId: string; precioUnitario: number }> = body.lotes
  if (!lotes || !Array.isArray(lotes)) {
    return errorResponse('Se requiere array de lotes con precios', 'VALIDATION_ERROR')
  }

  for (const item of lotes) {
    const parsed = PrecioLoteSchema.safeParse({ precioUnitario: item.precioUnitario })
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR')

    await prisma.loteEntrada.update({
      where: { id: item.loteId },
      data: { precioUnitario: item.precioUnitario, precioPendiente: false },
    })
  }

  await prisma.notificacion.updateMany({
    where: {
      tipo: 'ENTRADA_SIN_PRECIO',
      metadata: { path: ['entradaId'], equals: params.id },
    },
    data: { leida: true },
  })

  return successResponse({ ok: true })
}
