import type { AuthUser } from '../types/auth/auth.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { SolicitacaoServico } from '../types/Solicitacao/solicitacao.types'

/**
 * Permissões centralizadas por perfil. Checagem única via `can(user, action)`.
 * O perfil administrativo (admin/gestor/super_admin/funcionario) mantém acesso
 * total; o técnico é somente leitura na infraestrutura e executa apenas as
 * próprias ordens. Segurança real é do backend — aqui é só experiência de uso.
 */
export type Permission =
  | 'infra:write'
  | 'esp32:token'
  | 'ordem:manage'
  | 'ordem:execute'
  | 'job:run'

const TECNICO_DENY: Permission[] = ['infra:write', 'esp32:token', 'ordem:manage', 'job:run']

export function isTecnico(user: AuthUser | null | undefined): boolean {
  return user?.nivel.tipo === 'tecnico'
}

export function can(user: AuthUser | null | undefined, action: Permission): boolean {
  if (!user) return false
  if (user.nivel.tipo === 'tecnico') return !TECNICO_DENY.includes(action)
  return true
}

/** Rotas permitidas ao técnico (Minhas Ordens + Manutenção própria + Infra leitura). */
export const TECNICO_ROUTES: readonly string[] = [
  'minhas-ordens',
  'solicitacoes',
  'setores',
  'ativos',
  'esp32',
  'sensores',
]

export function canAccessRoute(user: AuthUser | null, page: string): boolean {
  if (!user) return page === 'login' || page === 'cadastro'
  if (user.nivel.tipo !== 'tecnico') return page !== 'minhas-ordens'
  return TECNICO_ROUTES.includes(page)
}

export function homePage(user: AuthUser): string {
  return user.nivel.tipo === 'tecnico' ? 'minhas-ordens' : 'dashboard'
}

/** Técnico vê apenas notificações ligadas às próprias ordens/solicitações. */
export function notificationsForUser(
  notifications: Notificacao[],
  ordens: OrdemServico[],
  solicitacoes: SolicitacaoServico[],
  user: AuthUser,
): Notificacao[] {
  if (user.nivel.tipo !== 'tecnico') return notifications
  const myOrderIds = new Set(ordens.filter((o) => o.tecnico_id === user.id).map((o) => o.id))
  const mySolicIds = new Set(solicitacoes.filter((s) => s.solicitante_id === user.id).map((s) => s.id))
  return notifications.filter((n) => {
    if (n.relacionadoTipo === 'ordem') return n.relacionadoId != null && myOrderIds.has(n.relacionadoId)
    if (n.relacionadoTipo === 'solicitacao') return n.relacionadoId != null && mySolicIds.has(n.relacionadoId)
    return false
  })
}
