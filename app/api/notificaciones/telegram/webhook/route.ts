export const dynamic = 'force-dynamic'
import { procesarComandoTelegram } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.message) {
      await procesarComandoTelegram(body.message)
    }
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ ok: false }, { status: 500 })
  }
}

