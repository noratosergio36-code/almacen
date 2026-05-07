export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { enviarNotificacion } from '@/lib/notifications'

export async function POST() {
  const vencidos = await prisma.apartado.findMany({
    where: { estado: 'ACTIVO', fechaExpira: { lt: new Date() } },
  })

  for (const apartado of vencidos) {
    await prisma.apartado.update({
      where: { id: apartado.id },
      data: { estado: 'VENCIDO' },
    })

    await enviarNotificacion({
      usuarioId: apartado.usuarioId,
      tipo: 'APARTADO_VENCIMIENTO',
      titulo: 'Tu apartado ha vencido',
      mensaje: 'Los artículos apartados quedaron disponibles para otros usuarios.',
      metadata: { apartadoId: apartado.id },
      canales: { inApp: true, email: true, telegram: true },
    })
  }

  return Response.json({ procesados: vencidos.length })
}

