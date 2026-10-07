import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Cpu, Search, Pencil, Key } from 'lucide-react'
import type { AuthUser } from '../types'
import type { Setor } from '../types/Setor/setor.types'
import type { SensorEntity } from '../types/Sensor/sensor.types'
import {
  ESP32_OFFLINE_THRESHOLD_MINUTES,
  type CreateEsp32DTO,
  type Esp32,
  type UpdateEsp32DTO,
} from '../types/Esp32/esp32.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { LAYER_CLASS } from '../utils/layers'
import { can } from '../utils/permissions'
import { Esp32FormModal } from '../components/esp32/esp32-form-modal'
import { Esp32TokenModal } from '../components/esp32/esp32-token-modal'
import { formatDateTimeBR, relativeTime } from '../utils/format'

interface Esp32ScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  setores: Setor[]
  esp32s: Esp32[]
  setEsp32s: React.Dispatch<React.SetStateAction<Esp32[]>>
  sensores: SensorEntity[]
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

function isOnline(ultimoContato: string | null): boolean {
  if (!ultimoContato) return false
  const t = new Date(ultimoContato).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() - t <= ESP32_OFFLINE_THRESHOLD_MINUTES * 60 * 1000
}

function generateToken(): string {
  return `tok_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export default function Esp32Screen({
  user,
  onLogout,
  onNavigate,
  setores,
  esp32s,
  setEsp32s,
  sensores,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationAction,
}: Esp32ScreenProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Esp32 | null>(null)
  const [viewingToken, setViewingToken] = useState<Esp32 | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('')
  const canWrite = can(user, 'infra:write')
  const canViewToken = can(user, 'esp32:token')

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    const t = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), [])

  const setorMap = useMemo(() => {
    const m = new Map<number, Setor>()
    for (const s of setores) m.set(s.id, s)
    return m
  }, [setores])

  const sensoresCount = useMemo(() => {
    const m = new Map<number, number>()
    for (const s of sensores) m.set(s.esp32_id, (m.get(s.esp32_id) ?? 0) + 1)
    return m
  }, [sensores])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return esp32s.filter((e) => {
      if (q && !`${e.esp_id} ${e.descricao ?? ''}`.toLowerCase().includes(q)) return false
      if (filtroSetor && String(e.setor_id) !== filtroSetor) return false
      return true
    })
  }, [esp32s, busca, filtroSetor])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditing(null)
  }, [])

  const handleCreate = useCallback(
    (data: CreateEsp32DTO): string => {
      const now = new Date().toISOString()
      const nextId = esp32s.length > 0 ? Math.max(...esp32s.map((e) => e.id)) + 1 : 1
      const token = generateToken()
      const novo: Esp32 = {
        id: nextId,
        empresa_id: user.empresa_id ?? 1,
        setor_id: data.setor_id,
        esp_id: data.esp_id,
        token,
        descricao: data.descricao ?? null,
        ativo: true,
        ultimo_contato: null,
        criado_em: now,
        atualizado_em: now,
      }
      setEsp32s((prev) => [novo, ...prev])
      showToast('ESP32 cadastrado com sucesso')
      return token
    },
    [esp32s, setEsp32s, user, showToast],
  )

  const handleUpdate = useCallback(
    (id: number, data: UpdateEsp32DTO): void => {
      setEsp32s((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                setor_id: data.setor_id ?? e.setor_id,
                esp_id: data.esp_id ?? e.esp_id,
                descricao: data.descricao !== undefined ? data.descricao : e.descricao,
                atualizado_em: new Date().toISOString(),
              }
            : e,
        ),
      )
      showToast('ESP32 atualizado com sucesso')
    },
    [setEsp32s, showToast],
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
      <TopNav user={user} activeItem="esp32" onNavigate={onNavigate} isMobileOpen={navOpen} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold text-jet-black">ESP32</h1>
              <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">
                Gerencie os dispositivos ESP32 vinculados aos setores. Cada um autentica o firmware via token.
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
                Novo ESP32
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por ESP ID ou descrição..."
                  aria-label="Buscar por ESP ID ou descrição"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3.5 pl-10 font-body text-sm text-jet-black outline-none placeholder:text-slate-400 focus:border-sea-green focus:ring-2 focus:ring-sea-green/20"
                />
              </div>
              <Select
                label="Filtrar por setor"
                id="filtro-setor"
                aria-label="Filtrar por setor"
                value={filtroSetor}
                onChange={(e) => setFiltroSetor(e.target.value)}
                options={[
                  { value: '', label: 'Todos os setores' },
                  ...setores.map((s) => ({ value: String(s.id), label: s.nome })),
                ]}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-busy="true" aria-label="Carregando ESP32">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : loadError ? (
              <div className="px-6 py-16 text-center">
                <h3 className="font-heading text-base font-semibold text-jet-black">Erro ao carregar ESP32</h3>
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
                  <Cpu size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhum ESP32 cadastrado</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">
                  {canWrite
                    ? 'Cadastre o primeiro ESP32 e vincule-o a um setor para autenticar o firmware.'
                    : 'Nenhum ESP32 disponível para consulta.'}
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
                    Novo ESP32
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-3xl text-left font-body text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 font-body text-xs text-slate-500">
                      <th className="px-4 py-3 font-semibold">ESP ID</th>
                      <th className="px-4 py-3 font-semibold">Descrição</th>
                      <th className="px-4 py-3 font-semibold">Setor</th>
                      <th className="px-4 py-3 font-semibold">Sensores</th>
                      <th className="px-4 py-3 font-semibold">Último contato</th>
                      {(canWrite || canViewToken) && <th className="px-4 py-3 text-right font-semibold">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.map((e) => {
                      const setor = setorMap.get(e.setor_id)
                      const online = isOnline(e.ultimo_contato)
                      return (
                        <tr key={e.id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-semibold text-jet-black">{e.esp_id}</td>
                          <td className="max-w-48 truncate px-4 py-3 text-slate-600" title={e.descricao ?? ''}>
                            {e.descricao ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{setor ? setor.nome : `Setor #${e.setor_id}`}</td>
                          <td className="px-4 py-3 text-slate-600">{sensoresCount.get(e.id) ?? 0}</td>
                          <td className="px-4 py-3">
                            {e.ultimo_contato ? (
                              <span
                                className="inline-flex items-center gap-1.5 text-slate-600"
                                title={formatDateTimeBR(e.ultimo_contato)}
                              >
                                <span
                                  aria-label={online ? 'Online' : 'Offline'}
                                  className={[
                                    'inline-block h-2 w-2 rounded-full',
                                    online ? 'bg-sea-green' : 'bg-slate-300',
                                  ].join(' ')}
                                />
                                {relativeTime(e.ultimo_contato)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-slate-400">
                                <span aria-label="Offline" className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                                Nunca
                              </span>
                            )}
                          </td>
                          {(canWrite || canViewToken) && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {canWrite && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditing(e)
                                      setFormOpen(true)
                                    }}
                                    aria-label={`Editar ESP32 ${e.esp_id}`}
                                    title="Editar"
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                )}
                                {canViewToken && (
                                  <button
                                    type="button"
                                    onClick={() => setViewingToken(e)}
                                    aria-label={`Ver token do ESP32 ${e.esp_id}`}
                                    title="Ver token"
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                  >
                                    <Key size={16} />
                                  </button>
                                )}
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
            {filtrados.length} ESP32 • offline após {ESP32_OFFLINE_THRESHOLD_MINUTES} min sem contato
          </p>
        </div>
      </main>

      <Esp32FormModal
        isOpen={formOpen}
        onClose={closeForm}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        setores={setores}
        initialData={editing}
        existingEsp32s={esp32s}
        onNavigateToSetores={() => {
          closeForm()
          onNavigate('setores')
        }}
      />

      <Esp32TokenModal isOpen={!!viewingToken} onClose={() => setViewingToken(null)} esp32={viewingToken} />

      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {toast && (
        <div className={['pointer-events-none fixed right-4 bottom-4 flex flex-col gap-2', LAYER_CLASS.toast].join(' ')}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
