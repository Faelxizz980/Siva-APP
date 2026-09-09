import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import { EquipamentoSelect, EquipamentoTipoToggle } from '../shared/equipamento-select'
import type { PlanoManutencao, CreatePlanoDTO, Periodicidade } from '../../types/PlanoManutencao/plano.types'
import type { Procedimento } from '../../types/Procedimento/procedimento.types'
import type { Especialidade } from '../../types/Especialidade/especialidade.types'
import type { SensorEntity } from '../../types/Sensor/sensor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreatePlanoDTO, editingId?: number) => void
  initialData?: PlanoManutencao | null
  procedimentos: Procedimento[]
  especialidades: Especialidade[]
  sensores: SensorEntity[]
  esp32s: Esp32[]
}

interface Errors {
  procedimento?: string
  equipamento?: string
  periodicidade?: string
  data_inicio?: string
  prazo?: string
}

export function PlanoFormModal({ isOpen, onClose, onSubmit, initialData, procedimentos, especialidades, sensores, esp32s }: Props) {
  const [procedimentoId, setProcedimentoId] = useState('')
  const [equipTipo, setEquipTipo] = useState<'sensor' | 'esp32'>('sensor')
  const [equipId, setEquipId] = useState('')
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>('mensal')
  const [dataInicio, setDataInicio] = useState('')
  const [prazo, setPrazo] = useState('7')
  const [errors, setErrors] = useState<Errors>({})

  const procAtivos = procedimentos.filter((p) => p.ativo)
  const procSelecionado = procAtivos.find((p) => String(p.id) === procedimentoId)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProcedimentoId(String(initialData.procedimento_id))
        if (initialData.sensor_id !== null) {
          setEquipTipo('sensor')
          setEquipId(String(initialData.sensor_id))
        } else {
          setEquipTipo('esp32')
          setEquipId(String(initialData.esp32_id))
        }
        setPeriodicidade(initialData.periodicidade)
        setDataInicio(initialData.data_inicio)
        setPrazo(String(initialData.prazo_maximo_dias))
      } else {
        setProcedimentoId('')
        setEquipTipo('sensor')
        setEquipId('')
        setPeriodicidade('mensal')
        setDataInicio(new Date().toISOString().slice(0, 10))
        setPrazo('7')
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  useEffect(() => {
    setEquipId('')
  }, [equipTipo])

  const validate = (): boolean => {
    const next: Errors = {}
    if (!procedimentoId) next.procedimento = 'Selecione um procedimento'
    if (!equipId) next.equipamento = 'Selecione o equipamento'
    if (!periodicidade) next.periodicidade = 'Selecione periodicidade'
    if (!dataInicio) next.data_inicio = 'Informe data de início'
    else if (!initialData) {
      const today = new Date().toISOString().slice(0, 10)
      if (dataInicio < today) next.data_inicio = 'Data não pode ser no passado'
    }
    const p = Number(prazo)
    if (!prazo || Number.isNaN(p) || p <= 0) next.prazo = 'Prazo deve ser maior que zero'
    else if (!Number.isInteger(p)) next.prazo = 'Prazo deve ser inteiro'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(
      {
        procedimento_id: Number(procedimentoId),
        equipamentoTipo: equipTipo,
        equipamentoId: Number(equipId),
        periodicidade,
        data_inicio: dataInicio,
        prazo_maximo_dias: Number(prazo),
      },
      initialData?.id,
    )
  }

  const isEditing = !!initialData

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">{isEditing ? 'Editar plano' : 'Novo plano de manutenção'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? 'Altere periodicidade/prazo. Próxima geração não recalcula retroativamente.' : 'Associe um procedimento a um equipamento com periodicidade.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <Select
              label={isEditing ? 'Procedimento (somente leitura)' : 'Procedimento *'}
              value={procedimentoId}
              onChange={(e) => setProcedimentoId(e.target.value)}
              options={[{ value: '', label: 'Selecione um procedimento ativo' }, ...procAtivos.map((p) => ({ value: String(p.id), label: `${p.nome} — ${p.categoria}` }))]}
              error={errors.procedimento}
              disabled={isEditing}
            />

            {procSelecionado && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                <p><span className="font-semibold">Categoria:</span> {procSelecionado.categoria}</p>
                <p className="mt-1"><span className="font-semibold">Equipe exigida:</span> {procSelecionado.especialidade_ids.map((id) => especialidades.find((e) => e.id === id)?.nome ?? `#${id}`).join(', ') || '—'}</p>
                {procSelecionado.descricao && <p className="mt-1 line-clamp-2">{procSelecionado.descricao}</p>}
              </div>
            )}

            {!isEditing && (
              <>
                <EquipamentoTipoToggle value={equipTipo} onChange={setEquipTipo} />
                <EquipamentoSelect tipo={equipTipo} value={equipId} onChange={setEquipId} sensores={sensores} esp32s={esp32s} error={errors.equipamento} required />
              </>
            )}

            {isEditing && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Equipamento: {initialData?.sensor_id !== null ? `Sensor #${initialData?.sensor_id}` : `ESP32 #${initialData?.esp32_id}`} (não editável)
              </div>
            )}

            <Select
              label="Periodicidade *"
              value={periodicidade}
              onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)}
              options={[
                { value: 'semanal', label: 'Semanal (+7d)' },
                { value: 'quinzenal', label: 'Quinzenal (+15d)' },
                { value: 'mensal', label: 'Mensal (+1 mês)' },
                { value: 'bimestral', label: 'Bimestral (+2 meses)' },
                { value: 'trimestral', label: 'Trimestral (+3 meses)' },
                { value: 'semestral', label: 'Semestral (+6 meses)' },
                { value: 'anual', label: 'Anual (+1 ano)' },
              ]}
              error={errors.periodicidade}
            />

            <Input label="Data de início *" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} error={errors.data_inicio} disabled={isEditing} />

            <Select
              label="Prazo máximo (dias) *"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              options={[
                { value: '3', label: '3 dias' },
                { value: '5', label: '5 dias' },
                { value: '7', label: '7 dias' },
                { value: '15', label: '15 dias' },
                { value: '30', label: '30 dias' },
              ]}
              error={errors.prazo}
            />
            {/* permitir número custom: input alternativo se quiser, mas select cobre MVP */}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Salvar' : 'Criar plano'}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
