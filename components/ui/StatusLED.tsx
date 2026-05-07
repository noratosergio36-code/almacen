'use client'

type LEDStatus = 'ok' | 'warning' | 'danger' | 'idle' | 'purple'

const colors: Record<LEDStatus, string> = {
  ok: 'var(--accent-success)',
  warning: 'var(--accent-warning)',
  danger: 'var(--accent-danger)',
  idle: 'var(--text-muted)',
  purple: 'var(--accent-purple)',
}

export function StatusLED({ status, label }: { status: LEDStatus; label?: string }) {
  const color = colors[status]
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block rounded-sm"
        style={{
          width: 8,
          height: 8,
          background: color,
          boxShadow: status !== 'idle' ? `0 0 6px ${color}` : undefined,
        }}
      />
      {label && (
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </span>
  )
}
