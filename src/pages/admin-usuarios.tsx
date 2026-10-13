import { useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '../types'
import { AdminLayout } from '../components/admin/admin-layout'
import { usuarioService } from '../services/usuario.service'
import { empresaService } from '../services/empresa.service'

interface AdminUsuariosProps {
  user: AuthUser
  onNavigate: (page: string) => void
  onLogout: () => void
}

export default function AdminUsuarios({ user, onNavigate, onLogout }: AdminUsuariosProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usuarios, setUsuarios] = useState<AuthUser[]>([])
  const [empresaMap, setEmpresaMap] = useState<Record<number, string>>({})
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  useEffect(() => {
    let alive = true
    async function load(): Promise<void> {
      try {
        const [lista, empresas] = await Promise.all([usuarioService.listAll(), empresaService.list()])
        if (!alive) return
        setUsuarios(lista)
        const map: Record<number, string> = {}
        for (const e of empresas) map[e.id] = e.nome
        setEmpresaMap(map)
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Falha ao carregar usuários')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return usuarios.filter((u) => {
      if (filtroTipo !== 'todos' && u.nivel.tipo !== filtroTipo) return false
      if (!termo) return true
      return u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    })
  }, [usuarios, busca, filtroTipo])

  return (
    <AdminLayout user={user} activeItem="admin-usuarios" onNavigate={onNavigate} onLogout={onLogout} title="Usuários" subtitle="Todos os usuários cadastrados no sistema">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-body text-sm text-jet-black placeholder:text-slate-400 focus:border-sea-green focus:outline-none focus:ring-2 focus:ring-sea-green/20 sm:max-w-xs"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-body text-sm text-jet-black focus:border-sea-green focus:outline-none focus:ring-2 focus:ring-sea-green/20"
          aria-label="Filtrar por tipo"
        >
          <option value="todos">Todos os tipos</option>
          <option value="admin">ADMIN</option>
          <option value="gestor">GESTOR</option>
          <option value="tecnico">TÉCNICO</option>
        </select>
      </div>

      {loading && <p className="font-body text-sm text-air-blue">Carregando usuários...</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && filtrados.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-body text-sm text-slate-600">Nenhum usuário encontrado.</p>
        </div>
      )}
      {!loading && !error && filtrados.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left font-body text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-jet-black">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                      {u.nivel.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.empresa_id !== null && empresaMap[u.empresa_id] ? empresaMap[u.empresa_id] : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        u.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600',
                      ].join(' ')}
                    >
                      {u.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
