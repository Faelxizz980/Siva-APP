import { useState } from 'react'
import LoginScreen from './pages/login'
import CadastroScreen from './pages/cadastro'
import DashboardScreen from './pages/dashboard'
import SetoresScreen from './pages/setores'
import AtivosScreen from './pages/ativos'
import type { AuthUser } from './types'
import type { Setor } from './types/Setor/setor.types'
import type { Ativo } from './types/Ativo/ativo.types'
import { mockSetores, mockAtivos } from './data/setores.mock'

type Page = 'login' | 'cadastro' | 'dashboard' | 'setores' | 'ativos'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [setores, setSetores] = useState<Setor[]>(() => mockSetores)
  const [ativos, setAtivos] = useState<Ativo[]>(() => mockAtivos)

  const handleLogin = (loggedUser: AuthUser) => {
    setUser(loggedUser)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('login')
  }

  if (page === 'dashboard' && user) {
    return <DashboardScreen user={user} onLogout={handleLogout} onNavigate={(id) => setPage(id as Page)} />
  }

  if (page === 'setores' && user) {
    return (
      <SetoresScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={(id) => setPage(id as Page)}
        setores={setores}
        setSetores={setSetores}
        ativos={ativos}
      />
    )
  }

  if (page === 'ativos' && user) {
    return (
      <AtivosScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={(id) => setPage(id as Page)}
        setores={setores}
        ativos={ativos}
        setAtivos={setAtivos}
      />
    )
  }

  if (page === 'cadastro') {
    return <CadastroScreen onNavigateToLogin={() => setPage('login')} />
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onNavigateToCadastro={() => setPage('cadastro')}
    />
  )
}
