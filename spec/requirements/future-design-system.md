# Requisitos Futuros — Layout, Cores, Fontes, Logo e Novas Páginas

> Extraído do backlog da sessão — armazenado em `spec` e espelhado em `tasks/` como futura tarefa.

## Objetivo
Evoluir o design system e expandir páginas do SIVA mantendo `ai.md` (TypeScript strict, Clean Code, Tailwind centralizado).

## Escopo Futuro

### 1. Layout
- Revisar `src/pages/dashboard.tsx:18` `flex h-screen` + `sidebar.tsx:27` + `header.tsx:1` — melhorar responsividade `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`, `translate-x` + overlay `lg:hidden`, `sticky` header.
- Unificar Auth para tema escuro `from-jet-black via-slate-deep to-jet-black` (já feito `login.tsx:69`/`cadastro.tsx:86`) e aplicar tokens a dashboard/setores/ativos/solicitacoes/ordens/procedimentos/planos.
- Adicionar `react-router` e substituir `Page` state `App.tsx:12` (deep-link, guards por `NivelTipo`).

### 2. Cores
- `tailwind.config.js:7` `jet-black #092327, slate-deep #0B5351, sea-green #00A9A5, air-blue #4E8098, sky-blue #90C2E7` — estender para dashboard (`stat-card`, `sensor-status`, `activityConfig`) e substituir `blue-50/blue-600` remanescentes (`sidebar.tsx:64`, `header.tsx:67`, `ativo-card.tsx:23` etc.) por tokens.
- Inputs `bg-white text-jet-black` com `focus:ring-sea-green` como accent único já aplicado; replicar em `textarea.tsx`/`select.tsx` (`focus:border-blue-500` → `sea-green`).

### 3. Fontes
- `Inter` body (`400/500/600`) e `Manrope` heading (`700/800`) via `@fontsource` `main.tsx:4`, `fontFamily heading/body` `tailwind.config.js:6` — aplicar `font-heading` em todos os títulos e `font-body` em labels/inputs/botões (já em `login.tsx:75`/`cadastro.tsx:90`).
- Remover `bg-[#...]`/`font-` hardcode fora do config.

### 4. Logo
- `assets/logo.png` 1024×1024 branca — já em `login.tsx:72` `h-20 w-20 p-3` chip e `cadastro.tsx:89` `h-20 max-w-[200px]` direto; reaplicar no `sidebar.tsx:64` (`bg-blue-600` → `bg-jet-black` + logo), `header.tsx:67` avatar, favicon `index.html:5`.
- Garantir contraste: chip `bg-jet-black` sobre fundo claro (histórico) e direto sobre fundo escuro; `object-contain`, `max-w` proporcional.

### 5. Novas Páginas
- Completar `sensores`, `manutenções`, `preventivas`, `relatórios`, `configurações` previstas no sidebar (`sidebar.tsx:27` 11 itens) — hoje placeholders `sensor-map.tsx:3`, `chart-area.tsx:6`.
- Integrar `Sensor→Ativo`/`ESP32→Ativo` real (hoje `ativo-details-modal.tsx:1` placeholders `Activity/Cpu`), `foto_url/manual_url` upload S3.
- Criar páginas `perfil.tsx` completa, `notificacoes` dedicada, e `onboarding` tour `Setor→Ativo`.

## Critérios
- `tailwind.config.js` única fonte de cores/fontes, `src/index.css:1` `@config`, build `tsc -b` 0, `vite build` OK, `oxlint` sem errors, sem novas deps sem justificativa, responsivo e `Modal` com `Escape` + `overflow:hidden`.
