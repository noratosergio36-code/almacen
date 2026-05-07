export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiHelpers'
import { successResponse } from '@/lib/utils'

export async function GET() {
  const { error, userId } = await requireAuth()
  if (error) return error

  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId: userId! },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return successResponse(notificaciones)
}

