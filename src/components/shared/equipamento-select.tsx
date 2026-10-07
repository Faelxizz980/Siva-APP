import type { SensorEntity } from '../../types/Sensor/sensor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'
import { Select } from '../ui/select'

interface Props {
  tipo: 'sensor' | 'esp32'
  value: string
  onChange: (v: string) => void
  sensores: SensorEntity[]
  esp32s: Esp32[]
  error?: string
  required?: boolean
  label?: string
}

export function EquipamentoSelect({ tipo, value, onChange, sensores, esp32s, error, required, label }: Props) {
  const options =
    tipo === 'sensor'
      ? [{ value: '', label: 'Selecione um sensor' }, ...sensores.filter((s) => s.ativo).map((s) => ({ value: String(s.id), label: `${s.tag ?? s.sensor_id} — ${s.descricao ?? s.sensor_id}` }))]
      : [{ value: '', label: 'Selecione um ESP32' }, ...esp32s.filter((e) => e.ativo).map((e) => ({ value: String(e.id), label: `${e.esp_id} — ${e.descricao ?? 'sem descrição'}` }))]

  return (
    <Select
      label={label ?? (required ? 'Equipamento *' : 'Equipamento')}
      id="equipamento"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      error={error}
    />
  )
}

export function EquipamentoTipoToggle({ value, onChange }: { value: 'sensor' | 'esp32'; onChange: (v: 'sensor' | 'esp32') => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">Tipo de equipamento *</span>
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => onChange('sensor')}
          className={[
            'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === 'sensor' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          Sensor
        </button>
        <button
          type="button"
          onClick={() => onChange('esp32')}
          className={[
            'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === 'esp32' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          ESP32 / Case
        </button>
      </div>
    </div>
  )
}
