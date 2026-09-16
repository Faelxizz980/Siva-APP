# Backlog — SIVA

> Fonte da verdade para próximas entregas. Prioridade definida por impacto operacional e dependência técnica. Sem `db.json`/`API` até integração planejada.

## 🔴 Alta Prioridade — Futura Tarefa: Layout, Cores, Fontes, Logo e Novas Páginas

> **Origem:** `MEMORY.md` migrado para `spec/` + solicitação atual. Armazenada aqui como futura entrega (uso: `tasks/` para planejar, `spec/` para especificar).

- [ ] **Layout do Sistema** — Revisar `src/pages/dashboard.tsx:18` `flex h-screen`, `sidebar.tsx:27` (11 itens), `header.tsx:1` sticky, `stat-grid.tsx:8` responsivo `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`, `modal.tsx:3` `sm/md/lg/xl`, `count-up.tsx:1`/`animated-list.tsx:1`; unificar tema escuro Auth (`login.tsx:69`/`cadastro.tsx:86` `from-jet-black via-slate-deep to-jet-black`) para todo `App.tsx:12` e substituir `blue-50/blue-600` remanescentes por tokens.
- [ ] **Cores (Design System)** — Centralizar em `tailwind.config.js:6` `jet-black #092327, slate-deep #0B5351, sea-green #00A9A5, air-blue #4E8098, sky-blue #90C2E7` (`theme.extend.colors`), via `bg-jet-black`/`text-sea-green`/`hover:bg-air-blue`/`border-sea-green` etc., sem `bg-[#...]` hardcode; `src/index.css:1` `@config "../tailwind.config.js"` (Tailwind 4); aplicar a `Setores/Ativos/Solicitações/Ordens/Procedimentos/Planos` e `Dashboard` (`stat-card`, `sensor-status` etc.) — ver `spec/requirements/future-design-system.md`.
- [ ] **Fontes** — `@fontsource/inter` `400/500/600` + `@fontsource/manrope` `700/800` em `src/main.tsx:4`, `tailwind.config.js:6` `fontFamily {heading:[Manrope], body:[Inter]}`, uso `font-heading font-bold` em títulos e `font-body font-medium` em labels/inputs/botões/links (`spec/requirements/auth-and-design.md`).
- [ ] **Nova Logo** — `assets/logo.png` 1024×1024 branca, `h-20 w-20 p-3` chip `bg-jet-black` sobre fundo claro / direta `h-20 max-w-[200px] object-contain` sobre fundo escuro (`login.tsx:72`, `cadastro.tsx:89`), reaplicar em `sidebar.tsx:64` (substituir `bg-blue-600`), `header.tsx:67`, `index.html:5` favicon, manter `aspect ratio` e `max-width` proporcional; contraste `sea-green` accent em inputs.
- [ ] **Novas Páginas** — Criar `sensores`, `manutenções`, `preventivas`, `relatórios`, `configurações` (sidebar 11 itens), `perfil.tsx` completa, `notificacoes` dedicada, onboarding `Setor→Ativo`; integrar `Sensor→Ativo`/`ESP32→Ativo` real (hoje placeholders `ativo-details-modal.tsx:1`), upload `foto_url/manual_url` S3, `ChartArea` real (`recharts`) e `SensorMap` (`leaflet`) — ver `spec/product/overview.md` e `spec/use-cases/flows.md`.
- **Critérios:** `tailwind.config.js` única fonte, `font-heading/body` em todo projeto, `logo` centralizada, `tsc -b` 0, `vite build` OK, `oxlint` sem errors, sem novas deps sem justificativa, `spec/product/overview.md` + `spec/architecture/overview.md` atualizados.

## 🔴 Alta Prioridade (existente)

### Integração Backend
- [ ] **Services API** — Substituir `src/data/setores.mock.ts:1` por `src/services/setor.service.ts` e `src/services/ativo.service.ts` (CRUD `empresa_id`/`setor_id`/`tag` com `UNIQUE`s do SQL)
- [ ] **Auth real** — `LoginResponse.token` (`src/types/auth/auth.types.ts:18`) em `Authorization: Bearer`, refresh, guard de rota
- [ ] **Validação server-side** — `UNIQUE(empresa_id,nome)` setor e `UNIQUE(empresa_id,tag)` ativo + FKs `RESTRICT`/`CASCADE` já modeladas
- [ ] **Persistência** — `foto_url`/`manual_url` upload (S3/presigned URL) no `AtivoForm` (`src/components/ativos/ativo-form-modal.tsx:1`)

