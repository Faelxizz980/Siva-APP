# SIVA Front-End — Análise de Integração (Etapa 1 — Analisar, sem alteração de código)

> Gerado em 2026-10-12. Fonte: leitura de `ai.md` + `spec/` + `tasks/` + código atual em `src/`.
> Princípio do contrato: ENTENDER → ANALISAR → REUTILIZAR → INTEGRAR → TESTAR → VALIDAR.

## 1. Mentalidade (`ai.md`)

Senior Architect / Frontend: TypeScript strict sem `any`, Clean Code / SOLID / DRY,
modular por responsabilidade (`components/pages/hooks/services/types/utils`),
Tailwind como único padrão, tokens centralizados, preservar padrões existentes,
simplicidade > abstração prematura.

## 2. Inventário atual

**Stack (`package.json:12`):** `react@19.2.8` + `react-dom`, `vite@8.2.2`,
`typescript@6.0.2`, `tailwindcss@4.3.3` + `@tailwindcss/vite`,
`lucide-react@1.39`, `motion@13.1.1`, `oxlint@1.79`.
Sem `axios`, `react-router`, `zod`, `react-query`, `zustand`.

**Entry (`src/main.tsx:1`):** `main.tsx` → `App.tsx`. Fonts
`@fontsource/inter+manrope`, `src/index.css:1` (`@import tailwindcss` + `@config`).

**Roteamento (`src/App.tsx:48`):** sem router. `type Page` com 20 valores
(`home|login|admin|admin-empresas|admin-empresa-detalhes|admin-usuarios|admin-cadastros|admin-sensores|dashboard|setores|ativos|esp32|sensores|minhas-ordens|solicitacoes|ordens|procedimentos|planos|preventivas|relatorios|configuracoes`).
`useState<Page>` + guard `canAccessRoute(user,page)` + `homePage(user)`
em `src/utils/permissions.ts:81`. Prop-drilling de ~10 `useState` com mocks.
Sem `Context/store`.

**Páginas (`src/pages/`):** `home|login|dashboard|admin|admin-empresas|admin-empresa-detalhes|admin-usuarios|admin-cadastros|admin-sensores|setores|ativos|esp32|sensores|minhas-ordens|solicitacoes|ordens|procedimentos|planos|perfil|placeholder`.
Layout: `admin-layout.tsx:1` (ADMIN) + `header.tsx:1` + `top-nav.tsx:1` + `sidebar.tsx:27` (morta).

**Componentes (`src/components/`):** `ui/{input,textarea,select,button,modal,toast,count-up,animated-list}` + `dashboard/*` + `setores/ativos/esp32/sensores/ordens/solicitacoes/procedimentos/planos/notificacoes/*` + `shared/equipamento-select.tsx:1`.
Sem tabela genérica — tabelas inline por página.
`modal.tsx:3` (`sm/md/lg/xl`, `Escape`, `LAYER_CLASS.modal`), `toast.tsx:1`,
`button.tsx` (`isLoading`, `filterTokens`).

**Hooks/utils:** só `hooks/use-form.ts`.
`utils/{permissions,layers,cn,format,periodicidade}`.
`layers.ts:1` z-index central + portal em `notification-dropdown.tsx:1`.

**Services/HTTP (`src/services/`):** `fetch` via `api.ts:1`
(`ApiError 401/403`, `API_BASE=VITE_API_URL`, `USE_API`).
Sem interceptor, sem `Authorization`, sem `getToken()`.
`auth.service.ts:1` (`loginRequest/storeToken/clearToken` → `localStorage siva_token`),
`empresa/usuario/admin-sensor/esp32/ordem/solicitacao.service.ts`.
Padrão `if (USE_API) apiFetch else mock` — migração gradual já prevista.

**.env:** nenhum arquivo. Só `VITE_API_URL` lido em `api.ts:24`. Sem URL hardcoded (grep confirma: sem `axios|Bearer|Authorization`, só `siva_token` + `VITE_API_URL` + `USE_API`).

