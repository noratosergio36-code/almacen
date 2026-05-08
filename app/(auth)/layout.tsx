export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center noise-bg"
      style={{ background: 'var(--auth-layout-bg)' }}
    >
      {children}
    </div>
  )
}
