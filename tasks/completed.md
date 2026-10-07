# Completed — SIVA

> Histórico cronológico. Cada item referencia `arquivo:linha` e commit quando aplicável.

## 2026-10-07 — TopNav agrupado + Sensores + ESP32 + Notificações portal + Perfil Técnico

### Navegação agrupada (`top-nav.tsx`)
- `TopNav` com `user: AuthUser` (`src/components/dashboard/top-nav.tsx:1`) — grupos `Infraestrutura ▾` (`setores|ativos|esp32|sensores`) + `Manutenção ▾`, diretos `Dashboard|Relatórios`; grupo ativo destacado quando rota pertence a ele.
- Dropdown: abre no clique, fecha fora/`Esc`/ao navegar, `aria-haspopup/aria-expanded`, um aberto por vez; animação de queda (`opacity/translateY/visibility` 180ms, cascata 30ms/item, `motion-reduce`).
- Causa do bug de corte corrigida: removido `lg:overflow-x-auto` (criava contexto de recorte sobre o painel `absolute`); painel `lg:absolute top-[calc(100%+8px)]` dark `bg-slate-deep`.
- Técnico: sem diretos, `Manutenção` = `minhas-ordens|solicitacoes` (`ClipboardCheck`); `header.tsx` logo virou botão → `homePage(user)`.

### Escala z-index + notificações em portal
- `src/utils/layers.ts:1` (`LAYER_CLASS` + eventos `siva:close-nav-menus/topbar-menus`) + `:root` em `src/index.css:1` (`--z-topbar:30 --z-nav:40 --z-nav-menu:45 --z-topbar-menu:60 --z-modal:70 --z-toast:80`).
- `notification-dropdown.tsx:1` — painel em portal `document.body` `fixed`, posição via `getBoundingClientRect()` do sino (`bottom+8px`, alinhado à direita), mesma animação de queda `origin-top-right`, sempre montado (`invisible` fechado, `tabIndex=-1`).
- `modal.tsx` → `LAYER_CLASS.modal`, toasts 7 páginas → `LAYER_CLASS.toast`; `api.ts:1` (`ApiError` 401/403, `USE_API` por `VITE_API_URL`).

### Tela de Sensores (`src/pages/sensores.tsx:1`)
- Tabela Tag/Descrição/Ativo/Setor/ESP32/Status (`Ligado/Desligado`)/Último contato (online/offline `SENSOR_OFFLINE_THRESHOLD_MINUTES=5`, `Nunca` se nulo).
- Busca tag/descrição + filtros ativo/ESP32/status; loading skeleton/vazio/erro; `+ Novo Sensor`.
- `sensor-form-modal.tsx:1` — `ativo_id*`, `esp32_id*` (`esp_id — setor`, aviso + link `Ir para ESP32` se vazio), `sensor_id*` (dica firmware), `tag` opcional única (`null` se vazia), `descricao` 100, switch `Ligado`.
- `SensorEntity.tag: string|null` (`sensor.types.ts:11`); labels ajustados (`s.tag ?? s.sensor_id`) em `equipamento-select/solicitacao-card/ordem-card/planos`.

### Tela de ESP32 (`src/pages/esp32.tsx:1`)
- Tabela ESP ID/Descrição/Setor/Sensores (count)/Último contato + ações Editar/Ver token (`Key`).
- `esp32-form-modal.tsx:1` — `setor_id*`, `esp_id*` único (dica firmware, erro 409 → `Já existe um ESP32 com esse ID`), `descricao` 100; edição avisa se `esp_id` mudar; sem setores → aviso + `Ir para Setores`; criação termina em **sucesso com token + Copiar** (`Guarde este token... header X-Token`).
- `esp32-token-modal.tsx:1` — confirmação antes de revelar + Copiar.
- `src/services/esp32.service.ts:1` — contrato `GET /esp32`, `GET /esp32/:id`, `POST /esp32` (`{esp32,token}`), `PUT /esp32/:id`, `GET /esp32/:id/token` via `apiFetch`; `Esp32ListItem {setor_nome,sensores_count}`, `ESP32_OFFLINE_THRESHOLD_MINUTES=5`.

### Perfil Técnico (`tecnico`)
- Login `ana.tecnica@siva.com`/`123456` (`db/requisits.ts:1`, `login.tsx:38`) → `homePage()` = `minhas-ordens`; guard `canAccessRoute` em `App.tsx:144` redireciona rota negada; 403 → `PlaceholderScreen` `Acesso negado`.
- `permissions.ts:1` — `isTecnico/can()` (`infra:write/esp32:token/ordem:manage/job:run` negados), `TECNICO_ROUTES`, `notificationsForUser()` (só próprias).
- Infra read-only: `canWrite` esconde `+ Novo`/Editar/Excluir/Ativar/`Ver token` (`setores/ativos/sensores/esp32.tsx`); `SetorCard/AtivoCard` `onEdit/onDelete?` opcionais.
- `minhas-ordens.tsx:1` + `minha-ordem-details-modal.tsx:1` — tabela OS/Ativo/Setor/Tipo/Prioridade (criticidade)/Status/Prazo (`Atrasada` vermelha), filtros status/prioridade/busca; detalhe com procedimento (via plano) + **Iniciar** / **Concluir com observação obrigatória**; usa `GET /minhas-ordens` + `PATCH /ordens/:id/status` quando `USE_API`, senão mock.
- `solicitacoes.tsx` — técnico filtra `solicitante_id=user.id`, chip `OS #id` (`ordemIdBySolicitacao`), sem aprovar/recusar (inexistente no admin).
- `ordem.service.ts` + `solicitacao.service.ts` — contratos `apiFetch`.
- Build `tsc -b` 0 / `vite build` OK / `oxlint` só `set-state-in-effect` esperados.

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
