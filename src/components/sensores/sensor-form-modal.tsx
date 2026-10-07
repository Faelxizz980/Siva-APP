import { useEffect, useState } from 'react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import type { Ativo } from '../../types/Ativo/ativo.types'
import type { Setor } from '../../types/Setor/setor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'
import type { CreateSensorDTO, SensorEntity } from '../../types/Sensor/sensor.types'

interface SensorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSensorDTO) => void
  ativos: Ativo[]
  esp32s: Esp32[]
  setores: Setor[]
  initialData?: SensorEntity | null
  existingSensors: SensorEntity[]
  onNavigateToEsp32?: () => void
}

interface FormErrors {
  ativo_id?: string
  esp32_id?: string
  sensor_id?: string
  tag?: string
  descricao?: string
}

export function SensorFormModal({
  isOpen,
  onClose,
  onSubmit,
  ativos,
  esp32s,
  setores,
  initialData,
  existingSensors,
  onNavigateToEsp32,
}: SensorFormModalProps) {
  const isEditing = !!initialData

  const [ativoId, setAtivoId] = useState('')
  const [esp32Id, setEsp32Id] = useState('')
  const [sensorId, setSensorId] = useState('')
  const [tag, setTag] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ligado, setLigado] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setAtivoId(initialData ? String(initialData.ativo_id) : '')
      setEsp32Id(initialData ? String(initialData.esp32_id) : '')
      setSensorId(initialData?.sensor_id ?? '')
      setTag(initialData?.tag ?? '')
      setDescricao(initialData?.descricao ?? '')
      setLigado(initialData ? initialData.ativo : true)
      setErrors({})
    }
  }, [isOpen, initialData])

  const validate = (): boolean => {
    const next: FormErrors = {}

    if (!ativoId) next.ativo_id = 'Selecione o ativo monitorado'
    else if (!ativos.some((a) => String(a.id) === ativoId)) next.ativo_id = 'Ativo inválido'

    if (!esp32Id) next.esp32_id = 'Selecione o ESP32'
    else if (!esp32s.some((e) => String(e.id) === esp32Id)) next.esp32_id = 'ESP32 inválido'

    const sensorIdTrim = sensorId.trim()
    if (!sensorIdTrim) next.sensor_id = 'ID do sensor é obrigatório'
    else if (sensorIdTrim.length > 50) next.sensor_id = 'ID deve ter até 50 caracteres'

    const tagTrim = tag.trim()
    if (tagTrim.length > 50) next.tag = 'Tag deve ter até 50 caracteres'
    else if (tagTrim) {
      const duplicate = existingSensors.some(
        (s) => s.tag?.toLowerCase() === tagTrim.toLowerCase() && s.id !== initialData?.id,
      )
      if (duplicate) next.tag = 'Já existe um sensor com esta Tag'
    }

    if (descricao.trim().length > 100) next.descricao = 'Descrição deve ter até 100 caracteres'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return

    const tagTrim = tag.trim()

    onSubmit({
      ativo_id: Number(ativoId),
      esp32_id: Number(esp32Id),
      sensor_id: sensorId.trim(),
      tag: tagTrim ? tagTrim : null,
      descricao: descricao.trim() ? descricao.trim() : null,
      ativo_status: ligado,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-heading text-base font-semibold text-jet-black">
            {isEditing ? 'Editar sensor' : 'Novo sensor'}
          </h2>
          <p className="mt-1 font-body text-sm text-slate-500">
            {isEditing
              ? 'Atualize o vínculo do sensor com ativo e ESP32.'
              : 'Vincule um sensor a um ativo e a um ESP32.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Ativo monitorado *"
              value={ativoId}
              onChange={(e) => setAtivoId(e.target.value)}
              error={errors.ativo_id}
              options={[
                { value: '', label: 'Selecione um ativo' },
                ...ativos.map((a) => ({ value: String(a.id), label: `${a.tag} — ${a.nome}` })),
              ]}
            />

            <div>
              <Select
                label="ESP32 *"
                value={esp32Id}
                onChange={(e) => setEsp32Id(e.target.value)}
                error={errors.esp32_id}
                options={[
                  { value: '', label: 'Selecione um ESP32' },
                  ...esp32s.map((e) => ({
                    value: String(e.id),
                    label: `${e.esp_id} — ${setores.find((s) => s.id === e.setor_id)?.nome ?? `Setor #${e.setor_id}`}`,
                  })),
                ]}
              />
              {esp32s.length === 0 && (
                <p className="mt-1 font-body text-xs text-slate-500">
                  Nenhum ESP32 cadastrado.{' '}
                  {onNavigateToEsp32 && (
                    <button
                      type="button"
                      onClick={onNavigateToEsp32}
                      className="cursor-pointer font-medium text-slate-deep underline hover:text-sea-green"
                    >
                      Ir para ESP32
                    </button>
                  )}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Input
                label="ID do sensor *"
                placeholder="Ex: sensor_01"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                error={errors.sensor_id}
                maxLength={50}
              />
              <p className="mt-1 font-body text-xs text-slate-500">
                Deve ser idêntico ao enviado pelo firmware no payload (ex: sensor_01)
              </p>
            </div>

            <Input
              label="Tag"
              placeholder="Ex: FT-101"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              error={errors.tag}
              maxLength={50}
            />

            <div className="flex items-end pb-1">
              <button
                type="button"
                role="switch"
                aria-checked={ligado}
                aria-label="Sensor ligado"
                onClick={() => setLigado((v) => !v)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                  ligado ? 'bg-sea-green' : 'bg-slate-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    ligado ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
              <span className="ml-3 font-body text-sm font-medium text-jet-black">
                Ligado
              </span>
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Descrição"
                placeholder="Descrição opcional do ponto de medição"
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={100}
                error={errors.descricao}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? 'Salvar alterações' : 'Cadastrar sensor'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
