import { useState, type ChangeEvent, type FormEvent } from 'react'

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K]) => string | null
}

interface UseFormOptions<T> {
  initialValues: T
  validations?: ValidationRules<T>
  onSubmit: (values: T) => Promise<void> | void
}

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  reset: () => void
  setFieldError: (field: keyof T, error: string) => void
}

export function useForm<T extends object>({
  initialValues,
  validations = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (field: keyof T, value: T[keyof T]): string | null => {
    const rule = validations[field]
    return rule ? rule(value) : null
  }

  const handleChange = (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value as T[keyof T]
    setValues(prev => ({ ...prev, [field]: value }))

    const error = validate(field, value)
    setErrors(prev => {
      const next = { ...prev }
      if (error) {
        next[field] = error
      } else {
        delete next[field]
      }
      return next
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: Partial<Record<keyof T, string>> = {}
    for (const key of Object.keys(validations) as Array<keyof T>) {
      const error = validate(key, values[key])
      if (error) newErrors[key] = error
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }

  const setFieldError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  return { values, errors, isSubmitting, handleChange, handleSubmit, reset, setFieldError }
}
