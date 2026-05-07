'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'

interface Proveedor {
  id: string
  nombre: string
  contacto?: string | null
  telefono?: string | null
  email?: string | null
}

export default function ProveedoresPage() {
  const { data: session } = useSession()
  const rol = (session?.user as any)?.rol
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Proveedor | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', contacto: '', telefono: '', email: '' })

  const fetchProveedores = useCallback(async () => {
    const res = await fetch('/api/proveedores')
    if (res.ok) setProveedores(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchProveedores() }, [fetchProveedores])

  function openCreate() {
    setEditando(null)
    setForm({ nombre: '', contacto: '', telefono: '', email: '' })
  }

  function openEdit(p: Proveedor) {
    setEditando(p)
    setForm({ nombre: p.nombre, contacto: p.contacto ?? '', telefono: p.telefono ?? '', email: p.email ?? '' })
  }

  async function guardar() {
    setSaving(true)
    const url = editando ? `/api/proveedores/${editando.id}` : '/api/proveedores'
    const method = editando ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editando ? 'Proveedor actualizado' : 'Proveedor creado')
      setEditando(null)
      setForm({ nombre: '', contacto: '', telefono: '', email: '' })
      fetchProveedores()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
    setSaving(false)
  }

  async function eliminar() {
    if (!confirmId) return
    const res = await fetch(`/api/proveedores/${confirmId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Proveedor eliminado')
      setConfirmId(null)
      fetchProveedores()
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Proveedores</h2>
        {rol === 'ADMIN' && (
          <Button size="sm" onClick={openCreate}><Plus size={14} /> Nuevo proveedor</Button>
        )}
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="card-industrial overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nombre', 'Contacto', 'Teléfono', 'Email', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="font-medium">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.contacto ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.telefono ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.email ?? '—'}</td>
                  {rol === 'ADMIN' && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={12} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(p.id)}>
                          <Trash2 size={12} style={{ color: 'var(--accent-danger)' }} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {proveedores.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No hay proveedores</p>
          )}
        </div>
      )}

      <Modal
        open={!!editando || (editando === null && form.nombre !== '' && false) || false}
        onClose={() => setEditando(null)}
        title={editando ? 'Editar proveedor' : 'Nuevo proveedor'}
        size="sm"
      >
        <div className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          <Input label="Contacto" value={form.contacto} onChange={(e) => setForm((f) => ({ ...f, contacto: e.target.value }))} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={guardar} loading={saving}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={eliminar}
        title="Eliminar proveedor"
        message="¿Estás seguro de que quieres eliminar este proveedor?"
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