### Roteamento e Arquitetura
- [ ] **react-router** — Substituir `type Page` em `src/App.tsx:12` por `createBrowserRouter`, rotas `/dashboard`, `/setores`, `/ativos`, `/sensores`, lazy loading
- [ ] **Estado global** — Migrar `setores`/`ativos` de `App.tsx:17` para `Context` ou `Zustand` (evitar prop drilling quando escalar)
- [ ] **Error boundary + loading** — `Suspense` para dados assíncronos, `react-query`/`SWR` para cache

## 🟡 Média Prioridade

### Dashboard Real
- [ ] **ChartArea** (`src/components/dashboard/chart-area.tsx:6`) — `recharts` vs `chart.js` para vazão `7d/15d/30d/90d` (`PeriodFilter` em `src/types/dashboard.types.ts:37`)
- [ ] **SensorMap** (`src/components/dashboard/sensor-map.tsx:3`) — Mapa setores com `leaflet` ou `google-maps`, pins por `SensorStatus`
- [ ] **RecentActivities** — Paginação/stream real via WebSocket

### Domínio Ativos/Setores
- [ ] **Vincular Sensor→Ativo** — Hoje placeholder em `src/components/ativos/ativo-details-modal.tsx:1`; criar `sensor.ativo_id` FK e listagem
- [ ] **ESP32** — `esp32.ativo_id` vínculo, status online/offline, último heartbeat
- [ ] **Manutenções/Preventivas** — Telas `sensores/manutencoes/preventivas` do sidebar (`src/components/dashboard/sidebar.tsx:27`) ligadas a `Ativo` por `criticidade`
- [ ] **Filtro e busca** — `DashboardHeader` busca (`src/components/dashboard/header.tsx:23`) funcional para Setores/Ativos (por nome/tag/setor/criticidade)
- [ ] **Paginação e ordenação** — Cards Setores/Ativos com `orderBy nome` e paginação 12/24

### UX/UI
- [ ] **Upload drag-and-drop** para `foto_url`/`manual_url`
- [ ] **Confirmação de exclusão em cascata** — Impedir `DELETE setor` se houver `ativo.setor_id` (`ON DELETE RESTRICT`)
- [ ] **Empty state com onboarding** — Tour guiado Setor→Ativo
- [ ] **Acessibilidade** — `focus-trap` completo nos `Modal` (`src/components/ui/modal.tsx:3`), `aria-*`, `prefers-reduced-motion` já parcialmente em `count-up.tsx:1`

## 🟢 Baixa Prioridade / Futuras Atualizações

### Qualidade
- [ ] **Testes** — `Vitest + Testing Library` em `tests/` (atual vazio): unit `SectorSelect`, `AtivoForm` validação `UNIQUE(tag)`, e2e Setor→Ativo flow
- [ ] **CI/CD** — `oxlint` + `tsc -b` + `vite build` em pipeline, preview deploy
- [ ] **Tokens Tailwind** — Centralizar `colors`/`spacing`/`radius` e dark mode
- [ ] **Internacionalização** — `pt-BR` formal para labels e `Intl.NumberFormat` já usado em `count-up.tsx:1`

### Observabilidade e Operação
- [ ] **Logs e métricas** — `ChartArea` com agregação diária/semanal, export CSV/PDF (`Relatórios` no sidebar)
- [ ] **Notificações** — Badge `Bell` (`src/components/dashboard/header.tsx:38`) com WebSocket para `Alerta` ativo
- [ ] **Permissões por `Nivel.tipo`** (`admin/gestor/tecnico/funcionario` em `src/types/Nivel/nivel.types.ts:1`) — CRUD Setores/Ativos restrito
- [ ] **Auditoria** — `criado_em`/`atualizado_em` exibidos e trilha de alterações

## 📋 Definição de Pronto (DoR)
- TypeScript sem `any`, `tsc -b` 0, `vite build` OK, `oxlint` sem errors, sem novas deps sem justificativa, responsivo `sm/md/xl`, `Modal` com `Escape` + `overflow:hidden`, feedback `Toast`.

## 🔗 Dependências
- Backend `setor`/`ativo` CREATE TABLE já modelado (FKs, `UNIQUE`s, `INDEX`s) — aguardando API.
- Decisões pendentes em `decisions/` (ADRs para `react-router` vs `next`, `recharts` vs `chart.js`, `Zustand` vs `Context`).
