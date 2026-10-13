import { useEffect, useState } from 'react'
import { Building2, Radio, Users, Wrench } from 'lucide-react'
import type { AuthUser } from '../types'
import { AdminLayout } from '../components/admin/admin-layout'
import { empresaService } from '../services/empresa.service'
import { usuarioService } from '../services/usuario.service'
import { adminSensorService } from '../services/admin-sensor.service'

interface AdminDashboardProps {
  user: AuthUser
  onNavigate: (page: string) => void
  onLogout: () => void
}

export default function AdminDashboard({ user, onNavigate, onLogout }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState({ empresas: 0, funcionarios: 0, sensores: 0 })

  useEffect(() => {
    let alive = true
    async function load(): Promise<void> {
      try {
        const [empresas, funcionarios, sensores] = await Promise.all([
          empresaService.list(),
          usuarioService.listAll(),
          adminSensorService.list(),
        ])
        if (alive) setCounts({ empresas: empresas.length, funcionarios: funcionarios.length, sensores: sensores.length })
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Falha ao carregar indicadores')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  const cards = [
    { label: 'Empresas', value: counts.empresas, icon: Building2, action: 'admin-empresas', hint: 'Ver empresas' },
    { label: 'Funcionários', value: counts.funcionarios, icon: Users, action: 'admin-usuarios', hint: 'Ver usuários' },
    { label: 'Sensores', value: counts.sensores, icon: Radio, action: 'admin-sensores', hint: 'Provisionar sensores' },
    { label: 'Operações', value: '—', icon: Wrench, action: 'admin-empresas', hint: 'Acompanhar por empresa' },
  ]

  return (
    <AdminLayout user={user} activeItem="admin" onNavigate={onNavigate} onLogout={onLogout} title="Dashboard administrativo" subtitle="Visão geral das empresas, funcionários e sensores do SIVA">
      {loading && <p className="font-body text-sm text-air-blue">Carregando indicadores...</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onNavigate(c.action)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <c.icon size={20} className="text-sea-green" />
              <p className="font-heading mt-3 text-3xl font-bold text-jet-black">{c.value}</p>
              <p className="font-body text-sm font-medium text-jet-black">{c.label}</p>
              <p className="font-body mt-1 text-xs text-air-blue">{c.hint} →</p>
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
