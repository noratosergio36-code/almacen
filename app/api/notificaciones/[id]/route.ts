import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { successResponse } from '@/lib/utils'

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const { error, userId } = await requireAuth()
  if (error) return error

  await prisma.notificacion.updateMany({
    where: { id: params.id, usuarioId: userId! },
    data: { leida: true },
  })

  return successResponse({ ok: true })
}
