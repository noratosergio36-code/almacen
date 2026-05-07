export const dynamic = 'force-dynamic'
import { requireAuth } from '@/lib/apiHelpers'
import { uploadImage } from '@/lib/cloudinary'
import { errorResponse, successResponse } from '@/lib/utils'
import { Rol } from '@prisma/client'

export async function POST(req: Request) {
  const { error, rol } = await requireAuth()
  if (error) return error
  if (rol === Rol.USUARIO) return errorResponse('Sin permiso', 'FORBIDDEN', 403)

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return errorResponse('No se recibió archivo', 'NO_FILE')

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadImage(buffer, 'inventapro/articulos')

  return successResponse({ url }, 201)
}

