import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  active?: boolean
  onClick?: () => void
}

export function Card({ children, className, active, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        active ? 'card-industrial-active' : 'card-industrial',
        onClick && 'cursor-pointer',
        'p-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-base font-semibold tracking-wide"
      style={{ color: 'var(--text-primary)' }}>
      {children}
    </h3>
  )
}
