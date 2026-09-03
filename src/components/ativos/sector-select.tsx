import type { Setor } from '../../types/Setor/setor.types'
import { Select } from '../ui/select'

interface SectorSelectProps {
  setores: Setor[]
  value: string
  onChange: (value: string) => void
  error?: string
  id?: string
  required?: boolean
}

export function SectorSelect({ setores, value, onChange, error, id = 'setor', required }: SectorSelectProps) {
  const options = [
    { value: '', label: 'Selecione um setor' },
    ...setores.map((s) => ({ value: String(s.id), label: s.nome })),
  ]

  return (
    <Select
      label={required ? 'Setor *' : 'Setor'}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      error={error}
    />
  )
}
