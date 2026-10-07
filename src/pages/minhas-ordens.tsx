import { useCallback, useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Search, Eye, Play, CheckCircle2 } from 'lucide-react'
import type { AuthUser } from '../types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { SensorEntity } from '../types/Sensor/sensor.types'
import type { Esp32 } from '../types/Esp32/esp32.types'
import type { Ativo } from '../types/Ativo/ativo.types'
import type { Setor } from '../types/Setor/setor.types'
import type { PlanoManutencao } from '../types/PlanoManutencao/plano.types'
import type { Procedimento } from '../types/Procedimento/procedimento.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { LAYER_CLASS } from '../utils/layers'
import { MinhaOrdemDetailsModal } from '../components/minhas-ordens/minha-ordem-details-modal'
import { ordemService } from '../services/ordem.service'
import { ApiError, USE_API } from '../services/api'
import { formatDateTimeBR } from '../utils/format'

interface MinhasOrdensScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  ordens: OrdemServico[]
  setOrdens: React.Dispatch<React.SetStateAction<OrdemServico[]>>
  sensores: SensorEntity[]
  esp32s: Esp32[]
  ativos: Ativo[]
  setores: Setor[]
  planos: PlanoManutencao[]
  procedimentos: Procedimento[]
  onNotify: (tipo: 'sucesso' | 'info' | 'alerta' | 'erro', titulo: string, mensagem: string) => void
  onUnauthorized: () => void
  onForbidden: () => void
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

function isAtrasada(o: OrdemServico): boolean {
  if (!o.data_limite || o.status === 'concluida' || o.status === 'cancelada') return false
  return new Date(o.data_limite).getTime() < Date.now()
}

