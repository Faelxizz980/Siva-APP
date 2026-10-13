import { useEffect, useState } from 'react'
import type { AuthUser } from '../types'
import { AdminLayout } from '../components/admin/admin-layout'
import { empresaService, type EmpresaListItem } from '../services/empresa.service'

interface AdminEmpresasProps {
  user: AuthUser
  onNavigate: (page: string) => void
  onLogout: () => void
  onSelectEmpresa: (id: number) => void
}

export default function AdminEmpresas({ user, onNavigate, onLogout, onSelectEmpresa }: AdminEmpresasProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [empresas, setEmpresas] = useState<EmpresaListItem[]>([])

  useEffect(() => {
    let alive = true
    async function load(): Promise<void> {
      try {
        const data = await empresaService.list()
        if (alive) setEmpresas(data)
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Falha ao carregar empresas')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <AdminLayout user={user} activeItem="admin-empresas" onNavigate={onNavigate} onLogout={onLogout} title="Empresas" subtitle="Todas as empresas cadastradas no SIVA">
      {loading && <p className="font-body text-sm text-air-blue">Carregando empresas...</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && empresas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-body text-sm text-slate-600">Nenhuma empresa cadastrada.</p>
        </div>
      )}
      {!loading && !error && empresas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {empresas.map((e) => (
            <article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-bold text-jet-black">{e.nome}</h2>
                  <p className="font-body mt-1 text-xs text-slate-500">{e.cnpj ?? 'CNPJ não informado'}</p>
                </div>
                <span
                  className={[
                    'rounded-full px-2.5 py-1 font-body text-xs font-semibold',
                    e.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600',
                  ].join(' ')}
                >
                  {e.ativo ? 'ATIVA' : 'INATIVA'}
                </span>
              </div>
              <div className="font-body mt-3 flex gap-4 text-xs text-slate-600">
                <span>{e.funcionarios_count} funcionários</span>
                <span>{e.sensores_count} sensores</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectEmpresa(e.id)}
                className="mt-4 w-full rounded-lg bg-jet-black px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-air-blue"
              >
                Ver mais
              </button>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
