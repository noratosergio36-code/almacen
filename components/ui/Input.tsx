import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium tracking-wider uppercase"
            style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 rounded-md text-sm outline-none transition-colors',
            'placeholder:text-[var(--text-muted)]',
            error
              ? 'border border-[var(--accent-danger)]'
              : 'border border-[var(--border)] focus:border-[var(--accent-primary)]',
            className
          )}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: 'var(--accent-danger)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
