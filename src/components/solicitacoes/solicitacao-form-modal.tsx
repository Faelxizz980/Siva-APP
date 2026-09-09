import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { EquipamentoSelect, EquipamentoTipoToggle } from '../shared/equipamento-select'
import type { SensorEntity } from '../../types/Sensor/sensor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'
import type { CreateSolicitacaoDTO, SolicitacaoTipo } from '../../types/Solicitacao/solicitacao.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateSolicitacaoDTO) => void
  sensores: SensorEntity[]
  esp32s: Esp32[]
}

interface Errors {
  tipo?: string
  equipamento?: string
  descricao?: string
  data_desejada?: string
}

export function SolicitacaoFormModal({ isOpen, onClose, onSubmit, sensores, esp32s }: Props) {
  const [tipo, setTipo] = useState<SolicitacaoTipo>('corretiva')
  const [equipTipo, setEquipTipo] = useState<'sensor' | 'esp32'>('sensor')
  const [equipId, setEquipId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataDesejada, setDataDesejada] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (isOpen) {
      setTipo('corretiva')
      setEquipTipo('sensor')
      setEquipId('')
      setDescricao('')
      setDataDesejada('')
      setErrors({})
    }
  }, [isOpen])

  // reset equipamento quando troca tipo
  useEffect(() => {
    setEquipId('')
  }, [equipTipo])

  const validate = (): boolean => {
    const next: Errors = {}
    if (!tipo) next.tipo = 'Selecione o tipo'
    if (!equipId) next.equipamento = 'Selecione o equipamento'
    if (!descricao.trim()) next.descricao = 'Descrição é obrigatória'
    else if (descricao.trim().length < 10) next.descricao = 'Descrição deve ter ao menos 10 caracteres'
    if (dataDesejada) {
      const today = new Date().toISOString().slice(0, 10)
      if (dataDesejada < today) next.data_desejada = 'Data não pode ser no passado'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      tipo,
      equipamentoTipo: equipTipo,
      equipamentoId: Number(equipId),
      descricao: descricao.trim(),
      data_desejada: dataDesejada || null,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">Nova Solicitação de Serviço</h2>
          <p className="mt-1 text-sm text-slate-500">Registre um atendimento. Escolha o equipamento e descreva o problema.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <Select
              label="Tipo de solicitação *"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as SolicitacaoTipo)}
              options={[
                { value: 'preventiva', label: 'Preventiva' },
                { value: 'inspecao', label: 'Inspeção' },
                { value: 'corretiva', label: 'Corretiva' },
              ]}
              error={errors.tipo}
            />

            <EquipamentoTipoToggle value={equipTipo} onChange={setEquipTipo} />

            <EquipamentoSelect
              tipo={equipTipo}
              value={equipId}
              onChange={setEquipId}
              sensores={sensores}
              esp32s={esp32s}
              error={errors.equipamento}
              required
            />

            <Textarea
              label="Descrição do problema/solicitação *"
              placeholder="Descreva com detalhes (mín. 10 caracteres)"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              error={errors.descricao}
              maxLength={500}
            />

            <Input
              label="Data desejada (opcional)"
              type="date"
              value={dataDesejada}
              onChange={(e) => setDataDesejada(e.target.value)}
              error={errors.data_desejada}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Abrir solicitação</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
