import { useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useForm } from '../hooks/use-form'

interface CadastroFormValues {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
}

const initialValues: CadastroFormValues = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
}

const validations = {
  nome: (value: string): string | null => {
    if (!value.trim()) return 'Nome é obrigatório'
    if (value.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres'
    return null
  },
  email: (value: string): string | null => {
    if (!value.trim()) return 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
    return null
  },
  senha: (value: string): string | null => {
    if (!value) return 'Senha é obrigatória'
    if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
    return null
  },
  confirmarSenha: (value: string): string | null => {
    if (!value) return 'Confirmação de senha é obrigatória'
    return null
  },
}

interface CadastroScreenProps {
  onNavigateToLogin: () => void
}

export default function CadastroScreen({ onNavigateToLogin }: CadastroScreenProps) {
  const [success, setSuccess] = useState(false)

  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } =
    useForm<CadastroFormValues>({
      initialValues,
      validations,
      onSubmit: async (formValues) => {
        if (formValues.senha !== formValues.confirmarSenha) {
          setFieldError('confirmarSenha', 'As senhas não conferem')
          return
        }

        setSuccess(true)
      },
    })

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Cadastro realizado!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sua conta foi criada com sucesso.
          </p>
          <Button className="mt-6 w-full" onClick={onNavigateToLogin}>
            Ir para o login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Criar conta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Preencha os dados abaixo para se cadastrar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              placeholder="Digite seu nome"
              autoComplete="name"
              value={values.nome}
              onChange={handleChange('nome')}
              error={errors.nome}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={values.email}
              onChange={handleChange('email')}
              error={errors.email}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              value={values.senha}
              onChange={handleChange('senha')}
              error={errors.senha}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              autoComplete="new-password"
              value={values.confirmarSenha}
              onChange={handleChange('confirmarSenha')}
              error={errors.confirmarSenha}
            />
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            isLoading={isSubmitting}
          >
            Cadastrar
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            >
              Entrar
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
