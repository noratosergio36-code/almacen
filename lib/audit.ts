import { prisma } from './prisma'

export async function registrarAudit(
  accion: string,
  entidad: string,
  options: {
    usuarioId?: string
    entidadId?: string
    detalle?: Record<string, string | number | boolean | null>
    ip?: string
  } = {}
) {
  await prisma.auditLog.create({
    data: {
      accion,
      entidad,
      usuarioId: options.usuarioId,
      entidadId: options.entidadId,
      detalle: options.detalle,
      ip: options.ip,
    },
  })
}
