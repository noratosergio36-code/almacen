import { Resend } from 'resend'

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'inventario@inventapro.com'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function enviarEmailEntradaSinPrecio(to: string, entradaId: string) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: '[InventaPro] Nueva entrada requiere asignación de precio',
    html: `
      <div style="font-family:sans-serif;background:#0A0C0F;color:#E8EAED;padding:32px">
        <h1 style="color:#00D4FF">InventaPro</h1>
        <p>Se ha registrado una nueva entrada al almacén que requiere asignación de precio.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/entradas/${entradaId}"
           style="display:inline-block;background:#00D4FF;color:#0A0C0F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
          Asignar precio →
        </a>
      </div>
    `,
  })
}

export async function enviarEmailApartadoVencimiento(to: string, apartadoId: string, fechaExpira: Date) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: '[InventaPro] Tu apartado está próximo a vencer',
    html: `
      <div style="font-family:sans-serif;background:#0A0C0F;color:#E8EAED;padding:32px">
        <h1 style="color:#00D4FF">InventaPro</h1>
        <p>Tu apartado vence el <strong>${fechaExpira.toLocaleDateString('es-MX')}</strong>.</p>
        <p>Procesa la salida antes del vencimiento para no perder la reserva.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/apartados"
           style="display:inline-block;background:#FFB300;color:#0A0C0F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
          Ver apartado →
        </a>
      </div>
    `,
  })
}

export async function enviarEmailBienvenida(to: string, nombre: string, password: string) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: '[InventaPro] Bienvenido — tus credenciales de acceso',
    html: `
      <div style="font-family:sans-serif;background:#0A0C0F;color:#E8EAED;padding:32px">
        <h1 style="color:#00D4FF">InventaPro</h1>
        <p>Hola <strong>${nombre}</strong>, tu cuenta ha sido creada.</p>
        <p>Email: <code>${to}</code></p>
        <p>Contraseña temporal: <code>${password}</code></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
           style="display:inline-block;background:#00D4FF;color:#0A0C0F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
          Iniciar sesión →
        </a>
      </div>
    `,
  })
}
