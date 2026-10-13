import { useEffect, useState } from 'react'
import type { AuthUser } from '../types'
import { AdminLayout } from '../components/admin/admin-layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Toast, type ToastType } from '../components/ui/toast'
import { empresaService, type EmpresaListItem } from '../services/empresa.service'
import { usuarioService, type TipoUsuarioAdmin, type EspecialidadeTecnico } from '../services/usuario.service'

interface AdminCadastrosProps {
  user: AuthUser
  onNavigate: (page: string) => void
  onLogout: () => void
}

export default function AdminCadastros({ user, onNavigate, onLogout }: AdminCadastrosProps) {
  const [empresas, setEmpresas] = useState<EmpresaListItem[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [empresaNome, setEmpresaNome] = useState('')
  const [empresaCnpj, setEmpresaCnpj] = useState('')
  const [savingEmpresa, setSavingEmpresa] = useState(false)
  const [fNome, setFNome] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fSenha, setFSenha] = useState('')
  const [fTipo, setFTipo] = useState<TipoUsuarioAdmin>('gestor')
  const [fEmpresaId, setFEmpresaId] = useState('')
  const [fEspecialidade, setFEspecialidade] = useState<EspecialidadeTecnico>('MECANICO')
  const [savingFunc, setSavingFunc] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  useEffect(() => {
    let alive = true
    async function load(): Promise<void> {
      try {
        const data = await empresaService.list()
        if (alive) {
          setEmpresas(data)
          if (data.length > 0) setFEmpresaId(String(data[0].id))
        }
      } finally {
        if (alive) setLoadingEmpresas(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  async function handleCreateEmpresa(): Promise<void> {
    if (!empresaNome.trim()) {
      setToast({ message: 'Informe o nome da empresa', type: 'error' })
      return
    }
    setSavingEmpresa(true)
    try {
      const created = await empresaService.create({ nome: empresaNome.trim(), cnpj: empresaCnpj.trim() || undefined })
      setEmpresas((prev) => [...prev, { ...created, status: 'ativa', funcionarios_count: 0, sensores_count: 0 }])
      setEmpresaNome('')
      setEmpresaCnpj('')
      setToast({ message: 'Empresa cadastrada', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao cadastrar empresa', type: 'error' })
    } finally {
      setSavingEmpresa(false)
    }
  }

  async function handleCreateFuncionario(): Promise<void> {
    if (!fNome.trim() || !fEmail.trim() || fSenha.length < 6) {
      setToast({ message: 'Verifique nome, e-mail e senha (mínimo 6 caracteres)', type: 'error' })
      return
    }
    if (fTipo !== 'admin' && !fEmpresaId) {
      setToast({ message: 'Selecione uma empresa válida da lista', type: 'error' })
      return
    }
    setSavingFunc(true)
    try {
      await usuarioService.create({
        nome: fNome.trim(),
        email: fEmail.trim(),
        senha: fSenha,
        tipo: fTipo,
        empresa_id: fTipo === 'admin' ? null : Number(fEmpresaId),
        especialidade: fTipo === 'tecnico' ? fEspecialidade : undefined,
      })
      setFNome('')
      setFEmail('')
      setFSenha('')
      setToast({ message: 'Usuário criado com sucesso', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Falha ao criar usuário', type: 'error' })
    } finally {
      setSavingFunc(false)
    }
  }

  return (
    <AdminLayout user={user} activeItem="admin-cadastros" onNavigate={onNavigate} onLogout={onLogout} title="Cadastros" subtitle="Empresas, funcionários e administradores — uso exclusivo do ADMIN">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-base font-bold text-jet-black">Cadastrar empresa</h2>
          <div className="mt-4 grid gap-3">
            <Input label="Nome da empresa" value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} placeholder="Ex.: Metalúrgica Prisma" />
            <Input label="CNPJ (opcional)" value={empresaCnpj} onChange={(e) => setEmpresaCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
            <Button onClick={handleCreateEmpresa} isLoading={savingEmpresa} className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
              Cadastrar empresa
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-base font-bold text-jet-black">Cadastrar funcionário / admin</h2>
          <div className="mt-4 grid gap-3">
            <Input label="Nome" value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Nome completo" />
            <Input label="E-mail" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="usuario@empresa.com" />
            <Input label="Senha" type="password" value={fSenha} onChange={(e) => setFSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <Select
              label="Tipo de usuário"
              value={fTipo}
              onChange={(e) => setFTipo(e.target.value as TipoUsuarioAdmin)}
              options={[
                { value: 'gestor', label: 'GESTOR' },
                { value: 'tecnico', label: 'TÉCNICO' },
                { value: 'admin', label: 'ADMIN' },
              ]}
            />
            {fTipo === 'tecnico' && (
              <Select
                label="Especialidade"
                value={fEspecialidade}
                onChange={(e) => setFEspecialidade(e.target.value as EspecialidadeTecnico)}
                options={[
                  { value: 'MECANICO', label: 'MECÂNICO' },
                  { value: 'ELETRICISTA', label: 'ELETRICISTA' },
                ]}
              />
            )}
            {fTipo !== 'admin' && (
              <Select
                label="Empresa vinculada"
                value={fEmpresaId}
                onChange={(e) => setFEmpresaId(e.target.value)}
                options={
                  loadingEmpresas
                    ? [{ value: '', label: 'Carregando empresas...' }]
                    : empresas.length === 0
                      ? [{ value: '', label: 'Nenhuma empresa cadastrada' }]
                      : empresas.map((e) => ({ value: String(e.id), label: e.nome }))
                }
              />
            )}
            <Button onClick={handleCreateFuncionario} isLoading={savingFunc} className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
              Criar usuário
            </Button>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-[80]">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </AdminLayout>
  )
}
