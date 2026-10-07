/**
 * Escala de camadas (z-index) do layout SIVA — fonte da verdade para sobreposição.
 * Os valores numéricos vivem em `src/index.css` (`:root`); aqui ficam as classes
 * Tailwind que os referenciam e os eventos de exclusividade entre overlays.
 *
 * Ordem (menor → maior): conteúdo da página < topbar < nav < menus do nav
 * < menus da topbar (notificações) < modais < toasts.
 */
export const LAYER_CLASS = {
  topbar: 'z-[var(--z-topbar)]',
  nav: 'z-[var(--z-nav)]',
  topbarMenu: 'z-[var(--z-topbar-menu)]',
  modal: 'z-[var(--z-modal)]',
  toast: 'z-[var(--z-toast)]',
} as const

/** Pedido para fechar os dropdowns do nav (Infraestrutura/Manutenção). */
export const CLOSE_NAV_MENUS = 'siva:close-nav-menus'
/** Pedido para fechar os menus da topbar (ex.: painel de notificações). */
export const CLOSE_TOPBAR_MENUS = 'siva:close-topbar-menus'

export function requestCloseNavMenus(): void {
  window.dispatchEvent(new Event(CLOSE_NAV_MENUS))
}

export function requestCloseTopbarMenus(): void {
  window.dispatchEvent(new Event(CLOSE_TOPBAR_MENUS))
}
