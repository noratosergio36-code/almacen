import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RootDashboardPage() {
  const session = await getServerSession(authOptions)
  const rol = (session?.user as any)?.rol

  if (rol === 'ADMIN') redirect('/dashboard')
  redirect('/almacen')
}
