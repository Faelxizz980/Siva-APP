import type { AuthUser } from '../types/auth/auth.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { SolicitacaoServico } from '../types/Solicitacao/solicitacao.types'

/**
 * Permissões centralizadas por perfil. Checagem única via `can(user, action)`.
 * ADMIN tem acesso total administrativo; gestor usa área operacional;
 * técnico é somente leitura na infraestrutura e executa apenas as
 * próprias ordens. Segurança real é do backend — aqui é só experiência de uso.
 */
export type Permission =
  | 'infra:write'
  | 'esp32:token'
  | 'ordem:manage'
  | 'ordem:execute'
  | 'job:run'
  | 'admin:read'
  | 'admin:write'

const TECNICO_DENY: Permission[] = ['infra:write', 'esp32:token', 'ordem:manage', 'job:run', 'admin:read', 'admin:write']
const GESTOR_DENY: Permission[] = ['admin:read', 'admin:write', 'esp32:token', 'job:run']

export function isTecnico(user: AuthUser | null | undefined): boolean {
  return user?.nivel.tipo === 'tecnico'
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.nivel.tipo === 'admin' || user?.nivel.tipo === 'super_admin'
}

export function isGestor(user: AuthUser | null | undefined): boolean {
  return user?.nivel.tipo === 'gestor'
}

export function can(user: AuthUser | null | undefined, action: Permission): boolean {
  if (!user) return false
  if (user.nivel.tipo === 'super_admin' || user.nivel.tipo === 'admin') return true
  if (user.nivel.tipo === 'tecnico') return !TECNICO_DENY.includes(action)
  if (user.nivel.tipo === 'gestor' || user.nivel.tipo === 'funcionario')
    return !GESTOR_DENY.includes(action)
  return true
}

/** Rotas exclusivas do ADMIN (painel administrativo). */
export const ADMIN_ROUTES: readonly string[] = [
  'admin',
  'admin-empresas',
  'admin-empresa-detalhes',
  'admin-usuarios',
  'admin-cadastros',
  'admin-sensores',
]

/** Rotas permitidas ao técnico (Minhas Ordens + Manutenção própria + Infra leitura). */
export const TECNICO_ROUTES: readonly string[] = [
  'minhas-ordens',
  'solicitacoes',
  'setores',
  'ativos',
  'esp32',
  'sensores',
]

/** Rotas da área operacional (gestor/funcionário). Sem painel admin, sem minhas-ordens. */
export const GESTOR_ROUTES: readonly string[] = [
  'dashboard',
  'setores',
  'ativos',
  'esp32',
  'sensores',
  'solicitacoes',
  'ordens',
  'procedimentos',
  'planos',
  'preventivas',
  'relatorios',
  'configuracoes',
]

export function canAccessRoute(user: AuthUser | null, page: string): boolean {
  if (!user) return page === 'home' || page === 'login'
  if (user.nivel.tipo === 'super_admin' || user.nivel.tipo === 'admin')
    return ADMIN_ROUTES.includes(page)
  if (user.nivel.tipo === 'tecnico') return TECNICO_ROUTES.includes(page)
  return GESTOR_ROUTES.includes(page)
}

export function homePage(user: AuthUser): string {
  if (user.nivel.tipo === 'super_admin' || user.nivel.tipo === 'admin') return 'admin'
  if (user.nivel.tipo === 'tecnico') return 'minhas-ordens'
  return 'dashboard'
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
