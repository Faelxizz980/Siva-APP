import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Radio, Search, Pencil, Power } from 'lucide-react'
import type { AuthUser } from '../types'
import type { Setor } from '../types/Setor/setor.types'
import type { Ativo } from '../types/Ativo/ativo.types'
import type { Esp32 } from '../types/Esp32/esp32.types'
import {
  SENSOR_OFFLINE_THRESHOLD_MINUTES,
  type CreateSensorDTO,
  type SensorEntity,
} from '../types/Sensor/sensor.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { LAYER_CLASS } from '../utils/layers'
import { can } from '../utils/permissions'
import { SensorFormModal } from '../components/sensores/sensor-form-modal'
import { formatDateTimeBR, relativeTime } from '../utils/format'

interface SensoresScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  setores: Setor[]
  ativos: Ativo[]
  sensores: SensorEntity[]
  setSensores: React.Dispatch<React.SetStateAction<SensorEntity[]>>
  esp32s: Esp32[]
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

function isOnline(ultimoContato: string | null): boolean {
  if (!ultimoContato) return false
  const t = new Date(ultimoContato).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() - t <= SENSOR_OFFLINE_THRESHOLD_MINUTES * 60 * 1000
}

export default function SensoresScreen({
  user,
  onLogout,
  onNavigate,
  setores,
  ativos,
  sensores,
  setSensores,
  esp32s,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationAction,
}: SensoresScreenProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SensorEntity | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState('')
  const [filtroEsp32, setFiltroEsp32] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const canWrite = can(user, 'infra:write')

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    const t = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const ativoMap = useMemo(() => {
    const m = new Map<number, Ativo>()
    for (const a of ativos) m.set(a.id, a)
    return m
  }, [ativos])

  const setorMap = useMemo(() => {
    const m = new Map<number, Setor>()
    for (const s of setores) m.set(s.id, s)
    return m
  }, [setores])

  const esp32Map = useMemo(() => {
    const m = new Map<number, Esp32>()
    for (const e of esp32s) m.set(e.id, e)
    return m
  }, [esp32s])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return sensores.filter((s) => {
      if (q && !`${s.tag ?? ''} ${s.descricao ?? ''}`.toLowerCase().includes(q)) return false
      if (filtroAtivo && String(s.ativo_id) !== filtroAtivo) return false
      if (filtroEsp32 && String(s.esp32_id) !== filtroEsp32) return false
      if (filtroStatus === 'ligado' && !s.ativo) return false
      if (filtroStatus === 'desligado' && s.ativo) return false
      return true
    })
  }, [sensores, busca, filtroAtivo, filtroEsp32, filtroStatus])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditing(null)
  }, [])

  const handleSubmit = useCallback(
    (data: CreateSensorDTO) => {
      const now = new Date().toISOString()
      if (editing) {
        setSensores((prev) =>
          prev.map((s) =>
            s.id === editing.id
              ? {
                  ...s,
                  ativo_id: data.ativo_id,
                  esp32_id: data.esp32_id,
                  sensor_id: data.sensor_id,
                  tag: data.tag,
                  descricao: data.descricao ?? null,
                  ativo: data.ativo_status ?? true,
                  atualizado_em: now,
                }
              : s,
          ),
        )
        showToast('Sensor atualizado com sucesso')
      } else {
        const nextId = sensores.length > 0 ? Math.max(...sensores.map((s) => s.id)) + 1 : 1
        const novo: SensorEntity = {
          id: nextId,
          empresa_id: user.empresa_id ?? 1,
          ativo_id: data.ativo_id,
          esp32_id: data.esp32_id,
          sensor_id: data.sensor_id,
          tag: data.tag,
          descricao: data.descricao ?? null,
          ativo: data.ativo_status ?? true,
          criado_em: now,
          atualizado_em: now,
        }
        setSensores((prev) => [novo, ...prev])
        showToast('Sensor cadastrado com sucesso')
      }
      closeForm()
    },
    [editing, sensores, setSensores, user, showToast, closeForm],
  )

  const handleToggle = useCallback(
    (sensor: SensorEntity) => {
      setSensores((prev) =>
        prev.map((s) => (s.id === sensor.id ? { ...s, ativo: !s.ativo, atualizado_em: new Date().toISOString() } : s)),
      )
      showToast(sensor.ativo ? 'Sensor desativado' : 'Sensor ativado', 'info')
    },
    [setSensores, showToast],
  )

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
      <TopNav user={user} activeItem="sensores" onNavigate={onNavigate} isMobileOpen={navOpen} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold text-jet-black">Sensores</h1>
              <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">
                Gerencie os sensores de vazão vinculados a ativos e ESP32.
              </p>
            </div>
            {canWrite && (
              <Button
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
                className="shrink-0 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white"
              >
                <Plus size={16} />
                Novo Sensor
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por tag ou descrição..."
                  aria-label="Buscar por tag ou descrição"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3.5 pl-10 font-body text-sm text-jet-black outline-none placeholder:text-slate-400 focus:border-sea-green focus:ring-2 focus:ring-sea-green/20"
                />
              </div>
              <Select
                label="Filtrar por ativo"
                id="filtro-ativo"
                aria-label="Filtrar por ativo"
                value={filtroAtivo}
                onChange={(e) => setFiltroAtivo(e.target.value)}
                options={[
                  { value: '', label: 'Todos os ativos' },
                  ...ativos.map((a) => ({ value: String(a.id), label: `${a.tag} — ${a.nome}` })),
                ]}
              />
              <Select
                label="Filtrar por ESP32"
                id="filtro-esp32"
                aria-label="Filtrar por ESP32"
                value={filtroEsp32}
                onChange={(e) => setFiltroEsp32(e.target.value)}
                options={[
                  { value: '', label: 'Todos os ESP32' },
                  ...esp32s.map((e) => ({ value: String(e.id), label: e.esp_id })),
                ]}
              />
              <Select
                label="Filtrar por status"
                id="filtro-status"
                aria-label="Filtrar por status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos os status' },
                  { value: 'ligado', label: 'Ligado' },
                  { value: 'desligado', label: 'Desligado' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-busy="true" aria-label="Carregando sensores">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : loadError ? (
              <div className="px-6 py-16 text-center">
                <h3 className="font-heading text-base font-semibold text-jet-black">Erro ao carregar sensores</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">{loadError}</p>
                <Button
                  onClick={() => {
                    setLoadError(null)
                    setIsLoading(true)
                    window.setTimeout(() => setIsLoading(false), 350)
                  }}
                  className="mt-6"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : filtrados.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
                  <Radio size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhum sensor cadastrado</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">
                  {canWrite
                    ? 'Cadastre o primeiro sensor e vincule-o a um ativo e a um ESP32.'
                    : 'Nenhum sensor disponível para consulta.'}
                </p>
                {canWrite && (
                  <Button
                    onClick={() => {
                      setEditing(null)
                      setFormOpen(true)
                    }}
                    className="mt-6 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white"
                  >
                    <Plus size={16} />
                    Novo Sensor
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-3xl text-left font-body text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 font-body text-xs text-slate-500">
                      <th className="px-4 py-3 font-semibold">Tag</th>
                      <th className="px-4 py-3 font-semibold">Descrição</th>
                      <th className="px-4 py-3 font-semibold">Ativo</th>
                      <th className="px-4 py-3 font-semibold">Setor</th>
                      <th className="px-4 py-3 font-semibold">ESP32</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Último contato</th>
                      {canWrite && <th className="px-4 py-3 text-right font-semibold">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.map((s) => {
                      const ativo = ativoMap.get(s.ativo_id)
                      const setor = ativo ? setorMap.get(ativo.setor_id) : undefined
                      const esp = esp32Map.get(s.esp32_id)
                      const online = isOnline(esp?.ultimo_contato ?? null)
                      return (
                        <tr key={s.id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-semibold text-jet-black">{s.tag ?? '—'}</td>
                          <td className="max-w-48 truncate px-4 py-3 text-slate-600" title={s.descricao ?? ''}>
                            {s.descricao ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{ativo ? ativo.nome : `Ativo #${s.ativo_id}`}</td>
                          <td className="px-4 py-3 text-slate-600">{setor ? setor.nome : '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{esp ? esp.esp_id : `ESP32 #${s.esp32_id}`}</td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                s.ativo
                                  ? 'border-sea-green/20 bg-sea-green/10 text-slate-deep'
                                  : 'border-slate-200 bg-slate-100 text-slate-500',
                              ].join(' ')}
                            >
                              {s.ativo ? 'Ligado' : 'Desligado'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {esp?.ultimo_contato ? (
                              <span
                                className="inline-flex items-center gap-1.5 text-slate-600"
                                title={formatDateTimeBR(esp.ultimo_contato)}
                              >
                                <span
                                  aria-label={online ? 'Online' : 'Offline'}
                                  className={[
                                    'inline-block h-2 w-2 rounded-full',
                                    online ? 'bg-sea-green' : 'bg-slate-300',
                                  ].join(' ')}
                                />
                                {relativeTime(esp.ultimo_contato)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-slate-400">
                                <span aria-label="Offline" className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                                Nunca
                              </span>
                            )}
                          </td>
                          {canWrite && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditing(s)
                                    setFormOpen(true)
                                  }}
                                  aria-label={`Editar sensor ${s.tag ?? s.sensor_id}`}
                                  title="Editar"
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggle(s)}
                                  aria-label={`${s.ativo ? 'Desativar' : 'Ativar'} sensor ${s.tag ?? s.sensor_id}`}
                                  title={s.ativo ? 'Desativar' : 'Ativar'}
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                >
                                  <Power size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="font-body text-xs text-air-blue">
            {filtrados.length} sensor(es) • offline após {SENSOR_OFFLINE_THRESHOLD_MINUTES} min sem contato
          </p>
        </div>
      </main>

      <SensorFormModal
        isOpen={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        ativos={ativos}
        esp32s={esp32s}
        setores={setores}
        initialData={editing}
        existingSensors={sensores}
        onNavigateToEsp32={() => {
          closeForm()
          onNavigate('esp32')
        }}
      />

      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {toast && (
        <div className={['pointer-events-none fixed right-4 bottom-4 flex flex-col gap-2', LAYER_CLASS.toast].join(' ')}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
