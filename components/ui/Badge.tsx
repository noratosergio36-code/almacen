import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' | 'info'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)]',
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  purple:  'badge-purple',
  cyan:    'badge-cyan',
  info:    'badge-info',
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
