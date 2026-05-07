export const dynamic = 'force-dynamic'
import { requireAuth } from '@/lib/apiHelpers'
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/utils'

export async function POST() {
  const { error, userId } = await requireAuth()
  if (error) return error

  const token = Math.floor(100000 + Math.random() * 900000).toString()

  await prisma.auditLog.create({
    data: {
      accion: 'TELEGRAM_TOKEN',
      entidad: 'Usuario',
      usuarioId: userId,
      detalle: { token },
    },
  })

  return successResponse({ token })
}

