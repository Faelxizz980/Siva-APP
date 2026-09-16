import { useMemo, useState, useCallback } from 'react'
import { Plus, CalendarClock } from 'lucide-react'
import type { AuthUser } from '../types'
import type { PlanoManutencao, CreatePlanoDTO } from '../types/PlanoManutencao/plano.types'
import type { Procedimento } from '../types/Procedimento/procedimento.types'
import type { Especialidade } from '../types/Especialidade/especialidade.types'
import type { SensorEntity } from '../types/Sensor/sensor.types'
import type { Esp32 } from '../types/Esp32/esp32.types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Toast, type ToastType } from '../components/ui/toast'
import { PlanoCard } from '../components/planos/plano-card'
import { PlanoFormModal } from '../components/planos/plano-form-modal'
import { PlanoHistoricoModal } from '../components/planos/plano-historico-modal'

interface Props {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  planos: PlanoManutencao[]
  setPlanos: React.Dispatch<React.SetStateAction<PlanoManutencao[]>>
  procedimentos: Procedimento[]
  especialidades: Especialidade[]
  sensores: SensorEntity[]
  esp32s: Esp32[]
  ordens: OrdemServico[]
  onNotify: (tipo: 'sucesso' | 'info' | 'alerta' | 'erro', titulo: string, mensagem: string) => void
  onRunJob?: () => void
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

export default function PlanosScreen({ user, onLogout, onNavigate, planos, setPlanos, procedimentos, especialidades, sensores, esp32s, ordens, onNotify, onRunJob, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction }: Props) {
  const canManage = ['gestor', 'admin', 'super_admin'].includes(user.nivel.tipo)
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PlanoManutencao | null>(null)
  const [viewing, setViewing] = useState<PlanoManutencao | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const procMap = useMemo(() => {
    const m = new Map<number, Procedimento>()
    for (const p of procedimentos) m.set(p.id, p)
    return m
  }, [procedimentos])

  const getEquipLabel = useCallback(
    (pl: PlanoManutencao) => {
      if (pl.sensor_id !== null) {
        const s = sensores.find((x) => x.id === pl.sensor_id)
        return s ? `${s.tag} — ${s.descricao ?? ''}` : `Sensor #${pl.sensor_id}`
      }
      const e = esp32s.find((x) => x.id === pl.esp32_id)
      return e ? `${e.esp_id} — ${e.descricao}` : `ESP32 #${pl.esp32_id}`
    },
    [sensores, esp32s],
  )

  const filtrados = useMemo(() => {
    let r = planos.filter((p) => p.empresa_id === (user.empresa_id ?? 1) || user.nivel.tipo === 'super_admin')
    r.sort((a, b) => a.proxima_geracao.localeCompare(b.proxima_geracao))
    return r
  }, [planos, user])

  const handleSubmit = useCallback(
    (dto: CreatePlanoDTO, editingId?: number) => {
      if (editingId) {
        // edição: só periodicidade, prazo, ativo
        setPlanos((prev) =>
          prev.map((pl) =>
            pl.id === editingId
              ? {
                  ...pl,
                  periodicidade: dto.periodicidade,
                  prazo_maximo_dias: dto.prazo_maximo_dias,
                  atualizado_em: new Date().toISOString(),
                }
              : pl,
          ),
        )
        showToast('Plano atualizado — próxima geração não recalculada retroativamente', 'info')
        onNotify('info', 'Plano atualizado', `Plano #${editingId} atualizado`)
      } else {
        const nextId = planos.length > 0 ? Math.max(...planos.map((p) => p.id)) + 1 : 1
        const now = new Date().toISOString()
        const novo: PlanoManutencao = {
          id: nextId,
          empresa_id: user.empresa_id ?? 1,
          procedimento_id: dto.procedimento_id,
          sensor_id: dto.equipamentoTipo === 'sensor' ? dto.equipamentoId : null,
          esp32_id: dto.equipamentoTipo === 'esp32' ? dto.equipamentoId : null,
          periodicidade: dto.periodicidade,
          data_inicio: dto.data_inicio,
          proxima_geracao: dto.data_inicio,
          prazo_maximo_dias: dto.prazo_maximo_dias,
          ativo: true,
          criado_em: now,
          atualizado_em: now,
        }
        setPlanos((prev) => [novo, ...prev])
        showToast('Plano criado')
        onNotify('sucesso', 'Plano criado', `Plano ${procMap.get(dto.procedimento_id)?.nome ?? `#${dto.procedimento_id}`} criado`)
      }
      setFormOpen(false)
      setEditing(null)
    },
    [planos, user, setPlanos, showToast, onNotify, procMap],
  )

  const handleToggle = useCallback(
    (pl: PlanoManutencao) => {
      setPlanos((prev) => prev.map((x) => (x.id === pl.id ? { ...x, ativo: !x.ativo, atualizado_em: new Date().toISOString() } : x)))
      showToast(pl.ativo ? 'Plano inativado — geração interrompida' : 'Plano reativado', 'info')
    },
    [setPlanos, showToast],
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader user={user} onMenuToggle={() => setNavOpen((p) => !p)} onProfileClick={() => setProfileOpen(true)} onLogout={onLogout} onNavigate={onNavigate} notifications={notifications} onMarkAsRead={onMarkAsRead} onMarkAllAsRead={onMarkAllAsRead} onNotificationAction={onNotificationAction} />
      <TopNav activeItem="planos" onNavigate={onNavigate} isMobileOpen={navOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-xl font-bold text-jet-black">Planos de Manutenção</h1>
                <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">Associe procedimentos a equipamentos com periodicidade. Gera OS automaticamente.</p>
              </div>
              <div className="flex gap-2">
                {onRunJob && (
                  <Button variant="secondary" onClick={onRunJob} className="shrink-0 text-xs">
                    Rodar Job (hoje)
                  </Button>
                )}
                {canManage ? (
                  <Button onClick={() => { setEditing(null); setFormOpen(true) }} className="shrink-0 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                    <Plus size={16} /> Novo Plano
                  </Button>
                ) : null}
              </div>
            </div>

            {!canManage && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Apenas gestor/admin/super_admin podem criar/editar planos.</div>}

            <div className="flex items-center gap-2 font-body text-xs text-air-blue">
              <CalendarClock size={14} /> {filtrados.length} plano(s) • ordenado por próxima geração
            </div>

            {filtrados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-air-blue/20 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
                  <CalendarClock size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhum plano cadastrado</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">Crie o primeiro plano para gerar ordens automaticamente.</p>
                {canManage && <Button onClick={() => setFormOpen(true)} className="mt-6 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white"><Plus size={16} /> Novo Plano</Button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((pl) => (
                  <PlanoCard
                    key={pl.id}
                    plano={pl}
                    procedimento={procMap.get(pl.procedimento_id)}
                    equipLabel={getEquipLabel(pl)}
                    onEdit={(p) => { setEditing(p); setFormOpen(true) }}
                    onToggle={handleToggle}
                    onViewHistorico={setViewing}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

      <PlanoFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initialData={editing}
        procedimentos={procedimentos}
        especialidades={especialidades}
        sensores={sensores}
        esp32s={esp32s}
      />
      <PlanoHistoricoModal isOpen={!!viewing} onClose={() => setViewing(null)} plano={viewing} procedimento={viewing ? procMap.get(viewing.procedimento_id) : undefined} ordens={ordens} />
      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
