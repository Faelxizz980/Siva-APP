import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import type { Procedimento, CreateProcedimentoDTO, ProcedimentoCategoria } from '../../types/Procedimento/procedimento.types'
import type { Especialidade } from '../../types/Especialidade/especialidade.types'
import type { AuthUser } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateProcedimentoDTO, editingId?: number) => void
  initialData?: Procedimento | null
  usuarios: AuthUser[]
  especialidades: Especialidade[]
  setEspecialidades: React.Dispatch<React.SetStateAction<Especialidade[]>>
  procedimentos: Procedimento[]
  planosUsandoIds?: Set<number> // especialidade ids em uso por plano ativo
}

interface Errors {
  nome?: string
  supervisor?: string
  categoria?: string
  equipe?: string
}

export function ProcedimentoFormModal({ isOpen, onClose, onSubmit, initialData, usuarios, especialidades, setEspecialidades, procedimentos, planosUsandoIds }: Props) {
  const [nome, setNome] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [categoria, setCategoria] = useState<ProcedimentoCategoria>('preventiva')
  const [descricao, setDescricao] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [novaEsp, setNovaEsp] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  const candidatos = usuarios.filter((u) => ['gestor', 'admin', 'tecnico', 'super_admin'].includes(u.nivel.tipo))

  useEffect(() => {
    if (isOpen) {
      setNome(initialData?.nome ?? '')
      setSupervisorId(initialData ? String(initialData.supervisor_id) : '')
      setCategoria((initialData?.categoria as ProcedimentoCategoria) ?? 'preventiva')
      setDescricao(initialData?.descricao ?? '')
      setSelected(initialData?.especialidade_ids ?? [])
      setNovaEsp('')
      setErrors({})
    }
  }, [isOpen, initialData])

  const toggleEsp = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleAddEspecialidade = () => {
    const v = novaEsp.trim()
    if (!v) return
    if (v.length < 2) {
      setErrors((e) => ({ ...e, equipe: 'Nome deve ter ao menos 2 caracteres' }))
      return
    }
    const exists = especialidades.some((es) => es.nome.toLowerCase() === v.toLowerCase())
    if (exists) {
      setErrors((e) => ({ ...e, equipe: 'Especialidade já existe' }))
      return
    }
    const nextId = especialidades.length > 0 ? Math.max(...especialidades.map((e) => e.id)) + 1 : 1
    const nova: Especialidade = { id: nextId, nome: v, ativo: true }
    setEspecialidades((prev) => [...prev, nova])
    setSelected((prev) => [...prev, nextId])
    setNovaEsp('')
    setErrors((e) => ({ ...e, equipe: undefined }))
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (!nome.trim()) next.nome = 'Nome é obrigatório'
    else if (nome.trim().length < 2) next.nome = 'Nome deve ter ao menos 2 caracteres'
    else {
      const dup = procedimentos.some((p) => p.nome.toLowerCase() === nome.trim().toLowerCase() && p.id !== initialData?.id && p.empresa_id === (initialData?.empresa_id ?? 1))
      if (dup) next.nome = 'Já existe procedimento com este nome nesta empresa'
    }
    if (!supervisorId) next.supervisor = 'Selecione um supervisor'
    if (!categoria) next.categoria = 'Selecione a categoria'
    if (selected.length === 0) next.equipe = 'Selecione ao menos uma especialidade'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // aviso se remover especialidade em uso
    if (initialData && planosUsandoIds) {
      const removidas = initialData.especialidade_ids.filter((id) => !selected.includes(id) && planosUsandoIds.has(id))
      if (removidas.length > 0) {
        const nomes = removidas.map((id) => especialidades.find((es) => es.id === id)?.nome ?? `#${id}`).join(', ')
        const ok = window.confirm(`Atenção: as especialidades ${nomes} estão em uso por plano(s) ativo(s). Remover mesmo assim?`)
        if (!ok) return
      }
    }

    onSubmit(
      {
        nome: nome.trim(),
        supervisor_id: Number(supervisorId),
        categoria,
        descricao: descricao.trim() || null,
        especialidade_ids: selected,
      },
      initialData?.id,
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">{initialData ? 'Editar procedimento' : 'Novo procedimento'}</h2>
          <p className="mt-1 text-sm text-slate-500">Defina o padrão de trabalho reutilizável e a equipe exigida.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <Input
              label="Nome *"
              placeholder="Ex: Preventiva Bomba Principal"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={errors.nome}
              maxLength={100}
            />

            <Select
              label="Supervisor *"
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              options={[{ value: '', label: 'Selecione um supervisor' }, ...candidatos.map((u) => ({ value: String(u.id), label: `${u.nome} — ${u.nivel.cargo}` }))]}
              error={errors.supervisor}
            />

            <Select
              label="Categoria *"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as ProcedimentoCategoria)}
              options={[
                { value: 'preventiva', label: 'Preventiva' },
                { value: 'inspecao', label: 'Inspeção' },
              ]}
              error={errors.categoria}
            />

            <Textarea
              label="Descrição"
              placeholder="Descreva o procedimento"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={500}
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Equipe — especialidades *</span>
              <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {especialidades
                  .filter((e) => e.ativo)
                  .map((e) => {
                    const active = selected.includes(e.id)
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => toggleEsp(e.id)}
                        className={[
                          'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
                        ].join(' ')}
                      >
                        {e.nome} {planosUsandoIds?.has(e.id) && '•'}
                      </button>
                    )
                  })}
                {especialidades.length === 0 && <span className="text-xs text-slate-400">Nenhuma especialidade</span>}
              </div>
              {errors.equipe && <span className="text-xs text-red-600">{errors.equipe}</span>}
              <p className="text-xs text-slate-400">• indica especialidade em uso por plano ativo</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova especialidade (ex: Mecânico)"
                  value={novaEsp}
                  onChange={(e) => setNovaEsp(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  maxLength={50}
                />
                <Button type="button" variant="secondary" onClick={handleAddEspecialidade}>
                  <Plus size={14} /> Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{initialData ? 'Salvar alterações' : 'Cadastrar'}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
