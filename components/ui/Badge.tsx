import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)]',
  success: 'bg-[#00E67620] text-[var(--accent-success)] border-[#00E67640]',
  warning: 'bg-[#FFB30020] text-[var(--accent-warning)] border-[#FFB30040]',
  danger: 'bg-[#FF3D5720] text-[var(--accent-danger)] border-[#FF3D5740]',
  purple: 'bg-[#7C4DFF20] text-[var(--accent-purple)] border-[#7C4DFF40]',
  cyan: 'bg-[#00D4FF20] text-[var(--accent-primary)] border-[#00D4FF40]',
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
