import { useState } from 'react'
import LoginScreen from './pages/login'
import CadastroScreen from './pages/cadastro'
import DashboardScreen from './pages/dashboard'
import type { AuthUser } from './types'

type Page = 'login' | 'cadastro' | 'dashboard'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<AuthUser | null>(null)

  const handleLogin = (loggedUser: AuthUser) => {
    setUser(loggedUser)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('login')
  }

  if (page === 'dashboard' && user) {
    return <DashboardScreen user={user} onLogout={handleLogout} />
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
