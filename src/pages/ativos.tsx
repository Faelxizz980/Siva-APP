import { useCallback, useMemo, useState } from 'react'
import { Plus, Cog } from 'lucide-react'
import type { AuthUser } from '../types'
import type { Setor } from '../types/Setor/setor.types'
import type { Ativo, CreateAtivoDTO } from '../types/Ativo/ativo.types'
import { Sidebar } from '../components/dashboard/sidebar'
import { DashboardHeader } from '../components/dashboard/header'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'
import { Toast, type ToastType } from '../components/ui/toast'
import { AtivoCard } from '../components/ativos/ativo-card'
import { AtivoFormModal } from '../components/ativos/ativo-form-modal'
import { AtivoDetailsModal } from '../components/ativos/ativo-details-modal'
import { AtivoDeleteModal } from '../components/ativos/ativo-delete-modal'

interface AtivosScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  setores: Setor[]
  ativos: Ativo[]
  setAtivos: React.Dispatch<React.SetStateAction<Ativo[]>>
}

interface ToastState {
  message: string
  type: ToastType
}

export default function AtivosScreen({ user, onLogout, onNavigate, setores, ativos, setAtivos }: AtivosScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingAtivo, setEditingAtivo] = useState<Ativo | null>(null)
  const [viewingAtivo, setViewingAtivo] = useState<Ativo | null>(null)
  const [deletingAtivo, setDeletingAtivo] = useState<Ativo | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const setorMap = useMemo(() => {
    const m = new Map<number, Setor>()
    for (const s of setores) m.set(s.id, s)
    return m
  }, [setores])

  const getSetorNome = useCallback(
    (setorId: number): string => setorMap.get(setorId)?.nome ?? `Setor #${setorId}`,
    [setorMap],
  )

  const getSetor = useCallback((setorId: number): Setor | null => setorMap.get(setorId) ?? null, [setorMap])

  const closeForm = useCallback((): void => {
    setFormOpen(false)
    setEditingAtivo(null)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success'): void => {
    setToast({ message, type })
  }, [])

  const handleCreateOrUpdate = useCallback(
    (data: CreateAtivoDTO): void => {
      const now = new Date().toISOString()

      if (editingAtivo) {
        setAtivos((prev) =>
          prev.map((a) =>
            a.id === editingAtivo.id
              ? {
                  ...a,
                  nome: data.nome,
                  tag: data.tag,
                  tipo: data.tipo ?? null,
                  criticidade: data.criticidade,
                  centro_custo: data.centro_custo ?? null,
                  foto_url: data.foto_url ?? null,
                  manual_url: data.manual_url ?? null,
                  descricao: data.descricao ?? null,
                  setor_id: data.setor_id,
                  ativo: data.ativo ?? true,
                  atualizado_em: now,
                }
              : a,
          ),
        )
        showToast('Ativo atualizado com sucesso')
      } else {
        const nextId = ativos.length > 0 ? Math.max(...ativos.map((a) => a.id)) + 1 : 1
        const novo: Ativo = {
          id: nextId,
          empresa_id: 1,
          setor_id: data.setor_id,
          nome: data.nome,
          tag: data.tag,
          tipo: data.tipo ?? null,
          criticidade: data.criticidade,
          centro_custo: data.centro_custo ?? null,
          foto_url: data.foto_url ?? null,
          manual_url: data.manual_url ?? null,
          descricao: data.descricao ?? null,
          ativo: data.ativo ?? true,
          criado_em: now,
          atualizado_em: now,
        }
        setAtivos((prev) => [novo, ...prev])
        showToast('Ativo cadastrado com sucesso')
      }

      closeForm()
    },
    [editingAtivo, ativos, setAtivos, showToast, closeForm],
  )

  const handleEditClick = useCallback((ativo: Ativo): void => {
    setEditingAtivo(ativo)
    setFormOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback((): void => {
    if (!deletingAtivo) return
    setAtivos((prev) => prev.filter((a) => a.id !== deletingAtivo.id))
    showToast('Ativo excluído com sucesso')
    setDeletingAtivo(null)
  }, [deletingAtivo, setAtivos, showToast])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} activeItem="ativos" onNavigate={onNavigate} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onProfileClick={() => setProfileOpen(true)}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Ativos</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Gerencie máquinas e equipamentos vinculados aos setores da empresa. Cada ativo pertence a um setor.
                </p>
              </div>
              <Button onClick={() => setFormOpen(true)} className="shrink-0 self-start sm:self-auto">
                <Plus size={16} />
                Novo Ativo
              </Button>
            </div>

            {ativos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Cog size={28} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Nenhum ativo cadastrado</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Cadastre o primeiro ativo e vincule-o a um setor para visualizar a hierarquia Setor → Ativos.
                </p>
                <Button onClick={() => setFormOpen(true)} className="mt-6">
                  <Plus size={16} />
                  Novo Ativo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {ativos.map((ativo) => (
                  <AtivoCard
                    key={ativo.id}
                    ativo={ativo}
                    setorNome={getSetorNome(ativo.setor_id)}
                    onView={(a) => setViewingAtivo(a)}
                    onEdit={handleEditClick}
                    onDelete={(a) => setDeletingAtivo(a)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <AtivoFormModal
        isOpen={formOpen}
        onClose={closeForm}
        onSubmit={handleCreateOrUpdate}
        setores={setores}
        initialData={editingAtivo}
        existingAtivos={ativos}
      />

      <AtivoDetailsModal
        isOpen={!!viewingAtivo}
        onClose={() => setViewingAtivo(null)}
        ativo={viewingAtivo}
        setor={viewingAtivo ? getSetor(viewingAtivo.setor_id) : null}
      />

      <AtivoDeleteModal
        isOpen={!!deletingAtivo}
        onClose={() => setDeletingAtivo(null)}
        onConfirm={handleDeleteConfirm}
        ativo={deletingAtivo}
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
