# Arquitetura — SIVA

> Migrado de `MEMORY.md:Estrutura atual` e `Decisões técnicas` (2026-09-02/03/09).

## Stack
- `react@19.2.8`, `tailwindcss@4.3.3` + `@tailwindcss/vite@4.3.3` (`src/index.css:1` `@import "tailwindcss"; @config "../tailwind.config.js"`), `lucide-react@1.39.0`, `motion@13.1.1`, `vite@8.2.2`, `oxlint@1.79.0`, `typescript@6.0.2` (`package.json:12`).

## Roteamento e Estado
- `src/App.tsx:12` `type Page` (15 páginas: `login|cadastro|dashboard|setores|ativos|esp32|sensores|minhas-ordens|solicitacoes|ordens|procedimentos|planos|preventivas|relatorios|configuracoes`), `useState<Page>` + `useState<AuthUser|null>` + 10 estados elevados (+`setEsp32s`, `setSensores`) `App.tsx:43`, handlers `handleLogin` (`homePage` por perfil, força `empresa_id=1`), `handleUnauthorized/handleForbidden` (401/403), `pushNotificacao/handleRunJob/nav` (`nav` limpa `forbidden`). Guard `currentPage = canAccessRoute ? page : homePage` `App.tsx:144` — técnico fora da rota cai em `minhas-ordens`. Sem `react-router` — trade-off MVP rápido, migração futura prevista (`backlog.md`).
- Permissões centralizadas `src/utils/permissions.ts:1` — `isTecnico/can()` (`infra:write/esp32:token/ordem:manage/job:run` negados p/ técnico), `TECNICO_ROUTES`, `notificationsForUser()`. Segurança real é do backend; front é só UX.
- Camadas z `src/utils/layers.ts:1` + `:root` em `src/index.css:1` (`--z-topbar:30 --z-nav:40 --z-nav-menu:45 --z-topbar-menu:60 --z-modal:70 --z-toast:80`); exclusividade via eventos `siva:close-nav/topbar-menus`; notificações em portal `document.body` `fixed` (posição do sino `+8px`).
- Prop drilling mantido por simplicidade (`ai.md:23` evitar abstração prematura); próxima etapa `Context/Zustand` se escalar (`MEMORY.md:164`).

## Estrutura de Pastas (2026-09-09)
```
src/App.tsx:12
src/pages/ login.tsx:18, cadastro.tsx, dashboard.tsx:18, setores.tsx:1, ativos.tsx:1, esp32.tsx:1, sensores.tsx:1, minhas-ordens.tsx:1, solicitacoes.tsx:1, ordens.tsx:1, procedimentos.tsx:1, planos.tsx:1, perfil.tsx, placeholder.tsx (preventivas|relatorios|configuracoes + 403 Acesso negado)
src/components/ui/ input.tsx, textarea.tsx, select.tsx, button.tsx (primary/secondary/ghost, isLoading, filterTokens para bg override), modal.tsx:3 (sm/md/lg/xl, LAYER_CLASS.modal), toast.tsx:1, count-up.tsx:1, animated-list.tsx:1
src/components/dashboard/ sidebar.tsx:27 (11 itens, MORTA — nenhuma página importa), header.tsx:1 (logo-botão → homePage, NotificationBell/Dropdown portal), top-nav.tsx:1 (user, grupos infra|manut, filtro técnico), stat-*, chart-area.tsx:6, sensor-*, recent-activities.tsx:4
src/components/setores/ 4 modais/cards (onEdit/onDelete? opcionais p/ read-only), src/components/ativos/ 5 (sector-select.tsx), src/components/sensores/ sensor-form-modal.tsx:1, src/components/esp32/ form+token modals, src/components/minhas-ordens/ details-modal, src/components/solicitacoes/ 2 (card + ordemId? chip OS), ordens/ 2, procedimentos/ 2, planos/ 3, notificacoes/notification-dropdown.tsx:1 (portal), shared/equipamento-select.tsx:1
src/services/ api.ts:1 (ApiError, apiFetch, USE_API), esp32.service.ts:1, ordem.service.ts:1, solicitacao.service.ts:1
src/data/ mock.ts:3, setores.mock.ts:1, siva-domain.mock.ts:1
src/types/ auth/, Nivel/ (+super_admin), User/, Empresa/, Setor/, Ativo/, Sensor/ (+SensorEntity tag|null), Esp32/ (Esp32ListItem, OFFLINE const), Solicitacao/, OrdemServico/, Especialidade/, Procedimento/, PlanoManutencao/ (PlanoEquipamentoTipo), Notificacao/, dashboard.types.ts, index.ts barrel
src/hooks/use-form.ts, src/utils/periodicidade.ts:1, format.ts:1, cn.ts:1, layers.ts:1, permissions.ts:1
src/index.css, vite.config.ts, tailwind.config.js:6
```

## Design System e Estilização
- Tailwind 4 centralizado em `tailwind.config.js:6` (`colors jet-black/slate-deep/sea-green/air-blue/sky-blue`, `fontFamily heading Manrope/boby Inter`), `@fontsource/inter` + `manrope` `src/main.tsx:4` (`400/500/600` + `700/800`), sem `App.css`.
- Classes via `bg-jet-black` etc., sem `bg-[#...]` hardcode fora do config.
- `Button` `filterTokens` (`src/components/ui/button.tsx:27`) remove `bg-/text-/focus:ring` conflitantes para permitir `className="bg-sea-green"` sobrescrever `primary` mantendo `hover:-translate-y-0.5 shadow`.
- `Input` `labelClassName` (`src/components/ui/input.tsx:9`) permite `text-white` externo sem vazar para `input` (`text-jet-black bg-white` explícito em `login.tsx:96`/`cadastro.tsx:112`).

## Decisões Técnicas Chave
- Mock centralizado `src/data/*` facilita troca por `services/*` + `LoginResponse.token` `auth.types.ts:18`.
- `lucide-react` única lib ícones; `motion`/`framer-motion` para microinterações sem nova lib.
- `Modal` `size` prop compatível `max-w-sm` padrão e `lg/xl` para forms.
- `gerarOrdensAutomatica` em memória com botão manual — migração para `node-cron`/`pg_cron`/`BullMQ` só move `periodicidade.ts`.
- `Notificacao` frontend-only sem tabela DB; `sensor_id XOR esp32_id` validado via `EquipamentoTipoToggle` + `EquipamentoSelect`.
- Inativação lógica `ativo=false` preserva histórico `ordem_servico`.

## Build e Qualidade
- `tsc -b` 0, `vite build` 2275–2281 módulos (~466kB gzip 131kB, CSS 60kB), `oxlint` apenas `set-state-in-effect` warnings esperados, sem `any`, `ai.md` Clean Code/SOLID.
