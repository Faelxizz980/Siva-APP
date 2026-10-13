import { useEffect, useState } from 'react'
import type { AuthUser } from '../types'
import { AdminLayout } from '../components/admin/admin-layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Modal } from '../components/ui/modal'
import { Toast, type ToastType } from '../components/ui/toast'
import { empresaService, type EmpresaListItem } from '../services/empresa.service'
import { usuarioService } from '../services/usuario.service'

interface AdminEmpresaDetalhesProps {
  user: AuthUser
  empresaId: number
  onNavigate: (page: string) => void
  onLogout: () => void
}

export default function AdminEmpresaDetalhes({ user, empresaId, onNavigate, onLogout }: AdminEmpresaDetalhesProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [empresa, setEmpresa] = useState<EmpresaListItem | null>(null)
  const [funcionarios, setFuncionarios] = useState<AuthUser[]>([])
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [saving, setSaving] = useState(false)
  const [togglingEmpresa, setTogglingEmpresa] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  useEffect(() => {
    let alive = true
    async function load(): Promise<void> {
      try {
        const [e, f] = await Promise.all([empresaService.getById(empresaId), usuarioService.listByEmpresa(empresaId)])
        if (!alive) return
        setEmpresa(e)
        setFuncionarios(f)
        setNome(e.nome)
        setCnpj(e.cnpj ?? '')
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Falha ao carregar empresa')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [empresaId])

  async function handleSave(): Promise<void> {
    if (!empresa || !nome.trim()) {
      setToast({ message: 'Nome da empresa é obrigatório', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const updated = await empresaService.update(empresa.id, { nome: nome.trim(), cnpj: cnpj.trim() || undefined })
      setEmpresa({ ...empresa, nome: updated.nome, cnpj: updated.cnpj })
      setEditing(false)
      setToast({ message: 'Empresa atualizada', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao salvar', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleEmpresa(): Promise<void> {
    if (!empresa) return
    setTogglingEmpresa(true)
    try {
      const updated = await empresaService.update(empresa.id, { ativo: !empresa.ativo })
      setEmpresa({ ...empresa, ativo: updated.ativo })
      setToast({ message: updated.ativo ? 'Empresa ativada' : 'Empresa inativada', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao alterar status', type: 'error' })
    } finally {
      setTogglingEmpresa(false)
    }
  }

  async function handleToggleAtivo(f: AuthUser): Promise<void> {
    setBusyId(f.id)
    try {
      const updated = await usuarioService.setAtivo(f.id, !f.ativo)
      setFuncionarios((prev) => prev.map((x) => (x.id === f.id ? { ...x, ativo: updated.ativo } : x)))
      setToast({ message: updated.ativo ? 'Conta ativada' : 'Conta inativada', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao alterar status', type: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: number): Promise<void> {
    setBusyId(id)
    try {
      await usuarioService.remove(id)
      setFuncionarios((prev) => prev.filter((x) => x.id !== id))
      setToast({ message: 'Funcionário removido', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao remover', type: 'error' })
    } finally {
      setBusyId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <AdminLayout user={user} activeItem="admin-empresas" onNavigate={onNavigate} onLogout={onLogout} title="Detalhes da empresa" subtitle="Dados, funcionários e status da conta">
      <button type="button" onClick={() => onNavigate('admin-empresas')} className="font-body mb-4 text-sm font-medium text-air-blue hover:text-sea-green">
        ← Voltar para empresas
      </button>
      {loading && <p className="font-body text-sm text-air-blue">Carregando...</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">{error}</div>}
      {!loading && !error && empresa && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-jet-black">{empresa.nome}</h2>
                <p className="font-body text-sm text-slate-500">{empresa.cnpj ?? 'CNPJ não informado'} · {empresa.ativo ? 'ATIVA' : 'INATIVA'}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={handleToggleEmpresa} isLoading={togglingEmpresa}>
                  {empresa.ativo ? 'Inativar empresa' : 'Ativar empresa'}
                </Button>
                <Button variant="secondary" onClick={() => setEditing((v) => !v)}>{editing ? 'Cancelar' : 'Editar'}</Button>
              </div>
            </div>
            {editing ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input label="Nome da empresa" value={nome} onChange={(e) => setNome(e.target.value)} />
                <Input label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
                <div className="sm:col-span-2">
                  <Button onClick={handleSave} isLoading={saving} className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                    Salvar alterações
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-jet-black">Funcionários ({funcionarios.length})</h3>
            {funcionarios.length === 0 && <p className="font-body mt-2 text-sm text-slate-500">Nenhum funcionário vinculado.</p>}
            <ul className="mt-3 divide-y divide-slate-100">
              {funcionarios.map((f) => (
                <li key={f.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-body text-sm font-semibold text-jet-black">{f.nome}</p>
                    <p className="font-body text-xs text-slate-500">{f.email} · {f.nivel.cargo}</p>
                    <span className={['mt-1 inline-block rounded-full px-2 py-0.5 font-body text-xs font-semibold', f.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'].join(' ')}>
                      {f.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" className="text-xs" disabled={busyId === f.id} onClick={() => handleToggleAtivo(f)}>
                      {f.ativo ? 'Inativar' : 'Ativar'}
                    </Button>
                    <Button variant="ghost" className="text-xs text-red-600 hover:bg-red-50" disabled={busyId === f.id} onClick={() => setConfirmDeleteId(f.id)}>
                      Deletar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <Modal isOpen={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="font-heading text-base font-bold text-jet-black">Deletar funcionário?</h3>
          <p className="font-body mt-2 text-sm text-slate-600">Essa ação é destrutiva. Prefira inativar a conta para preservar o histórico.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              isLoading={busyId !== null}
              onClick={() => confirmDeleteId !== null && void handleDelete(confirmDeleteId)}
            >
              Confirmar exclusão
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-4 right-4 z-[80]">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </AdminLayout>
  )
}
