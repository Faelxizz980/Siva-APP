# Memória

## Última sessão — 2026-09-02 — Dashboard SIVA base concluída

Esqueleto completo do Dashboard SIVA (Sistema de Monitoramento de Vazão) entregue no commit `c68db7b base das telas`. Layout `flex h-screen` em `src/pages/dashboard.tsx:18` com sidebar fixa (7 itens com `lucide-react` em `src/components/dashboard/sidebar.tsx:26`), header sticky com busca/notificações/perfil (`src/components/dashboard/header.tsx:11`), 5 cards de indicadores via `StatGrid`/`StatCard` (`src/components/dashboard/stat-grid.tsx:8`, `src/components/dashboard/stat-card.tsx:28`), `ChartArea` com `PeriodFilter` (`7d/15d/30d/90d` em `src/types/dashboard.types.ts:37` e `src/components/dashboard/period-filter.tsx`) em placeholder, `SensorStatus` com grid 2×2 (`src/components/dashboard/sensor-status.tsx:28`), `SensorMap` placeholder (`src/components/dashboard/sensor-map.tsx:3`) e `RecentActivities` scrollável (`src/components/dashboard/recent-activities.tsx:58`). Dados mockados centralizados em `src/data/mock.ts:3` — `mockStats` (5), `mockSensors` (10 com `vazao_atual/vazao_meta`), `mockSensorStatusCounts` (18/4/3/3) e `mockActivities` (8). Dashboard responsivo: sidebar com `translate-x` + overlay `lg:hidden`, grid `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`.

Documentação atualizada em 2026-09-02: `README.md` reescrito (substitui template Vite) com visão geral, funcionalidades por arquivo:linha, estrutura, tipos e roadmap. `MEMORY.md` expandido com referências `arquivo:linha`.

## Estrutura atual
- `src/App.tsx:9` — `type Page = 'login'|'cadastro'|'dashboard'`, `useState<Page>` + `useState<AuthUser|null>`, handlers `handleLogin`/`handleLogout`, sem `react-router`
- `src/pages/` — `login.tsx:33` (useForm + validação email/senha, mock `AuthUser` com `cpf` e `nivel.cargo`), `cadastro.tsx`, `dashboard.tsx:18` (composição dos widgets), `perfil.tsx`
- `src/components/ui/` — `input.tsx`, `button.tsx` (prop `isLoading`), `modal.tsx`
- `src/components/dashboard/` — `sidebar.tsx:36` (navItems fixos, `activeItem='dashboard'`, footer `v1.0.0`), `header.tsx:11` (badge 3 notificações, inicial `user.nome.charAt(0)`, `user.nivel.cargo`), `stat-card.tsx:28` (iconMap `droplets/trending-up/radio/alert-triangle/wrench`, `trendColors`), `stat-grid.tsx:8`, `chart-area.tsx:6` (state `period`, placeholder `BarChart3`), `period-filter.tsx`, `sensor-status.tsx:28` (statusConfig com cores `green/slate/amber/blue`), `sensor-map.tsx:3`, `recent-activities.tsx:58` (activityConfig por `tipo`)
- `src/components/profile-modal.tsx` — modal de perfil com `AuthUser`
- `src/data/mock.ts:3` — única fonte de dados mockados
- `src/hooks/use-form.ts` — hook genérico `useForm<T>` com `initialValues`, `validations`, `onSubmit`, `isSubmitting`
- `src/hooks/use.user.ts` — arquivo vazio (reservado)
- `src/types/` — `auth/auth.types.ts:3` (`AuthUser` com `cpf`, `LoginDTO`, `LoginResponse` com `token`), `dashboard.types.ts:1` (`SensorStatus`, `Sensor`, `StatCardData`, `Activity`, `SensorStatusCount`, `PeriodFilter`, `NavigationItem`), `User/`, `Empresa/`, `Nivel/` (`Nivel.tipo`, `cargo`), `Sensor/` (`sensor.types.ts` revisado), `index.ts` (barrel)
- `src/index.css` — Tailwind 4 via `@tailwindcss/vite`, sem `App.css` (removido em `c68db7b`)
- `package.json:12` — `react@19.2.8`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `lucide-react@1.39.0`, `motion@13.1.1`, `vite@8.2.2`, `oxlint@1.79.0`, `typescript@6.0.2`
- `vite.config.ts`, `tsconfig.*`, `.oxlintrc.json` — config padrão Vite+Oxlint
- `spec/` (7 subpastas vazias: `api/architecture/business-rules/domains/product/requirements/use-cases`), `decisions/` vazio, `tasks/` (backlog/current/completed vazios), `tests/` vazio, `memory/` (4 arquivos vazios), `public/`, `dist/` (build `index-BkGe2t__.css`/`index-CY_60PWt.js`)

## Decisões técnicas
- Navegação por estado ao invés de router para MVP rápido — trade-off: sem deep-link/history, migração futura para `react-router` prevista
- Mock centralizado em `src/data/mock.ts` — facilita troca por services/API
- Tailwind 4 + `@tailwindcss/vite` — sem CSS modular, classes utilitárias organizadas por componente
- `lucide-react` como única lib de ícones — consistência visual
- `motion` instalado mas ainda não usado nos widgets (preparado para animações)

## Próximos passos
- Integrar API (services `auth` e `user`, usar `LoginResponse.token` em `src/types/auth/auth.types.ts:18`)
- Adicionar `react-router` e substituir `Page` state em `src/App.tsx:9`
- Gráfico real em `src/components/dashboard/chart-area.tsx:19` (avaliar `recharts` vs `chart.js`)
- Mapa real em `src/components/dashboard/sensor-map.tsx:11`
- Preencher `src/hooks/use.user.ts`, `spec/*`, `decisions/` e `tasks/` com ADRs e requisitos
- Testes em `tests/` e refinamento visual (tokens Tailwind, acessibilidade)
