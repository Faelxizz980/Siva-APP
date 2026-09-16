import { useMemo, useState, useCallback } from 'react'
import { Plus, ClipboardList, CalendarDays, Wrench } from 'lucide-react'
import type { AuthUser } from '../types'
import type { OrdemServico, CreateOrdemDTO } from '../types/OrdemServico/ordem.types'
import type { SolicitacaoServico } from '../types/Solicitacao/solicitacao.types'
import type { SensorEntity } from '../types/Sensor/sensor.types'
import type { Esp32 } from '../types/Esp32/esp32.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { OrdemCard } from '../components/ordens/ordem-card'
import { OrdemFormModal } from '../components/ordens/ordem-form-modal'
import { formatDateBR } from '../utils/format'

interface Props {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  ordens: OrdemServico[]
  setOrdens: React.Dispatch<React.SetStateAction<OrdemServico[]>>
  solicitacoes: SolicitacaoServico[]
  setSolicitacoes: React.Dispatch<React.SetStateAction<SolicitacaoServico[]>>
  sensores: SensorEntity[]
  esp32s: Esp32[]
  usuarios: AuthUser[]
  onNotify: (tipo: 'sucesso' | 'info' | 'alerta' | 'erro', titulo: string, mensagem: string) => void
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

export default function OrdensScreen({ user, onLogout, onNavigate, ordens, setOrdens, solicitacoes, setSolicitacoes, sensores, esp32s, usuarios, onNotify, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction }: Props) {
  const canSchedule = ['tecnico', 'gestor', 'admin', 'super_admin'].includes(user.nivel.tipo)
  const tecnicos = useMemo(() => usuarios.filter((u) => u.nivel.tipo === 'tecnico'), [usuarios])

  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null)
  const [solicitacaoPrefill, setSolicitacaoPrefill] = useState<SolicitacaoServico | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [viewMode, setViewMode] = useState<'lista' | 'agenda'>('lista')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroTecnico, setFiltroTecnico] = useState<string>('todos')

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const solicitacoesAgendaveis = useMemo(() => {
    return solicitacoes.filter((s) => ['aberta', 'em_analise', 'aprovada'].includes(s.status) && s.empresa_id === (user.empresa_id ?? 1))
  }, [solicitacoes, user])

  const filteredOrdens = useMemo(() => {
    let r = ordens.filter((o) => o.empresa_id === (user.empresa_id ?? 1) || user.nivel.tipo === 'super_admin')
    if (filtroStatus !== 'todos') r = r.filter((o) => o.status === filtroStatus)
    if (filtroTecnico !== 'todos') {
      if (filtroTecnico === 'sem_tecnico') r = r.filter((o) => !o.tecnico_id)
      else r = r.filter((o) => String(o.tecnico_id) === filtroTecnico)
    }
    r.sort((a, b) => {
      const da = a.data_agendada ? new Date(a.data_agendada).getTime() : 0
      const db = b.data_agendada ? new Date(b.data_agendada).getTime() : 0
      return da - db
    })
    return r
  }, [ordens, filtroStatus, filtroTecnico, user])

  // conflitos: mesmo técnico mesmo dia
  const conflitoIds = useMemo(() => {
    const map = new Map<string, number>()
    const conflicts = new Set<number>()
    for (const o of filteredOrdens) {
      if (!o.tecnico_id || !o.data_agendada) continue
      const dia = new Date(o.data_agendada).toISOString().slice(0, 10)
      const key = `${o.tecnico_id}-${dia}`
      if (map.has(key)) {
        conflicts.add(o.id)
        // also mark previous
        for (const prev of filteredOrdens) {
          if (prev.tecnico_id === o.tecnico_id && prev.data_agendada && new Date(prev.data_agendada).toISOString().slice(0, 10) === dia) {
            conflicts.add(prev.id)
          }
        }
      } else {
        map.set(key, o.id)
      }
    }
    return conflicts
  }, [filteredOrdens])

  // agenda agrupada por data
  const agendaGrupos = useMemo(() => {
    const grupos = new Map<string, OrdemServico[]>()
    for (const o of filteredOrdens) {
      const dia = o.data_agendada ? new Date(o.data_agendada).toISOString().slice(0, 10) : 'sem_data'
      if (!grupos.has(dia)) grupos.set(dia, [])
      grupos.get(dia)!.push(o)
    }
    return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredOrdens])

  const handleSubmit = useCallback(
    (dto: CreateOrdemDTO, editingId?: number, solicitacaoOrigemId?: number | null) => {
      const now = new Date().toISOString()
      if (editingId) {
        setOrdens((prev) =>
          prev.map((o) =>
            o.id === editingId
              ? {
                  ...o,
                  tipo: dto.tipo,
                  sensor_id: dto.equipamentoTipo === 'sensor' ? dto.equipamentoId : null,
                  esp32_id: dto.equipamentoTipo === 'esp32' ? dto.equipamentoId : null,
                  tecnico_id: dto.tecnico_id ?? null,
                  descricao: dto.descricao,
                  data_agendada: dto.data_agendada ?? o.data_agendada,
                  status: dto.tecnico_id ? 'agendada' : o.status,
                  atualizado_em: now,
                }
              : o,
          ),
        )
        showToast('OS reagendada', 'info')
        onNotify('info', 'OS reagendada', `OS #${editingId} reagendada`)
      } else {
        const nextId = ordens.length > 0 ? Math.max(...ordens.map((o) => o.id)) + 1 : 1
        const nova: OrdemServico = {
          id: nextId,
          solicitacao_id: dto.solicitacao_id ?? solicitacaoOrigemId ?? null,
          plano_manutencao_id: dto.plano_manutencao_id ?? null,
          empresa_id: user.empresa_id ?? 1,
          tecnico_id: dto.tecnico_id ?? null,
          sensor_id: dto.equipamentoTipo === 'sensor' ? dto.equipamentoId : null,
          esp32_id: dto.equipamentoTipo === 'esp32' ? dto.equipamentoId : null,
          tipo: dto.tipo,
          status: dto.tecnico_id ? 'agendada' : 'aberta',
          descricao: dto.descricao,
          observacao_execucao: null,
          data_agendada: dto.data_agendada ?? null,
          data_limite: null,
          aberto_em: now,
          iniciado_em: null,
          concluido_em: null,
          atualizado_em: now,
        }
        setOrdens((prev) => [nova, ...prev])
        if (solicitacaoOrigemId) {
          setSolicitacoes((prev) => prev.map((s) => (s.id === solicitacaoOrigemId ? { ...s, status: 'agendada', atualizado_em: now } : s)))
        }
        showToast('Ordem criada com sucesso')
        onNotify('sucesso', 'Ordem criada', `OS #${nextId} (${dto.tipo}) ${dto.tecnico_id ? 'agendada' : 'aberta — aguardando técnico'}`)
      }
      setFormOpen(false)
      setEditingOrdem(null)
      setSolicitacaoPrefill(null)
    },
    [ordens, user, setOrdens, setSolicitacoes, showToast, onNotify],
  )

  const handleReagendar = useCallback((o: OrdemServico) => {
    setEditingOrdem(o)
    setSolicitacaoPrefill(null)
    setFormOpen(true)
  }, [])

  const handleCancelar = useCallback(
    (o: OrdemServico) => {
      if (!window.confirm(`Cancelar OS #${o.id}?`)) return
      setOrdens((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: 'cancelada' as const, atualizado_em: new Date().toISOString() } : x)))
      showToast('OS cancelada', 'info')
      onNotify('erro', 'OS cancelada', `OS #${o.id} cancelada`)
    },
    [setOrdens, showToast, onNotify],
  )

  const handleStatusChange = useCallback(
    (o: OrdemServico, novo: OrdemServico['status']) => {
      const now = new Date().toISOString()
      setOrdens((prev) =>
        prev.map((x) =>
          x.id === o.id
            ? {
                ...x,
                status: novo,
                iniciado_em: novo === 'em_andamento' ? now : x.iniciado_em,
                concluido_em: novo === 'concluida' ? now : x.concluido_em,
                atualizado_em: now,
              }
            : x,
        ),
      )
      showToast(`OS #${o.id} → ${novo}`, 'info')
      if (novo === 'concluida') onNotify('sucesso', 'OS concluída', `OS #${o.id} concluída`)
      if (novo === 'em_andamento') onNotify('info', 'OS em andamento', `OS #${o.id} iniciada`)
    },
    [setOrdens, showToast, onNotify],
  )

  const openFromSolicitacao = (s: SolicitacaoServico) => {
    setSolicitacaoPrefill(s)
    setEditingOrdem(null)
    setFormOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader user={user} onMenuToggle={() => setNavOpen((p) => !p)} onProfileClick={() => setProfileOpen(true)} onLogout={onLogout} onNavigate={onNavigate} notifications={notifications} onMarkAsRead={onMarkAsRead} onMarkAllAsRead={onMarkAllAsRead} onNotificationAction={onNotificationAction} />
      <TopNav activeItem="ordens" onNavigate={onNavigate} isMobileOpen={navOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-xl font-bold text-jet-black">Ordens de Serviço</h1>
                <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">Agende a partir de solicitações ou crie avulsa. OS de plano (aberta, sem técnico) aparecem aqui para atribuir.</p>
              </div>
              {canSchedule && (
                <Button
                  onClick={() => {
                    setEditingOrdem(null)
                    setSolicitacaoPrefill(null)
                    setFormOpen(true)
                  }}
                  className="shrink-0 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white"
                >
                  <Plus size={16} /> Nova Ordem
                </Button>
              )}
            </div>

            {!canSchedule && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Apenas técnico/gestor/admin podem agendar.</div>}

            {/* Solicitações agendáveis */}
            {solicitacoesAgendaveis.length > 0 && (
              <div className="rounded-xl border border-sea-green/20 bg-sea-green/5 p-4">
                <h3 className="font-heading text-sm font-semibold text-jet-black">Solicitações aguardando agendamento ({solicitacoesAgendaveis.length})</h3>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {solicitacoesAgendaveis.map((s) => (
                    <div key={s.id} className="min-w-64 shrink-0 rounded-xl border border-air-blue/20 bg-white p-3">
                      <p className="font-body text-xs font-semibold text-jet-black">#{s.id} • {s.tipo} • {s.sensor_id !== null ? `Sensor #${s.sensor_id}` : `ESP32 #${s.esp32_id}`}</p>
                      <p className="mt-1 line-clamp-2 font-body text-xs text-air-blue">{s.descricao}</p>
                      <p className="mt-1 font-body text-xs text-air-blue/70 capitalize">{s.status}</p>
                      {canSchedule && (
                        <Button onClick={() => openFromSolicitacao(s)} variant="secondary" className="mt-2 w-full text-xs">
                          Agendar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros + view toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Select
                label="Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'aberta', label: 'Aberta (sem técnico)' },
                  { value: 'agendada', label: 'Agendada' },
                  { value: 'em_andamento', label: 'Em andamento' },
                  { value: 'concluida', label: 'Concluída' },
                  { value: 'cancelada', label: 'Cancelada' },
                ]}
              />
              <Select
                label="Técnico"
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                options={[{ value: 'todos', label: 'Todos' }, { value: 'sem_tecnico', label: 'Sem técnico' }, ...tecnicos.map((t) => ({ value: String(t.id), label: t.nome }))]}
              />
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('lista')}
                  className={['cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold', viewMode === 'lista' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'].join(' ')}
                >
                  <ClipboardList size={14} className="inline mr-1" /> Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('agenda')}
                  className={['cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold', viewMode === 'agenda' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'].join(' ')}
                >
                  <CalendarDays size={14} className="inline mr-1" /> Agenda
                </button>
              </div>
              <span className="pb-2 text-xs text-slate-500">{filteredOrdens.length} OS</span>
            </div>

            {filteredOrdens.length === 0 ? (
              <div className="rounded-xl border border-dashed border-air-blue/20 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
                  <Wrench size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhuma ordem encontrada</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">Crie uma avulsa ou agende a partir de uma solicitação.</p>
              </div>
            ) : viewMode === 'lista' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredOrdens.map((o) => (
                  <OrdemCard
                    key={o.id}
                    ordem={o}
                    sensores={sensores}
                    esp32s={esp32s}
                    tecnicos={usuarios}
                    conflito={conflitoIds.has(o.id)}
                    onReagendar={handleReagendar}
                    onCancelar={handleCancelar}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {agendaGrupos.map(([dia, ordensDia]) => (
                  <div key={dia} className="rounded-xl border border-air-blue/20 bg-white p-4">
                    <h3 className="font-heading text-sm font-semibold text-jet-black">
                      {dia === 'sem_data' ? 'Sem data agendada' : formatDateBR(dia)} • {ordensDia.length} OS
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {ordensDia.map((o) => (
                        <OrdemCard
                          key={o.id}
                          ordem={o}
                          sensores={sensores}
                          esp32s={esp32s}
                          tecnicos={usuarios}
                          conflito={conflitoIds.has(o.id)}
                          onReagendar={handleReagendar}
                          onCancelar={handleCancelar}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

      <OrdemFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingOrdem(null)
          setSolicitacaoPrefill(null)
        }}
        onSubmit={handleSubmit}
        sensores={sensores}
        esp32s={esp32s}
        tecnicos={tecnicos}
        solicitacaoPrefill={solicitacaoPrefill}
        ordemEditing={editingOrdem}
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
