# Completed — SIVA

> Histórico cronológico. Cada item referencia `arquivo:linha` e commit quando aplicável.

## 2026-09-03 — Microinterações + Setores + Ativos

### Microinterações Dashboard
- [x] `CountUp` local React Bits — `src/components/ui/count-up.tsx:1` (parse `pt-BR`, `requestAnimationFrame`, `prefers-reduced-motion`)
- [x] `AnimatedList` — `src/components/ui/animated-list.tsx:1` (`framer-motion`, stagger 0.055s, apenas `opacity/transform`)
- [x] Integração `StatCard` — `src/components/dashboard/stat-card.tsx:9` (5 indicadores: Consumo Atual/Diário, Sensores Ativos, Alertas, Manutenções)
- [x] Integração `RecentActivities` — `src/components/dashboard/recent-activities.tsx:4` (8 itens, `max-h-80` scroll preservado)
- [x] Build verificado `tsc -b` 0 / `vite build` 2241 módulos

### Tela de Setores (frontend/visual)
- [x] Tipos `Setor` + `CreateSetorDTO`/`UpdateSetorDTO` — `src/types/Setor/setor.types.ts:1`
- [x] Mocks tipados — `src/data/setores.mock.ts:1` (`mockSetores` 4 + `mockAtivos` 7)
- [x] UI base — `src/components/ui/textarea.tsx:1`, `src/components/ui/select.tsx:1`, `src/components/ui/toast.tsx:1`, `Modal size` `src/components/ui/modal.tsx:3`
- [x] Componentes Setores — `setor-card.tsx:1`, `setor-form-modal.tsx:1`, `setor-details-modal.tsx:1`, `setor-delete-modal.tsx:1`
- [x] Página `src/pages/setores.tsx:1` — header `Setores` + `Novo Setor <Plus>`, grid `1→2→3`, empty state, CRUD local, Toast
- [x] Navegação `src/App.tsx:12` + `src/components/dashboard/sidebar.tsx:27` (item Setores já existente, `activeItem` dinâmico)

### Tela de Ativos (Setor→Ativo vínculo obrigatório)
- [x] DTOs estendidos — `src/types/Ativo/ativo.types.ts:24` (`centro_custo/foto_url/manual_url`, `criticidade` obrigatória)
- [x] `SectorSelect` reutilizável — `src/components/ativos/sector-select.tsx:1` (alimentado por `setores` vivos, valida `setor_id`)
- [x] Componentes Ativos — `ativo-card.tsx:1`, `ativo-form-modal.tsx:1` (validação `UNIQUE(tag)` + dropdown obrigatório), `ativo-details-modal.tsx:1` (destaque setor `border-2 blue-200`, Foto/Manual, placeholders Sensores/ESP32), `ativo-delete-modal.tsx:1`
- [x] Página `src/pages/ativos.tsx:1` — header `Ativos` + `Novo Ativo`, grid `1→2→3`, empty state, `setorMap` memoizado, CRUD local com reflexo imediato ao trocar `Produção→Resfriamento`
- [x] Estado elevado — `src/App.tsx:17` (`useState<Setor[]>`/`useState<Ativo[]>`), `SetoresScreen`/`AtivosScreen` recebem props, dropdown reflete criação de Setor sem reload
- [x] Sidebar — `src/components/dashboard/sidebar.tsx:27` adicionado `{id:'ativos', icon:<Cog>}` após Setores, `Page` estendido `dashboard|setores|ativos`
- [x] Build `tsc -b` 0 / `vite build` 2256 módulos `391kB` / `oxlint` warnings apenas `set-state-in-effect`

## 2026-09-02 — Dashboard SIVA base (commit `c68db7b`)
- [x] Layout `flex h-screen` — `src/pages/dashboard.tsx:18` (Sidebar 7 itens `lucide-react`, Header sticky busca/notificações/perfil)
- [x] Widgets — `StatGrid`/`StatCard` (`src/components/dashboard/stat-grid.tsx:8`/`stat-card.tsx:28`), `ChartArea` + `PeriodFilter` (`7d/15d/30d/90d` em `src/types/dashboard.types.ts:37`), `SensorStatus` 2×2 (`sensor-status.tsx:28`), `SensorMap` placeholder (`sensor-map.tsx:3`), `RecentActivities` scrollável (`recent-activities.tsx:58`)
- [x] Mocks centralizados — `src/data/mock.ts:3` (`mockStats` 5, `mockSensors` 10, `mockSensorStatusCounts` 18/4/3/3, `mockActivities` 8)
- [x] Auth mockada — `src/pages/login.tsx:33` (`useForm` + `AuthUser` com `cpf`/`nivel.cargo`), `cadastro.tsx`, `App.tsx:9` (`Page` state sem router)
- [x] Design system — `src/components/ui/input.tsx`, `button.tsx` (`isLoading`), `modal.tsx`, `profile-modal.tsx`, Tailwind 4 `#tailwindcss/vite`, `lucide-react` única lib ícones
- [x] Infra — `vite.config.ts`, `tsconfig.*`, `.oxlintrc.json`, `package.json:12` (`react@19.2.8`, `tailwindcss@4.3.3`, `motion@13.1.1`)
- [x] Docs — `README.md` reescrito, `MEMORY.md` expandido com `arquivo:linha`
