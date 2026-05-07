'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Warehouse, ArrowDownToLine, ArrowUpFromLine,
  Bookmark, Package, MapPin, FolderOpen, Truck, BarChart3,
  Users, User, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { href: '/almacen', label: 'Almacén', icon: Warehouse, roles: ['ADMIN', 'ALMACENISTA', 'USUARIO'] },
  { href: '/entradas', label: 'Entradas', icon: ArrowDownToLine, roles: ['ADMIN', 'ALMACENISTA'] },
  { href: '/salidas', label: 'Salidas', icon: ArrowUpFromLine, roles: ['ADMIN', 'ALMACENISTA'] },
  { href: '/apartados', label: 'Apartados', icon: Bookmark, roles: ['ADMIN', 'ALMACENISTA', 'USUARIO'] },
  { href: '/articulos', label: 'Artículos', icon: Package, roles: ['ADMIN', 'ALMACENISTA', 'USUARIO'] },
  { href: '/ubicaciones', label: 'Ubicaciones', icon: MapPin, roles: ['ADMIN', 'ALMACENISTA'] },
  { href: '/proyectos', label: 'Proyectos', icon: FolderOpen, roles: ['ADMIN', 'ALMACENISTA', 'USUARIO'] },
  { href: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'ALMACENISTA'] },
  { href: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['ADMIN'] },
  { href: '/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { href: '/perfil', label: 'Mi perfil', icon: User, roles: ['ADMIN', 'ALMACENISTA', 'USUARIO'] },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol ?? 'USUARIO'

  const visibleItems = navItems.filter((item) => item.roles.includes(rol))

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 flex flex-col glass',
          'w-60 border-r transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-display text-xl font-bold tracking-widest"
            style={{ color: 'var(--accent-primary)' }}>
            INVENTAPRO
          </span>
          <button onClick={onClose} className="lg:hidden p-1"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all',
                      active
                        ? 'font-medium'
                        : 'hover:bg-[var(--bg-tertiary)]'
                    )}
                    style={{
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      background: active ? 'rgba(0,212,255,0.08)' : undefined,
                    }}
                  >
                    <item.icon size={16} />
                    <span className="font-display tracking-wide">{item.label}</span>
                    {active && (
                      <span className="ml-auto w-1 h-5 rounded-full"
                        style={{ background: 'var(--accent-primary)' }} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}>
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{rol}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
