import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-secondary)]',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-active)] border border-[var(--border)]',
  danger: 'bg-[var(--accent-danger)] text-white hover:opacity-90',
  ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
  outline: 'border border-[var(--border-active)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display tracking-wide',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
