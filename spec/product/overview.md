# Produto — SIVA (Sistema de Monitoramento de Vazão)

> Migrado de `MEMORY.md:1` — visão produto e escopo entregue até 2026-09-09.

## Visão Geral
Dashboard industrial para monitoramento de vazão, gestão de setores/ativos e fluxo de manutenção preventiva/corretiva. Navegação por estado `Page` em `src/App.tsx:12` (`login|cadastro|dashboard|setores|ativos|solicitacoes|ordens|procedimentos|planos`) sem `react-router` (MVP).

## Funcionalidades Entregues

### 2026-09-02 — Dashboard base (`c68db7b`)
- Layout `flex h-screen` `src/pages/dashboard.tsx:18` — sidebar 7 itens `lucide-react` `src/components/dashboard/sidebar.tsx:26`, header sticky `src/components/dashboard/header.tsx:11`, 5 cards `StatGrid`/`StatCard` `src/components/dashboard/stat-grid.tsx:8`/`stat-card.tsx:28`, `ChartArea` + `PeriodFilter` `7d/15d/30d/90d` `src/types/dashboard.types.ts:37`, `SensorStatus` 2×2 `sensor-status.tsx:28`, `SensorMap` placeholder `sensor-map.tsx:3`, `RecentActivities` scrollável `recent-activities.tsx:58`.
- Mocks `src/data/mock.ts:3` — `mockStats` 5, `mockSensors` 10, `mockSensorStatusCounts` 18/4/3/3, `mockActivities` 8.

### 2026-09-03 — Setores + Ativos + Microinterações
- `CountUp` `src/components/ui/count-up.tsx:1` (pt-BR, `requestAnimationFrame`, `prefers-reduced-motion`) + `AnimatedList` `src/components/ui/animated-list.tsx:1` (`framer-motion`).
- Setores: `SETOR → ATIVOS`, CRUD local `src/pages/setores.tsx:1`, 4 setores + 7 ativos `src/data/setores.mock.ts:1`, `SectorSelect` reutilizável `src/components/ativos/sector-select.tsx:1`.
- Ativos: vínculo obrigatório `setor_id`, validação `UNIQUE(tag)`, `foto_url/manual_url`, `criticidade`.

### 2026-09-09 — Fluxo SIVA completo
- Domínio `siva_db` + extensão: `especialidade`, `procedimento`, `procedimento_equipe` N:N, `plano_manutencao`, `ordem_servico` (`tecnico_id NULL` + `plano_manutencao_id` + `data_limite`), `Esp32`, `SensorEntity`, `SolicitacaoServico` (sensor XOR esp32), `Notificacao` frontend-only.
- Telas: `solicitacoes.tsx:1` (Tipo + equipamento toggle), `ordens.tsx:1` (2 origens + agenda + conflito técnico-dia), `procedimentos.tsx:1` (multi especialidade inline), `planos.tsx:1` (periodicidade 7, `proxima_geracao`, `prazo_maximo_dias`, Job), `notificacoes` `notification-dropdown.tsx:1` (Bell + Dropdown `aria-live`).
- Job `src/utils/periodicidade.ts:45` `gerarOrdensAutomatica` — 1 OS por ciclo perdido, avança `proxima_geracao` até > hoje, logs `[ATRASO]`, botão `Rodar Job (hoje)` em `planos.tsx:140` e `dashboard.tsx:44`.
- Isolamento `empresa_id=1` em `src/App.tsx:43` (`mockUsuarios` 6, `mockEsp32` 4, `mockSensorEntities` 5, `mockEspecialidades` 5, `mockProcedimentos` 3, `mockPlanos` 3, `mockSolicitacoes` 4, `mockOrdens` 4, `mockNotificacoes` 3).

### 2026-09-09/16 — Design System Auth (Login/Cadastro)
- Tipografia `Inter`/`Manrope` via `@fontsource` `src/main.tsx:4`, `tailwind.config.js:6` `fontFamily {heading, body}`.
- Paleta `tailwind.config.js:7` `jet-black #092327, slate-deep #0B5351, sea-green #00A9A5, air-blue #4E8098, sky-blue #90C2E7` — classes `bg-jet-black` etc., sem hardcode.
- Logo `assets/logo.png` 1024×1024 branca, `src/pages/login.tsx:72` chip `h-20 w-20 bg-jet-black` vs `src/pages/cadastro.tsx:89` direto `h-20 max-w-[200px]` (fundo escuro).
- Esquema invertido unificado para escuro `from-jet-black via-slate-deep to-jet-black` (`login.tsx:69`, `cadastro.tsx:86`), card `border-air-blue/20 bg-jet-black`, inputs `bg-white text-jet-black placeholder:text-gray-400 border-gray-300 focus:ring-sea-green` + toggle `Eye/EyeOff` `lucide-react` (`login.tsx:37` `showSenha`, `cadastro.tsx:50` `showSenha/showConfirmarSenha`, `pr-10`, `text-air-blue hover:text-sea-green`).

## Roadmap Produto
- Novas páginas previstas: `sensores`, `manutenções`, `preventivas`, `relatórios` (sidebar `src/components/dashboard/sidebar.tsx:27` 11 itens).
- Gráfico real `chart-area.tsx:6` (`recharts` vs `chart.js`) e `SensorMap` real (`leaflet`).
- Upload `foto_url/manual_url` (S3) e vinculação `Sensor→Ativo/ESP32` (hoje placeholders em `ativo-details-modal.tsx:1`).