**Auth atual:** `login.tsx:38` (`useForm` email+senha≥6) → `loginRequest` → `storeToken mock-token-{id}` → `App.handleLogin` força `empresa_id=1` p/ não-admin.
`handleUnauthorized/handleForbidden` → login / `Placeholder 403`.
`logout` = `clearToken + setUser(null)`.
Sem `/auth/me`, sem refresh, sem leitura do token no `apiFetch`.

**Erros/loading/empty:** `ApiError.isUnauthorized/isForbidden` tratado por página
(ex: `minhas-ordens.tsx:86`). UX `401/403/409` manual.
Telas API (`sensores/esp32/minhas-ordens/admin-*`) já têm `loading skeleton/empty/error`.
Forms validam inline + `422/409` vira mensagem de campo
(ex: `Já existe ESP32 com esse ID`).

**Estilos:** Tailwind centralizado `tailwind.config.js:6`
(`jet-black/slate-deep/sea-green/air-blue/sky-blue`, `font-heading/body`).
Sem `bg-[#...]`.

**Testes:** zero. `lint=oxlint` apenas.

## 3. Fluxo atual

```text
Home → Login (mock 123456) → handleLogin → homePage por nivel.tipo
  ADMIN → admin* | tecnico → minhas-ordens | gestor → dashboard
  ↓ prop drilling mocks → apiFetch SEM token (USE_API=false por padrão)
```

## 4. Divergências críticas vs Back oficial

1. **Auth:** front `POST /auth/login → {user, token}` com `AuthUser{cpf,empresa_id,nivel{tipo}}`.
   Back `POST /api/auth/login {email,senha} → {success:true,data:{token,user{id,nome,email,tipo:ADMIN|GESTOR|TECNICO,especialidade,empresaId,status}}}` + `GET /api/auth/me`.
   `apiFetch` nunca envia `Authorization: Bearer`. Token gravado mas nunca lido.
2. **Roles antigas:** `super_admin|funcionario|admin lowercase` devem sumir.
   Só `ADMIN|GESTOR|TECNICO` + `MECANICO|ELETRICISTA`.
3. **Paths:** front `/empresas|/usuarios|/esp32|/solicitacoes|/ordens|minhas-ordens|/admin/sensores`.
   Back `/api/companies|/users|/devices|/sensors|/sectors|/assets|/maintenances|/readings|/dashboard/admin-summary|/auth/me`.
4. **Envelope:** front `await res.json() as T`.
   Back `{success,data,meta}` + paginação `{total,page,pageSize,totalPages}`. Unwrap deve ser centralizado em `api.ts`.
5. **Contratos finos:**
   - `POST /devices → {token}` uma vez (sem `GET token` — front tem `getToken`, deletar);
   - `POST /sensors` exige `ativo.setorId === esp32.setorId` senão `422`;
   - `PATCH /users/:id/status {ATIVO|INATIVO}` (front usa `/ativar|inativar`);
   - `DELETE 409` por vínculo;
   - `GET /alerts 501` (não mockar);
   - leituras JWT vs `X-Token` separados.
6. **Cadastro público:** `cadastro.tsx` mock existe — Back sem `register`, remover do fluxo.

## 5. Ponto de entrada da integração (Fase 1–2)

1. `services/api.ts` — base `/api`, unwrap `{data}`, injeta `Bearer getToken()`, trata `401→logout` / `403→forbidden`, mapeia `422/409/404` preservando `message`.
2. `types/auth` + `auth.service.ts` — tipos `ADMIN|GESTOR|TECNICO`, `login POST /api/auth/login`, `me GET /api/auth/me`, normalização `empresaId→empresa_id` na borda.
3. `permissions.ts` + `App.tsx` — trocar `nivel.tipo` por `tipo` uppercase, remover `super_admin/funcionario`.

Só depois Fase 3+ (`companies/users/devices/sensors/sectors/assets/maintenances/readings/dashboard`).

## 6. Regras respeitadas nesta análise

- Nenhum código alterado, nenhum mock removido, nenhum endpoint inventado.
- Reutilizar `apiFetch`, `useForm`, `Modal/Toast`, `TopNav/Header`, `can()/canAccessRoute()`.
- `VITE_API_URL=http://localhost:3000/api`, CORS no Back.
