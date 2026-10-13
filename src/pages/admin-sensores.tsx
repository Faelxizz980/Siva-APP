import { useEffect, useState } from 'react'
import type { AuthUser } from '../types'
import { AdminLayout } from '../components/admin/admin-layout'
import { Button } from '../components/ui/button'
import { Toast, type ToastType } from '../components/ui/toast'
import { adminSensorService } from '../services/admin-sensor.service'
import type { AdminSensor } from '../data/admin.mock'

interface AdminSensoresProps {
  user: AuthUser
  onNavigate: (page: string) => void
  onLogout: () => void
}

export default function AdminSensores({ user, onNavigate, onLogout }: AdminSensoresProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sensores, setSensores] = useState<AdminSensor[]>([])
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  useEffect(() => {
    let alive = true
    async function load(): Promise<void> {
      try {
        const data = await adminSensorService.list()
        if (alive) setSensores(data)
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Falha ao carregar sensores')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  async function handleCreate(): Promise<void> {
    setCreating(true)
    try {
      const created = await adminSensorService.create({})
      setSensores((prev) => [created, ...prev])
      setToast({ message: `Sensor ${created.codigo} gerado`, type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao cadastrar sensor', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <AdminLayout user={user} activeItem="admin-sensores" onNavigate={onNavigate} onLogout={onLogout} title="Sensores" subtitle="Cadastro gera o código de uso entregue à empresa compradora">
      <div className="mb-4">
        <Button onClick={handleCreate} isLoading={creating} className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
          Cadastrar sensor
        </Button>
      </div>
      {loading && <p className="font-body text-sm text-air-blue">Carregando sensores...</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">{error}</div>}
      {!loading && !error && sensores.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-body text-sm text-slate-600">Nenhum sensor cadastrado.</p>
        </div>
      )}
      {!loading && !error && sensores.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left font-body text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {sensores.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-jet-black">{s.codigo}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.empresa_nome ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[80]">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </AdminLayout>
  )
}
