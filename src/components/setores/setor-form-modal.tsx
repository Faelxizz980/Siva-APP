import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import type { Setor, CreateSetorDTO } from '../../types/Setor/setor.types'

interface SetorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSetorDTO) => void
  initialData?: Setor | null
}

interface FormErrors {
  nome?: string
  descricao?: string
  localizacao?: string
}

export function SetorFormModal({ isOpen, onClose, onSubmit, initialData }: SetorFormModalProps) {
  const isEditing = !!initialData

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [ativo, setAtivo] = useState('true')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setNome(initialData?.nome ?? '')
      setDescricao(initialData?.descricao ?? '')
      setLocalizacao(initialData?.localizacao ?? '')
      setAtivo(initialData ? String(initialData.ativo) : 'true')
      setErrors({})
    }
  }, [isOpen, initialData])

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!nome.trim()) next.nome = 'Nome é obrigatório'
    else if (nome.trim().length < 2) next.nome = 'Nome deve ter ao menos 2 caracteres'
    else if (nome.trim().length > 100) next.nome = 'Nome deve ter até 100 caracteres'

    if (!descricao.trim()) next.descricao = 'Descrição é obrigatória'
    else if (descricao.trim().length < 5) next.descricao = 'Descrição deve ter ao menos 5 caracteres'

    if (!localizacao.trim()) next.localizacao = 'Localização é obrigatória'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim(),
      localizacao: localizacao.trim(),
      ativo: ativo === 'true',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">
            {isEditing ? 'Editar setor' : 'Novo setor'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? 'Atualize as informações do setor.' : 'Preencha as informações para cadastrar um novo setor.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5">
          <div className="flex flex-col gap-4">
            <Input
              label="Nome do setor"
              placeholder="Ex: Produção"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={errors.nome}
              maxLength={100}
            />

            <Textarea
              label="Descrição"
              placeholder="Descreva a finalidade do setor"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              error={errors.descricao}
              maxLength={255}
            />

            <Input
              label="Localização"
              placeholder="Ex: Galpão A - Térreo"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              error={errors.localizacao}
            />

            <Select
              label="Status"
              value={ativo}
              onChange={(e) => setAtivo(e.target.value)}
              options={[
                { value: 'true', label: 'Ativo' },
                { value: 'false', label: 'Inativo' },
              ]}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? 'Salvar alterações' : 'Cadastrar setor'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
