import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import { SectorSelect } from './sector-select'
import type { Setor } from '../../types/Setor/setor.types'
import type { Ativo, CreateAtivoDTO } from '../../types/Ativo/ativo.types'

interface AtivoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAtivoDTO) => void
  setores: Setor[]
  initialData?: Ativo | null
  existingAtivos: Ativo[]
}

interface FormErrors {
  nome?: string
  tag?: string
  setor_id?: string
  criticidade?: string
  centro_custo?: string
  foto_url?: string
  manual_url?: string
}

export function AtivoFormModal({
  isOpen,
  onClose,
  onSubmit,
  setores,
  initialData,
  existingAtivos,
}: AtivoFormModalProps) {
  const isEditing = !!initialData

  const [nome, setNome] = useState('')
  const [tag, setTag] = useState('')
  const [tipo, setTipo] = useState('')
  const [criticidade, setCriticidade] = useState('media')
  const [centroCusto, setCentroCusto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [setorId, setSetorId] = useState('')
  const [ativo, setAtivo] = useState('true')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setNome(initialData?.nome ?? '')
      setTag(initialData?.tag ?? '')
      setTipo(initialData?.tipo ?? '')
      setCriticidade(initialData?.criticidade ?? 'media')
      setCentroCusto(initialData?.centro_custo ?? '')
      setDescricao(initialData?.descricao ?? '')
      setFotoUrl(initialData?.foto_url ?? '')
      setManualUrl(initialData?.manual_url ?? '')
      setSetorId(initialData ? String(initialData.setor_id) : '')
      setAtivo(initialData ? String(initialData.ativo) : 'true')
      setErrors({})
    }
  }, [isOpen, initialData])

  const validate = (): boolean => {
    const next: FormErrors = {}

    if (!nome.trim()) next.nome = 'Nome é obrigatório'
    else if (nome.trim().length < 2) next.nome = 'Nome deve ter ao menos 2 caracteres'
    else if (nome.trim().length > 100) next.nome = 'Nome deve ter até 100 caracteres'

    if (!tag.trim()) next.tag = 'Tag é obrigatória'
    else if (tag.trim().length > 50) next.tag = 'Tag deve ter até 50 caracteres'
    else {
      const duplicate = existingAtivos.some(
        (a) => a.tag.toLowerCase() === tag.trim().toLowerCase() && a.id !== initialData?.id,
      )
      if (duplicate) next.tag = 'Já existe um ativo com esta Tag'
    }

    if (!setorId) next.setor_id = 'Selecione um setor'
    else if (!setores.some((s) => String(s.id) === setorId)) next.setor_id = 'Setor inválido'

    if (!criticidade) next.criticidade = 'Selecione a criticidade'

    if (centroCusto && centroCusto.length > 50) next.centro_custo = 'Centro de custo deve ter até 50 caracteres'

    if (fotoUrl && fotoUrl.trim() && !isValidUrl(fotoUrl.trim())) next.foto_url = 'URL da foto inválida'
    if (manualUrl && manualUrl.trim() && !isValidUrl(manualUrl.trim())) next.manual_url = 'URL do manual inválida'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      nome: nome.trim(),
      tag: tag.trim(),
      tipo: tipo.trim() ? tipo.trim() : null,
      criticidade: criticidade as Ativo['criticidade'],
      centro_custo: centroCusto.trim() ? centroCusto.trim() : null,
      descricao: descricao.trim() ? descricao.trim() : null,
      foto_url: fotoUrl.trim() ? fotoUrl.trim() : null,
      manual_url: manualUrl.trim() ? manualUrl.trim() : null,
      setor_id: Number(setorId),
      ativo: ativo === 'true',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">{isEditing ? 'Editar ativo' : 'Novo ativo'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? 'Atualize as informações do ativo. O setor pode ser alterado via dropdown.'
              : 'Preencha as informações para cadastrar um novo ativo vinculado a um setor.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <SectorSelect setores={setores} value={setorId} onChange={setSetorId} error={errors.setor_id} required />
            </div>

            <Input
              label="Nome do ativo *"
              placeholder="Ex: Enchedora 01"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={errors.nome}
              maxLength={100}
            />

            <Input
              label="Tag *"
              placeholder="Ex: ENCH-001"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              error={errors.tag}
              maxLength={50}
            />

            <Input
              label="Tipo"
              placeholder="Ex: Enchedora, Chiller, Bomba"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              maxLength={50}
            />

            <Select
              label="Criticidade *"
              value={criticidade}
              onChange={(e) => setCriticidade(e.target.value)}
              options={[
                { value: 'baixa', label: 'Baixa' },
                { value: 'media', label: 'Média' },
                { value: 'alta', label: 'Alta' },
              ]}
              error={errors.criticidade}
            />

            <Input
              label="Centro de custo"
              placeholder="Ex: CC-1001"
              value={centroCusto}
              onChange={(e) => setCentroCusto(e.target.value)}
              error={errors.centro_custo}
              maxLength={50}
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

            <div className="sm:col-span-2">
              <Textarea
                label="Descrição"
                placeholder="Descreva a finalidade do ativo"
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={255}
              />
            </div>

            <Input
              label="Foto (URL)"
              placeholder="https://..."
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              error={errors.foto_url}
            />

            <Input
              label="Manual (URL)"
              placeholder="https://..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              error={errors.manual_url}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? 'Salvar alterações' : 'Cadastrar ativo'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
