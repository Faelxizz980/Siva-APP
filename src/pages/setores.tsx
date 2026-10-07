import { useMemo, useState, useCallback } from 'react'
import { Plus, Building2 } from 'lucide-react'
import type { AuthUser } from '../types'
import type { Setor, CreateSetorDTO } from '../types/Setor/setor.types'
import type { Ativo } from '../types/Ativo/ativo.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Toast, type ToastType } from '../components/ui/toast'
import { LAYER_CLASS } from '../utils/layers'
import { SetorCard } from '../components/setores/setor-card'
import { SetorFormModal } from '../components/setores/setor-form-modal'
import { SetorDetailsModal } from '../components/setores/setor-details-modal'
import { SetorDeleteModal } from '../components/setores/setor-delete-modal'
import { can } from '../utils/permissions'

interface SetoresScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  setores: Setor[]
  setSetores: React.Dispatch<React.SetStateAction<Setor[]>>
  ativos: Ativo[]
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

interface ToastState {
  message: string
  type: ToastType
}

export default function SetoresScreen({ user, onLogout, onNavigate, setores, setSetores, ativos, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction }: SetoresScreenProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null)
  const [viewingSetor, setViewingSetor] = useState<Setor | null>(null)
  const [deletingSetor, setDeletingSetor] = useState<Setor | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const canWrite = can(user, 'infra:write')

  const closeForm = useCallback((): void => {
    setFormOpen(false)
    setEditingSetor(null)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success'): void => {
    setToast({ message, type })
  }, [])

  const handleCreateOrUpdate = useCallback(
    (data: CreateSetorDTO): void => {
      const now = new Date().toISOString()

      if (editingSetor) {
        setSetores((prev) =>
          prev.map((s) =>
            s.id === editingSetor.id
              ? {
                  ...s,
                  nome: data.nome,
                  descricao: data.descricao,
                  localizacao: data.localizacao,
                  ativo: data.ativo,
                  atualizado_em: now,
                }
              : s,
          ),
        )
        showToast('Setor atualizado com sucesso')
      } else {
        const nextId = setores.length > 0 ? Math.max(...setores.map((s) => s.id)) + 1 : 1
        const novo: Setor = {
          id: nextId,
          empresa_id: 1,
          nome: data.nome,
          descricao: data.descricao,
          localizacao: data.localizacao,
          ativo: data.ativo,
          criado_em: now,
          atualizado_em: now,
        }
        setSetores((prev) => [novo, ...prev])
        showToast('Setor cadastrado com sucesso')
      }

      closeForm()
    },
    [editingSetor, setores, showToast, closeForm, setSetores],
  )

  const handleEditClick = useCallback((setor: Setor): void => {
    setEditingSetor(setor)
    setFormOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback((): void => {
    if (!deletingSetor) return
    setSetores((prev) => prev.filter((s) => s.id !== deletingSetor.id))
    showToast('Setor excluído com sucesso')
    setDeletingSetor(null)
  }, [deletingSetor, showToast, setSetores])

  const ativosCountBySetor = useMemo(() => {
    const map = new Map<number, number>()
    for (const a of ativos) {
      map.set(a.setor_id, (map.get(a.setor_id) ?? 0) + 1)
    }
    return map
  }, [ativos])

  const getAtivosCount = useCallback(
    (setorId: number): number => ativosCountBySetor.get(setorId) ?? 0,
    [ativosCountBySetor],
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader
        user={user}
        onMenuToggle={() => setNavOpen((prev) => !prev)}
        onProfileClick={() => setProfileOpen(true)}
        onLogout={onLogout}
        onNavigate={onNavigate}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onNotificationAction={onNotificationAction}
      />
      <TopNav user={user} activeItem="setores" onNavigate={onNavigate} isMobileOpen={navOpen} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-xl font-bold text-jet-black">Setores</h1>
                <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">
                  Gerencie os setores da sua empresa e visualize os ativos vinculados a cada área.
                </p>
              </div>
              {canWrite && (
                <Button onClick={() => setFormOpen(true)} className="shrink-0 self-start sm:self-auto bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                  <Plus size={16} />
                  Novo Setor
                </Button>
              )}
            </div>

            {/* Listagem */}
            {setores.length === 0 ? (
              <div className="rounded-xl border border-dashed border-air-blue/20 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
                  <Building2 size={28} />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Nenhum setor cadastrado</h3>
                <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">
                  {canWrite
                    ? 'Você ainda não cadastrou nenhum setor. Comece criando o primeiro para organizar seus ativos.'
                    : 'Nenhum setor disponível para consulta.'}
                </p>
                {canWrite && (
                  <Button onClick={() => setFormOpen(true)} className="mt-6 bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                    <Plus size={16} />
                    Novo Setor
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {setores.map((setor) => (
                  <SetorCard
                    key={setor.id}
                    setor={setor}
                    ativosCount={getAtivosCount(setor.id)}
                    onView={(s) => setViewingSetor(s)}
                    onEdit={canWrite ? handleEditClick : undefined}
                    onDelete={canWrite ? (s) => setDeletingSetor(s) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

      {/* Modais */}
      <SetorFormModal isOpen={formOpen} onClose={closeForm} onSubmit={handleCreateOrUpdate} initialData={editingSetor} />

      <SetorDetailsModal
        isOpen={!!viewingSetor}
        onClose={() => setViewingSetor(null)}
        setor={viewingSetor}
        ativos={ativos}
      />

      <SetorDeleteModal
        isOpen={!!deletingSetor}
        onClose={() => setDeletingSetor(null)}
        onConfirm={handleDeleteConfirm}
        setor={deletingSetor}
      />

      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Toast */}
      {toast && (
        <div className={['pointer-events-none fixed bottom-4 right-4 flex flex-col gap-2', LAYER_CLASS.toast].join(' ')}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
