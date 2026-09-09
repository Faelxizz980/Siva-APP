import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { EquipamentoSelect, EquipamentoTipoToggle } from '../shared/equipamento-select'
import type { SensorEntity } from '../../types/Sensor/sensor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'
import type { AuthUser } from '../../types'
import type { OrdemServico, CreateOrdemDTO, OrdemTipo } from '../../types/OrdemServico/ordem.types'
import type { SolicitacaoServico } from '../../types/Solicitacao/solicitacao.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateOrdemDTO, editingId?: number, solicitacaoOrigemId?: number | null) => void
  sensores: SensorEntity[]
  esp32s: Esp32[]
  tecnicos: AuthUser[]
  solicitacaoPrefill?: SolicitacaoServico | null
  ordemEditing?: OrdemServico | null
}

interface Errors {
  tipo?: string
  equipamento?: string
  tecnico?: string
  data_agendada?: string
  descricao?: string
}

export function OrdemFormModal({ isOpen, onClose, onSubmit, sensores, esp32s, tecnicos, solicitacaoPrefill, ordemEditing }: Props) {
  const isEditing = !!ordemEditing
  const isFromSolicitacao = !!solicitacaoPrefill && !isEditing

  const [tipo, setTipo] = useState<OrdemTipo>('corretiva')
  const [equipTipo, setEquipTipo] = useState<'sensor' | 'esp32'>('sensor')
  const [equipId, setEquipId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [dataAgendada, setDataAgendada] = useState('')
  const [descricao, setDescricao] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (!isOpen) return
    if (ordemEditing) {
      setTipo(ordemEditing.tipo)
      if (ordemEditing.sensor_id !== null) {
        setEquipTipo('sensor')
        setEquipId(String(ordemEditing.sensor_id))
      } else if (ordemEditing.esp32_id !== null) {
        setEquipTipo('esp32')
        setEquipId(String(ordemEditing.esp32_id))
      } else {
        setEquipTipo('sensor')
        setEquipId('')
      }
      setTecnicoId(ordemEditing.tecnico_id ? String(ordemEditing.tecnico_id) : '')
      setDataAgendada(ordemEditing.data_agendada ? new Date(ordemEditing.data_agendada).toISOString().slice(0, 16) : '')
      setDescricao(ordemEditing.descricao)
    } else if (solicitacaoPrefill) {
      setTipo(solicitacaoPrefill.tipo as OrdemTipo)
      if (solicitacaoPrefill.sensor_id !== null) {
        setEquipTipo('sensor')
        setEquipId(String(solicitacaoPrefill.sensor_id))
      } else {
        setEquipTipo('esp32')
        setEquipId(String(solicitacaoPrefill.esp32_id))
      }
      setTecnicoId('')
      setDataAgendada('')
      setDescricao(solicitacaoPrefill.descricao ?? '')
    } else {
      setTipo('corretiva')
      setEquipTipo('sensor')
      setEquipId('')
      setTecnicoId('')
      setDataAgendada('')
      setDescricao('')
    }
    setErrors({})
  }, [isOpen, solicitacaoPrefill, ordemEditing])

  useEffect(() => {
    if (!isEditing && !isFromSolicitacao) {
      // only reset when creating avulsa, not when editing or prefill
      // we already handle reset on open, so avoid clearing on toggle for prefill? For avulsa allow toggle resets
      // We'll keep behavior: toggle clears equipId for avulsa
    }
  }, [equipTipo, isEditing, isFromSolicitacao])

  const handleEquipTipoChange = (v: 'sensor' | 'esp32') => {
    setEquipTipo(v)
    if (!isFromSolicitacao && !isEditing) setEquipId('')
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (!tipo) next.tipo = 'Selecione tipo'
    if (!equipId) next.equipamento = 'Selecione equipamento'
    if (!tecnicoId) next.tecnico = 'Selecione técnico'
    if (!dataAgendada) next.data_agendada = 'Informe data/hora agendada'
    else {
      const d = new Date(dataAgendada)
      if (Number.isNaN(d.getTime())) next.data_agendada = 'Data inválida'
      else if (d.getTime() < Date.now() - 60000) next.data_agendada = 'Data não pode ser no passado'
    }
    if (!descricao.trim()) next.descricao = 'Descrição é obrigatória'
    else if (descricao.trim().length < 10) next.descricao = 'Mín. 10 caracteres'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(
      {
        tipo,
        equipamentoTipo: equipTipo,
        equipamentoId: Number(equipId),
        tecnico_id: tecnicoId ? Number(tecnicoId) : null,
        descricao: descricao.trim(),
        data_agendada: new Date(dataAgendada).toISOString(),
        solicitacao_id: solicitacaoPrefill?.id ?? ordemEditing?.solicitacao_id ?? null,
        plano_manutencao_id: ordemEditing?.plano_manutencao_id ?? null,
      },
      ordemEditing?.id,
      solicitacaoPrefill?.id ?? null,
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">
            {isEditing ? `Reagendar OS #${ordemEditing?.id}` : isFromSolicitacao ? `Agendar OS — Solicitação #${solicitacaoPrefill?.id}` : 'Nova Ordem de Serviço'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? 'Altere técnico/data e reagende.' : isFromSolicitacao ? 'Dados herdados da solicitação. Atribua técnico e data.' : 'Ordem avulsa — sem vínculo com solicitação ou plano.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <Select
              label="Tipo *"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as OrdemTipo)}
              options={[
                { value: 'preventiva', label: 'Preventiva' },
                { value: 'inspecao', label: 'Inspeção' },
                { value: 'corretiva', label: 'Corretiva' },
              ]}
              error={errors.tipo}
            />

            {isFromSolicitacao || isEditing ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
                Equipamento: {equipTipo === 'sensor' ? `Sensor #${equipId}` : `ESP32 #${equipId}`} {isFromSolicitacao && '(herdado da solicitação)'}
                {/* permitir trocar mesmo quando herdado? Sim, mas bloqueia tipo toggle para evitar confusão */}
                <div className="mt-2">
                  <EquipamentoSelect tipo={equipTipo} value={equipId} onChange={setEquipId} sensores={sensores} esp32s={esp32s} error={errors.equipamento} />
                </div>
              </div>
            ) : (
              <>
                <EquipamentoTipoToggle value={equipTipo} onChange={handleEquipTipoChange} />
                <EquipamentoSelect tipo={equipTipo} value={equipId} onChange={setEquipId} sensores={sensores} esp32s={esp32s} error={errors.equipamento} required />
              </>
            )}

            <Select
              label="Técnico responsável *"
              value={tecnicoId}
              onChange={(e) => setTecnicoId(e.target.value)}
              options={[{ value: '', label: 'Selecione um técnico' }, ...tecnicos.map((t) => ({ value: String(t.id), label: `${t.nome} — ${t.nivel.cargo}` }))]}
              error={errors.tecnico}
            />

            <Input
              label="Data e hora agendada *"
              type="datetime-local"
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              error={errors.data_agendada}
            />

            <Textarea
              label="Descrição / Observações *"
              placeholder="Descreva o agendamento"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              error={errors.descricao}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Salvar reagendamento' : 'Agendar OS'}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
