import { useMemo, useState, useCallback } from 'react'
import { Plus, Wrench } from 'lucide-react'
import type { AuthUser } from '../types'
import type { Procedimento, CreateProcedimentoDTO } from '../types/Procedimento/procedimento.types'
import type { Especialidade } from '../types/Especialidade/especialidade.types'
import type { PlanoManutencao } from '../types/PlanoManutencao/plano.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { Sidebar } from '../components/dashboard/sidebar'
import { DashboardHeader } from '../components/dashboard/header'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { ProcedimentoCard } from '../components/procedimentos/procedimento-card'
import { ProcedimentoFormModal } from '../components/procedimentos/procedimento-form-modal'

interface Props {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  procedimentos: Procedimento[]
  setProcedimentos: React.Dispatch<React.SetStateAction<Procedimento[]>>
  especialidades: Especialidade[]
  setEspecialidades: React.Dispatch<React.SetStateAction<Especialidade[]>>
  planos: PlanoManutencao[]
  usuarios: AuthUser[]
  onNotify: (tipo: 'sucesso' | 'info' | 'alerta' | 'erro', titulo: string, mensagem: string) => void
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

interface ToastState { message: string; type: ToastType }

export default function ProcedimentosScreen({ user, onLogout, onNavigate, procedimentos, setProcedimentos, especialidades, setEspecialidades, planos, usuarios, onNotify, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction }: Props) {
  const canManage = ['gestor', 'admin', 'super_admin'].includes(user.nivel.tipo)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Procedimento | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroCat, setFiltroCat] = useState<string>('todos')

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const especialidadesEmUso = useMemo(() => {
    const ids = new Set<number>()
    for (const p of planos.filter((pl) => pl.ativo)) {
      const proc = procedimentos.find((pr) => pr.id === p.procedimento_id)
      if (proc) proc.especialidade_ids.forEach((id) => ids.add(id))
    }
    return ids
  }, [planos, procedimentos])

  const filtered = useMemo(() => {
    let r = procedimentos.filter((p) => p.empresa_id === (user.empresa_id ?? 1) || user.nivel.tipo === 'super_admin')
    if (busca.trim()) r = r.filter((p) => p.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    if (filtroCat !== 'todos') r = r.filter((p) => p.categoria === filtroCat)
    return r
  }, [procedimentos, busca, filtroCat, user])

  const userMap = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of usuarios) m.set(u.id, u.nome)
    return m
  }, [usuarios])

  const handleSubmit = useCallback(
    (dto: CreateProcedimentoDTO, editingId?: number) => {
      const now = new Date().toISOString()
      if (editingId) {
        setProcedimentos((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, nome: dto.nome, supervisor_id: dto.supervisor_id, categoria: dto.categoria, descricao: dto.descricao ?? null, especialidade_ids: dto.especialidade_ids, atualizado_em: now } : p)),
        )
        showToast('Procedimento atualizado')
        onNotify('info', 'Procedimento atualizado', `${dto.nome} foi atualizado`)
      } else {
        const nextId = procedimentos.length > 0 ? Math.max(...procedimentos.map((p) => p.id)) + 1 : 1
        const novo: Procedimento = {
          id: nextId,
          empresa_id: user.empresa_id ?? 1,
          nome: dto.nome,
          supervisor_id: dto.supervisor_id,
          categoria: dto.categoria,
          descricao: dto.descricao ?? null,
          ativo: true,
          criado_em: now,
          atualizado_em: now,
          especialidade_ids: dto.especialidade_ids,
        }
        setProcedimentos((prev) => [novo, ...prev])
        showToast('Procedimento cadastrado')
        onNotify('sucesso', 'Procedimento criado', `${dto.nome} cadastrado`)
      }
      setFormOpen(false)
      setEditing(null)
    },
    [procedimentos, user, setProcedimentos, showToast, onNotify],
  )

  const handleToggleAtivo = useCallback(
    (p: Procedimento) => {
      if (p.ativo && especialidadesEmUso.size > 0) {
        const emUso = p.especialidade_ids.some((id) => especialidadesEmUso.has(id))
        if (emUso) {
          const ok = window.confirm('Este procedimento está em uso por plano ativo. Inativar mesmo assim? Ele não poderá ser usado em novos planos.')
          if (!ok) return
        }
      }
      setProcedimentos((prev) => prev.map((x) => (x.id === p.id ? { ...x, ativo: !x.ativo, atualizado_em: new Date().toISOString() } : x)))
      showToast(p.ativo ? 'Procedimento inativado' : 'Procedimento reativado', 'info')
    },
    [especialidadesEmUso, setProcedimentos, showToast],
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} activeItem="procedimentos" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} onMenuToggle={() => setSidebarOpen((p) => !p)} onProfileClick={() => setProfileOpen(true)} onLogout={onLogout} notifications={notifications} onMarkAsRead={onMarkAsRead} onMarkAllAsRead={onMarkAllAsRead} onNotificationAction={onNotificationAction} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Procedimentos</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">Padrões de trabalho reutilizáveis. Cada um exige uma equipe de especialidades.</p>
              </div>
              {canManage && (
                <Button onClick={() => { setEditing(null); setFormOpen(true) }} className="shrink-0">
                  <Plus size={16} /> Novo Procedimento
                </Button>
              )}
            </div>

            {!canManage && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Apenas gestor/admin/super_admin podem criar/editar procedimentos.</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input label="Buscar por nome" placeholder="Ex: Preventiva Bomba" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <Select label="Categoria" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} options={[{ value: 'todos', label: 'Todas' }, { value: 'preventiva', label: 'Preventiva' }, { value: 'inspecao', label: 'Inspeção' }]} />
              <span className="pb-2 text-xs text-slate-500">{filtered.length} resultado(s)</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Wrench size={28} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Nenhum procedimento encontrado</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Cadastre o primeiro procedimento para depois criar planos de manutenção.</p>
                {canManage && (
                  <Button onClick={() => setFormOpen(true)} className="mt-6">
                    <Plus size={16} /> Novo Procedimento
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProcedimentoCard
                    key={p.id}
                    procedimento={p}
                    especialidades={especialidades}
                    supervisorNome={userMap.get(p.supervisor_id)}
                    emUsoPorPlanoAtivo={p.especialidade_ids.some((id) => especialidadesEmUso.has(id))}
                    onEdit={(proc) => { setEditing(proc); setFormOpen(true) }}
                    onToggleAtivo={handleToggleAtivo}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ProcedimentoFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initialData={editing}
        usuarios={usuarios}
        especialidades={especialidades}
        setEspecialidades={setEspecialidades}
        procedimentos={procedimentos}
        planosUsandoIds={especialidadesEmUso}
      />
      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