export default function MinhasOrdensScreen({
  user,
  onLogout,
  onNavigate,
  ordens,
  setOrdens,
  sensores,
  esp32s,
  ativos,
  setores,
  planos,
  procedimentos,
  onNotify,
  onUnauthorized,
  onForbidden,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationAction,
}: MinhasOrdensScreenProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [viewing, setViewing] = useState<OrdemServico | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Com backend: GET /minhas-ordens já retorna só as do técnico logado.
  const [remoteOrdens, setRemoteOrdens] = useState<OrdemServico[] | null>(null)

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    if (!USE_API) {
      const t = window.setTimeout(() => setIsLoading(false), 350)
      return () => window.clearTimeout(t)
    }
    let alive = true
    ordemService
      .listMinhas()
      .then((data) => {
        if (alive) {
          setRemoteOrdens(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!alive) return
        if (err instanceof ApiError && err.isUnauthorized) {
          onUnauthorized()
          return
        }
        if (err instanceof ApiError && err.isForbidden) {
          onForbidden()
          return
        }
        setLoadError(err instanceof Error ? err.message : 'Erro ao carregar ordens')
        setIsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [onUnauthorized, onForbidden])

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const sensorMap = useMemo(() => new Map(sensores.map((s) => [s.id, s])), [sensores])
  const esp32Map = useMemo(() => new Map(esp32s.map((e) => [e.id, e])), [esp32s])
  const ativoMap = useMemo(() => new Map(ativos.map((a) => [a.id, a])), [ativos])
  const setorMap = useMemo(() => new Map(setores.map((s) => [s.id, s])), [setores])
  const planoMap = useMemo(() => new Map(planos.map((p) => [p.id, p])), [planos])
  const procMap = useMemo(() => new Map(procedimentos.map((p) => [p.id, p])), [procedimentos])

  const resolveEquip = useCallback(
    (o: OrdemServico): { ativoNome: string; setorNome: string; label: string; prioridade: string } => {
      if (o.sensor_id !== null) {
        const s = sensorMap.get(o.sensor_id)
        const ativo = s ? ativoMap.get(s.ativo_id) : undefined
        const setor = ativo ? setorMap.get(ativo.setor_id) : undefined
        return {
          ativoNome: ativo?.nome ?? `Sensor #${o.sensor_id}`,
          setorNome: setor?.nome ?? '—',
          label: s ? `${s.tag ?? s.sensor_id} — ${s.descricao ?? ''}` : `Sensor #${o.sensor_id}`,
          prioridade: ativo?.criticidade ?? '—',
        }
      }
      if (o.esp32_id !== null) {
        const e = esp32Map.get(o.esp32_id)
        const setor = e ? setorMap.get(e.setor_id) : undefined
        return {
          ativoNome: e ? e.esp_id : `ESP32 #${o.esp32_id}`,
          setorNome: setor?.nome ?? '—',
          label: e ? `${e.esp_id} — ${e.descricao ?? ''}` : `ESP32 #${o.esp32_id}`,
          prioridade: '—',
        }
      }
      return { ativoNome: '—', setorNome: '—', label: '—', prioridade: '—' }
    },
    [sensorMap, esp32Map, ativoMap, setorMap],
  )

  // Sem backend o filtro abaixo simula o GET /minhas-ordens (o back filtra pelo logado).
  const minhas = useMemo(() => {
    const base = remoteOrdens ?? ordens.filter((o) => o.tecnico_id === user.id)
    const q = busca.trim().toLowerCase()
    return base
      .filter((o) => {
        if (filtroStatus !== 'todos' && o.status !== filtroStatus) return false
        if (filtroPrioridade !== 'todas' && resolveEquip(o).prioridade !== filtroPrioridade) return false
        if (q) {
          const r = resolveEquip(o)
          if (!`#${o.id} ${o.descricao} ${r.ativoNome} ${r.setorNome} ${r.label}`.toLowerCase().includes(q)) return false
        }
        return true
      })
      .sort((a, b) => (a.data_agendada ?? '').localeCompare(b.data_agendada ?? ''))
  }, [remoteOrdens, ordens, user, busca, filtroStatus, filtroPrioridade, resolveEquip])

  const procedimentoNome = useCallback(
    (o: OrdemServico): string | null => {
      if (o.plano_manutencao_id === null) return null
      const plano = planoMap.get(o.plano_manutencao_id)
      if (!plano) return `Plano #${o.plano_manutencao_id}`
      return procMap.get(plano.procedimento_id)?.nome ?? `Plano #${plano.id}`
    },
    [planoMap, procMap],
  )

  const applyStatus = useCallback(
    async (o: OrdemServico, novo: OrdemServico['status'], observacao?: string): Promise<void> => {
      if (USE_API) {
        try {
          await ordemService.updateStatus(o.id, novo, observacao)
        } catch (err) {
          if (err instanceof ApiError && err.isUnauthorized) {
            onUnauthorized()
            return
          }
          if (err instanceof ApiError && err.isForbidden) {
            onForbidden()
            return
          }
          showToast(err instanceof Error ? err.message : 'Erro ao atualizar OS', 'error')
          return
        }
      }
      const now = new Date().toISOString()
      setOrdens((prev) =>
        prev.map((x) =>
          x.id === o.id
            ? {
                ...x,
                status: novo,
                iniciado_em: novo === 'em_andamento' ? now : x.iniciado_em,
                concluido_em: novo === 'concluida' ? now : x.concluido_em,
                observacao_execucao: observacao ?? x.observacao_execucao,
                atualizado_em: now,
              }
            : x,
        ),
      )
      showToast(`OS #${o.id} → ${novo}`, 'info')
      if (novo === 'concluida') onNotify('sucesso', 'OS concluída', `OS #${o.id} concluída`)
      if (novo === 'em_andamento') onNotify('info', 'OS em andamento', `OS #${o.id} iniciada`)
      setViewing(null)
    },
    [setOrdens, showToast, onNotify, onUnauthorized, onForbidden],
  )

  const viewingResolved = viewing ? { ordem: viewing, equip: resolveEquip(viewing) } : null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader
        user={user}
        onMenuToggle={() => setNavOpen((p) => !p)}
        onProfileClick={() => setProfileOpen(true)}
        onLogout={onLogout}
        onNavigate={onNavigate}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onNotificationAction={onNotificationAction}
      />
      <TopNav user={user} activeItem="minhas-ordens" onNavigate={onNavigate} isMobileOpen={navOpen} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-jet-black">Minhas Ordens</h1>
            <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">
              Ordens de serviço atribuídas a você. Inicie e conclua com a observação da execução.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nº, ativo, setor..."
                  aria-label="Buscar ordens"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3.5 pl-10 font-body text-sm text-jet-black outline-none placeholder:text-slate-400 focus:border-sea-green focus:ring-2 focus:ring-sea-green/20"
                />
              </div>
              <Select
                label="Filtrar por status"
                id="filtro-status"
                aria-label="Filtrar por status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos os status' },
                  { value: 'aberta', label: 'Aberta' },
                  { value: 'agendada', label: 'Agendada' },
                  { value: 'em_andamento', label: 'Em andamento' },
                  { value: 'concluida', label: 'Concluída' },
                  { value: 'cancelada', label: 'Cancelada' },
                ]}
              />
              <Select
                label="Filtrar por prioridade"
                id="filtro-prioridade"
                aria-label="Filtrar por prioridade"
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                options={[
                  { value: 'todas', label: 'Todas as prioridades' },
                  { value: 'alta', label: 'Alta' },
                  { value: 'media', label: 'Média' },
                  { value: 'baixa', label: 'Baixa' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-busy="true" aria-label="Carregando ordens">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : loadError ? (
              <div className="px-6 py-16 text-center">
                <h3 className="font-heading text-base font-semibold text-jet-black">Erro ao carregar ordens</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">{loadError}</p>
                <Button onClick={() => window.location.reload()} className="mt-6">
                  Tentar novamente
                </Button>
              </div>
            ) : minhas.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
                  <ClipboardCheck size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhuma ordem atribuída</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">
                  Você não tem ordens de serviço no momento. Novas atribuições aparecem aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-3xl text-left font-body text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 font-body text-xs text-slate-500">
                      <th className="px-4 py-3 font-semibold">OS</th>
                      <th className="px-4 py-3 font-semibold">Ativo</th>
                      <th className="px-4 py-3 font-semibold">Setor</th>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Prioridade</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Prazo</th>
                      <th className="px-4 py-3 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {minhas.map((o) => {
                      const r = resolveEquip(o)
                      const atrasada = isAtrasada(o)
                      return (
                        <tr key={o.id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-semibold text-jet-black">#{o.id}</td>
                          <td className="px-4 py-3 text-slate-600">{r.ativoNome}</td>
                          <td className="px-4 py-3 text-slate-600">{r.setorNome}</td>
                          <td className="px-4 py-3 text-slate-600">{o.tipo}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {r.prioridade === '—' ? '—' : r.prioridade.charAt(0).toUpperCase() + r.prioridade.slice(1)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {atrasada ? (
                              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600" title={`Agendada: ${formatDateTimeBR(o.data_agendada)}`}>
                                Atrasada • {formatDateTimeBR(o.data_limite)}
                              </span>
                            ) : (
                              <span className="text-slate-600" title={`Agendada: ${formatDateTimeBR(o.data_agendada)}`}>
                                {formatDateTimeBR(o.data_limite)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewing(o)}
                                aria-label={`Abrir OS #${o.id}`}
                                title="Abrir"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              >
                                <Eye size={16} />
                              </button>
                              {o.status === 'agendada' && (
                                <button
                                  type="button"
                                  onClick={() => void applyStatus(o, 'em_andamento')}
                                  aria-label={`Iniciar OS #${o.id}`}
                                  title="Iniciar"
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-50"
                                >
                                  <Play size={16} />
                                </button>
                              )}
                              {o.status === 'em_andamento' && (
                                <button
                                  type="button"
                                  onClick={() => setViewing(o)}
                                  aria-label={`Concluir OS #${o.id}`}
                                  title="Concluir"
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-green-600 transition-colors hover:bg-green-50"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="font-body text-xs text-air-blue">{minhas.length} ordem(ns) atribuída(s) a você</p>
        </div>
      </main>

      {viewingResolved && (
        <MinhaOrdemDetailsModal
          isOpen={!!viewing}
          onClose={() => setViewing(null)}
          ordem={viewingResolved.ordem}
          ativoNome={viewingResolved.equip.ativoNome}
          setorNome={viewingResolved.equip.setorNome}
          equipamentoLabel={viewingResolved.equip.label}
          procedimentoNome={procedimentoNome(viewingResolved.ordem)}
          isAtrasada={isAtrasada(viewingResolved.ordem)}
          onStart={(o) => void applyStatus(o, 'em_andamento')}
          onComplete={(o, obs) => void applyStatus(o, 'concluida', obs)}
        />
      )}

      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {toast && (
        <div className={['pointer-events-none fixed right-4 bottom-4 flex flex-col gap-2', LAYER_CLASS.toast].join(' ')}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
