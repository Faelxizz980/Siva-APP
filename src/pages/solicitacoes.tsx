import { useMemo, useState, useCallback } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import type { AuthUser } from '../types'
import type { SolicitacaoServico, CreateSolicitacaoDTO } from '../types/Solicitacao/solicitacao.types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { SensorEntity } from '../types/Sensor/sensor.types'
import type { Esp32 } from '../types/Esp32/esp32.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { LAYER_CLASS } from '../utils/layers'
import { SolicitacaoCard } from '../components/solicitacoes/solicitacao-card'
import { SolicitacaoFormModal } from '../components/solicitacoes/solicitacao-form-modal'
import { isTecnico } from '../utils/permissions'

interface Props {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  solicitacoes: SolicitacaoServico[]
  setSolicitacoes: React.Dispatch<React.SetStateAction<SolicitacaoServico[]>>
  sensores: SensorEntity[]
  esp32s: Esp32[]
  ordens?: OrdemServico[]
  onNotify: (tipo: 'sucesso' | 'info' | 'alerta' | 'erro', titulo: string, mensagem: string) => void
  usuarios: AuthUser[]
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

interface ToastState { message: string; type: ToastType }

export default function SolicitacoesScreen({ user, onLogout, onNavigate, solicitacoes, setSolicitacoes, sensores, esp32s, ordens = [], onNotify, usuarios, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction }: Props) {
  const tecnico = isTecnico(user)
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const handleCreate = useCallback((dto: CreateSolicitacaoDTO) => {
    const now = new Date().toISOString()
    const nextId = solicitacoes.length > 0 ? Math.max(...solicitacoes.map((s) => s.id)) + 1 : 1
    const nova: SolicitacaoServico = {
      id: nextId,
      empresa_id: user.empresa_id ?? 1,
      solicitante_id: user.id,
      sensor_id: dto.equipamentoTipo === 'sensor' ? dto.equipamentoId : null,
      esp32_id: dto.equipamentoTipo === 'esp32' ? dto.equipamentoId : null,
      tipo: dto.tipo,
      status: 'aberta',
      descricao: dto.descricao,
      data_solicitada: now,
      data_desejada: dto.data_desejada ? new Date(dto.data_desejada + 'T00:00:00').toISOString() : null,
      atualizado_em: now,
    }
    setSolicitacoes((prev) => [nova, ...prev])
    showToast('Solicitação criada com sucesso')
    onNotify('sucesso', 'Nova solicitação', `Solicitação #${nextId} (${dto.tipo}) criada — ${dto.equipamentoTipo === 'sensor' ? `Sensor #${dto.equipamentoId}` : `ESP32 #${dto.equipamentoId}`}`)
    setFormOpen(false)
  }, [solicitacoes, user, setSolicitacoes, showToast, onNotify])

  const filtradas = useMemo(() => {
    let r = [...solicitacoes]
    // empresa isolation
    r = r.filter((s) => s.empresa_id === (user.empresa_id ?? 1) || user.nivel.tipo === 'super_admin')
    // técnico vê e acompanha apenas as próprias solicitações
    if (tecnico) r = r.filter((s) => s.solicitante_id === user.id)
    if (filtroStatus !== 'todos') r = r.filter((s) => s.status === filtroStatus)
    if (filtroTipo !== 'todos') r = r.filter((s) => s.tipo === filtroTipo)
    // ordena por mais recente
    r.sort((a, b) => new Date(b.data_solicitada).getTime() - new Date(a.data_solicitada).getTime())
    return r
  }, [solicitacoes, filtroStatus, filtroTipo, user, tecnico])

  const ordemIdBySolicitacao = useMemo(() => {
    const m = new Map<number, number>()
    for (const o of ordens) {
      if (o.solicitacao_id !== null && !m.has(o.solicitacao_id)) m.set(o.solicitacao_id, o.id)
    }
    return m
  }, [ordens])

  const userMap = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of usuarios) m.set(u.id, u.nome)
    return m
  }, [usuarios])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader user={user} onMenuToggle={() => setNavOpen((p) => !p)} onProfileClick={() => setProfileOpen(true)} onLogout={onLogout} onNavigate={onNavigate} notifications={notifications} onMarkAsRead={onMarkAsRead} onMarkAllAsRead={onMarkAllAsRead} onNotificationAction={onNotificationAction} />
      <TopNav user={user} activeItem="solicitacoes" onNavigate={onNavigate} isMobileOpen={navOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-xl font-bold text-jet-black">Solicitações de Serviço</h1>
                <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">
                  {tecnico
                    ? 'Crie solicitações de serviço e acompanhe o status das suas.'
                    : 'Abra solicitações para sensores ou ESP32s. Acompanhe status e histórico.'}
                </p>
              </div>
              <Button onClick={() => setFormOpen(true)} className="shrink-0 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                <Plus size={16} /> Nova Solicitação
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                label="Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos status' },
                  { value: 'aberta', label: 'Aberta' },
                  { value: 'em_analise', label: 'Em análise' },
                  { value: 'aprovada', label: 'Aprovada' },
                  { value: 'agendada', label: 'Agendada' },
                  { value: 'recusada', label: 'Recusada' },
                  { value: 'concluida', label: 'Concluída' },
                  { value: 'cancelada', label: 'Cancelada' },
                ]}
              />
              <Select
                label="Tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos tipos' },
                  { value: 'preventiva', label: 'Preventiva' },
                  { value: 'inspecao', label: 'Inspeção' },
                  { value: 'corretiva', label: 'Corretiva' },
                ]}
              />
              <div className="flex items-end pb-1">
                <span className="text-xs text-slate-500">{filtradas.length} resultado(s)</span>
              </div>
            </div>

            {filtradas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-air-blue/20 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
                  <ClipboardList size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhuma solicitação encontrada</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">Crie a primeira solicitação para começar o fluxo de manutenção.</p>
                <Button onClick={() => setFormOpen(true)} className="mt-6 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                  <Plus size={16} /> Nova Solicitação
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtradas.map((s) => (
                  <SolicitacaoCard key={s.id} solicitacao={s} sensores={sensores} esp32s={esp32s} solicitanteNome={userMap.get(s.solicitante_id)} ordemId={ordemIdBySolicitacao.get(s.id) ?? null} />
                ))}
              </div>
            )}
          </div>
        </main>

      <SolicitacaoFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} sensores={sensores} esp32s={esp32s} />
      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      {toast && (
        <div className={['pointer-events-none fixed bottom-4 right-4 flex flex-col gap-2', LAYER_CLASS.toast].join(' ')}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
