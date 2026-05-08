export const dynamic = 'force-dynamic'
import { requireAuth } from '@/lib/apiHelpers'
import { errorResponse, successResponse } from '@/lib/utils'
import { validarCSV, parseCsvText, TipoCSV } from '@/lib/csv-validator'
import { Rol } from '@prisma/client'

export async function POST(req: Request) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol === Rol.USUARIO) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const body = await req.json()
  const { csvText, tipo } = body as { csvText: string; tipo: TipoCSV }

  if (!csvText || !tipo) return errorResponse('csvText y tipo son requeridos', 'VALIDATION_ERROR')
  if (!['entrada', 'salida', 'apartado'].includes(tipo)) return errorResponse('tipo inválido', 'VALIDATION_ERROR')

  const rows = parseCsvText(csvText)
  if (rows.length === 0) return errorResponse('El CSV no contiene filas de datos', 'EMPTY_CSV')
  if (rows.length > 500) return errorResponse('El CSV no puede tener más de 500 filas', 'TOO_MANY_ROWS')

  const resultado = await validarCSV(rows, tipo)
  return successResponse(resultado)
}
