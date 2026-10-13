# FRONTEND → BACKEND REQUIREMENTS — SIVA

> Análise exclusiva (nenhum código alterado). Front atual em `/workspaces/Siva-APP/src`.
> Objetivo: dizer ao agente Back **o que o Front precisa**, sem impor implementação.

## 1. Objetivo

Conectar as telas existentes do Front (hoje mock/`USE_API=false` por padrão) ao Back real
`http://localhost:3000/api` (Swagger `/docs`, health `GET /api/health`) de forma incremental,
preservando layout, Tailwind tokens e estrutura `Page`-state.

## 2. Resumo do Front-End analisado

- **Stack:** `react@19.2.8`, `vite@8.2.2`, `typescript@6.0.2`, `tailwindcss@4.3.3`,
  `lucide-react@1.39`, `motion@13.1.1`, `oxlint`. Sem `axios/react-router/react-query/zustand`.
- **Entry:** `src/main.tsx` → `src/App.tsx`. `type Page` (20 valores) + `useState` + guards
  `canAccessRoute/homePage/can/isAdmin` em `src/utils/permissions.ts`.
- **Páginas (20):** `home|login|dashboard|admin|admin-empresas|admin-empresa-detalhes|admin-usuarios|admin-cadastros|admin-sensores|setores|ativos|esp32|sensores|minhas-ordens|solicitacoes|ordens|procedimentos|planos|perfil|placeholder`
  (`preventivas|relatorios|configuracoes` = placeholder; `perfil.tsx` vazio 0 linhas).
- **Layouts:** `admin-layout.tsx` (ADMIN) + `header.tsx` + `top-nav.tsx` (grupos Infra/Manutenção).
  `sidebar.tsx` morta.
- **UI:** `ui/{input,textarea,select,button(modal isLoading/filterTokens),modal(sm/md/lg/xl+Escape),toast,count-up,animated-list}`.
  Tabelas inline por página (sem grid genérico). Filtros client-side (`busca/filtroTipo/filtroSetor`).
  Estados `loading/success/empty/error` já existentes nas telas API.
- **HTTP:** `fetch` via `src/services/api.ts` (`ApiError`, `API_BASE=VITE_API_URL`, `USE_API`).
  Sem `Authorization`, sem interceptor, sem `getToken()`. Sem `.env` no repo.
- **Auth hoje:** `login.tsx` → `auth.service.loginRequest` → mock senha `123456` (`db/requisits.ts`:
  `rafael@etec.com`, `ana.tecnica@siva.com`) ou `POST /auth/login → {user,token}` se `USE_API`.
  Token em `localStorage siva_token` (gravado, nunca enviado). `App.handleLogin` força `empresa_id=1`.
- **Estado:** prop-drilling de ~10 `useState` com mocks em `App.tsx:76`. Sem Context/store.

## 3. Arquitetura de integração atual

```text
Página → (props mock) → setState local (max id+1 / Date.now())
Página API-ready → service → apiFetch(VITE_API_URL + path) → fallback mock se !USE_API
Exceção: minhas-ordens.tsx:86/183 usa USE_API p/ GET /minhas-orders + PATCH /ordens/:id/status
Admin/* usa empresa/usuario/admin-sensor services com USE_API
setores/ativos/solicitacoes/ordens/procedimentos/planos/sensores/esp32 = 100% mock em memória
```

## 4. Autenticação

| Item | Front hoje | Back oficial | Classificação |
|---|---|---|---|
| Login | `POST /auth/login {email,senha} → {user:AuthUser,token}` (sem `/api`, sem envelope) | `POST /api/auth/login {email,senha} → {success:true,data:{token,user{id,nome,email,tipo,especialidade,empresaId,status,criadoEm}}}` | EXISTE MAS É INCOMPATÍVEL (path+envelope+shape) |
| Me | não chama | `GET /api/auth/me + Bearer` | NÃO EXISTE (Front precisa implementar consumo; Back já tem) |
| Bearer | nunca envia (`apiFetch` só `Content-Type`) | `Authorization: Bearer <JWT>` obrigatório | EXISTE MAS É INCOMPATÍVEL (Front deve adaptar) |
| Logout | `clearToken+setUser(null)→home` | sem endpoint (local) | EXISTE E É COMPATÍVEL |
| 401 | `handleUnauthorized → login` | token ausente/inválido | EXISTE E É COMPATÍVEL |
| 403 | `handleForbidden → Placeholder Acesso negado` | sem permissão / INATIVO | EXISTE E É COMPATÍVEL |
| INATIVO | só flag visual, login mock não bloqueia | `403` em login e `/me` | EXISTE MAS É INCOMPATÍVEL (Front deve tratar 403 como bloqueio) |
| Roles | `super_admin|admin|gestor|tecnico|funcionario` lowercase + `nivel{tipo,cargo}` + `cpf` | `ADMIN|GESTOR|TECNICO`, `especialidade MECANICO|ELETRICISTA|null`, `empresaId`, `status` | EXISTE MAS É INCOMPATÍVEL |
| Cadastro público | `cadastro.tsx` mock existe | sem `register` | FRONT NÃO DEVERIA UTILIZAR (remover fluxo) |
| Recuperação/MFA | não existe | não existe | Não implementar |

**Ação necessária (Front, não Back):** usar path oficial, unwrap `{data}`, normalizar
`tipo/empresaId/especialidade/status` na borda, injetar Bearer, chamar `/me` p/ hidratar,
mapear `super_admin→ADMIN`, remover `funcionario/cpf/nivel`, tratar INATIVO=403.

## 5. Usuários

Front assume (`usuario.service.ts`): `GET /empresas/:id/funcionarios`, `GET /usuarios`,
`POST /usuarios {nome,email,senha,tipo: admin|gestor|tecnico, empresa_id, especialidade?}`,
`PUT /usuarios/:id`, `PATCH /usuarios/:id/ativar|inativar`, `DELETE /usuarios/:id`,
resposta = `AuthUser` cru (sem envelope).

Back oficial: `GET /api/users?empresaId=&tipo=&status=` (combináveis),
`POST /api/users` (só ADMIN; GESTOR `{nome,email,senha,tipo:GESTOR,empresaId}`,
TECNICO `+especialidade:MECANICO|ELETRICISTA`, ADMIN sem `empresaId/especialidade`),
`PATCH /api/users/:id {nome,email,tipo,empresaId,especialidade,senha?}`,
`PATCH /api/users/:id/status {ATIVO|INATIVO}`, `DELETE /api/users/:id (409 se vínculo)`,
envelope `{success,data,meta?}`.

Classificação: EXISTE MAS É INCOMPATÍVEL (paths, verbos PUT vs PATCH, `/ativar` vs `/status`,
snake vs camel, sem envelope, sem filtros `page/pageSize`).
`GET /api/companies/:id/users` (ADMIN) pode substituir `listByEmpresa` — DECISÃO NECESSÁRIA.

## 6. Empresas

Front assume (`empresa.service.ts`): `GET /empresas → EmpresaListItem[]` (`{...Empresa,status,funcionarios_count,sensores_count}`),
`GET /empresas/:id`, `POST /empresas {nome,cnpj?}`, `PUT /empresas/:id {nome,cnpj,ativo}`.
Back: `GET/POST /api/companies`, `GET/PATCH/DELETE /api/companies/:id`,
`GET /api/companies/:id/details → {empresa,funcionarios,setores,resumo}`,
`GET /api/companies/:id/users` (ADMIN).
Classificação: EXISTE MAS É INCOMPATÍVEL (PUT vs PATCH, sem `details`, sem envelope,
`status/funcionarios_count/sensores_count` são agregados do Front que o Back só dá em `details/resumo`).
Falta no Front: `DELETE` empresa, consumo de `details` (hoje faz 2 chamadas `getById+listByEmpresa`).

## 7. Dashboard

- `admin.tsx`: calcula `counts` via 3 chamadas (`empresa.list+usuario.listAll+adminSensor.list`).
  Back tem `GET /api/dashboard/admin-summary → {nEmpresas,nFuncionarios,nSensores,nEsp32,funcionarios{total,gestores,tecnicos,mecanicos,eletricistas,ativos,inativos}}`.
  Classificação: EXISTE MAS É INCOMPATÍVEL (Front deve trocar 3 chamadas por 1; Back já atende).
- `dashboard.tsx` operacional: `mockStats/mockSensors/mockActivities` fixos + `PeriodFilter 7d/15d/30d/90d`
  (`ChartArea` placeholder, `SensorMap` placeholder). Sem endpoint de leituras agregadas consumido.
  Classificação: NÃO EXISTE consumo real (Back tem `GET /api/readings?sensorId=` — Front precisa migrar; agregado `7d/90d` é DECISÃO NECESSÁRIA).

## 8. Setores

100% mock (`setores.tsx`, tipos `Setor{id,empresa_id,nome,descricao,localizacao,ativo,criado_em,atualizado_em}`).
Front nunca chama API. Precisa: `GET/POST/PATCH/DELETE /api/sectors` (escrita ADMIN+GESTOR, leitura escopada).
Atenção: `descricao/localizacao` são **UI-only** (comentário no tipo: não persistem) — Back não deve criar coluna sem DECISÃO.
`ON DELETE RESTRICT` esperado (Front valida local). Classificação: EXISTE E É COMPATÍVEL no Back;
Front precisa implementar consumo (payload camel? Front envia snake — DECISÃO: Back usa camel, Front normaliza).

## 9. Ativos

100% mock (`ativos.tsx`, `Ativo{id,empresa_id,setor_id,nome,tag,tipo,criticidade baixa|media|alta,centro_custo,foto_url,manual_url,descricao,ativo,...}`,
`UNIQUE(empresa_id,tag)` validado `toLowerCase`). Precisa: `GET /api/assets?setorId=`, `POST/PATCH/DELETE /api/assets`
(escrita ADMIN+GESTOR). `foto_url/manual_url` hoje texto; upload S3 é futuro (NÃO implementar agora).
Classificação: EXISTE E É COMPATÍVEL no Back; Front precisa consumo + normalização snake/camel.

## 10. ESP32

Front hoje 100% mock + `esp32.service` assume (INCOMPATÍVEL):
`GET/POST /esp32`, `GET /esp32/:id`, `PUT /esp32/:id`, `GET /esp32/:id/token → {token}`,
retorno create `{esp32,token}`, list `Esp32ListItem{setor_nome,sensores_count}`.
Form: `setor_id*, esp_id* único (409→"Já existe"), descricao 100`. Token exibido 1x + modal confirmação + Copiar.

Back oficial: `POST /api/devices {setorId,espId,descricao} → {success,data:{id,setorId,espId,token,descricao,ultimoContato,criadoEm}}`
(token só aqui), `GET /api/devices`, `GET /api/devices/:id` (SEM token), sem `GET token`, sem regeneração, sem PUT documentado p/ devices (verificar).
Classificação: EXISTE MAS É INCOMPATÍVEL (paths `/esp32` vs `/devices`, `PUT` vs `PATCH?`, `getToken` = FRONT NÃO DEVERIA UTILIZAR — remover).
Regra JWT (usuário) vs X-Token (dispositivo) deve ser preservada; nunca expor token em GET.

## 11. Sensores

Front 100% mock, form (`sensor-form-modal`): `ativo_id*, esp32_id* (label esp_id — setor), sensor_id* (dica firmware), tag opcional única (null se vazia), descricao 100, switch Ligado`.
Tabela: Tag/Descrição/Ativo/Setor/ESP32/Status Ligado|Desligado/Último contato (threshold 5min, `Nunca` se nulo).
`admin-sensores.tsx` usa conceito paralelo `AdminSensor{codigo,status disponivel|vinculado|inativo}` + `GET/POST /admin/sensores` — NÃO existe no Back (FRONT NÃO DEVERIA UTILIZAR ou DECISÃO).

Back: `POST /api/sensors {ativoId,esp32Id,sensorId,tag,descricao,ativoStatus:ATIVO?}`,
`GET /api/sensors`, `PATCH/DELETE /api/sensors/:id`. Regra `ativo.setorId===esp32.setorId` senão `422`.
Classificação: EXISTE MAS É INCOMPATÍVEL (Front não chama, e quando chamar deve tratar `422` combinação inválida — hoje não trata).

## 12. Leituras

Front: nenhum consumo real (`mockSensors 10`, `ChartArea` placeholder).
Back: `POST /api/readings {esp_id,sensor_id,vazao,setor}` com `X-Token` (dispositivo) +
`GET /api/readings?sensorId=` com JWT (humano). Classificação: EXISTE E É COMPATÍVEL no Back;
Front precisa implementar `GET` com JWT, NÃO misturar `X-Token` em telas humanas.

## 13. Manutenção

Back só tem `GET/POST/PATCH/DELETE /api/maintenances` (`funcionarioId` validado: existente+ATIVO+mesma empresa do sensor).
Front tem 5 conceitos mock, **nenhum consome `/maintenances`**:
- `solicitacoes.tsx` (Tipo preventiva|inspecao|corretiva + XOR sensor|esp32 + `data_desejada>=hoje` → `aberta`);
- `ordens.tsx` (origens prefill/avulsa/reagendamento, `tecnico|gestor|admin canSchedule`, conflito `Map tecnico-dia` aviso, `viewMode lista|agenda`);
- `procedimentos.tsx` (Nome único, `supervisor gestor|admin|tecnico`, `categoria preventiva|inspecao`, N:N `especialidade_ids`, inativação lógica);
- `planos.tsx` (só `ativo`, `periodicidade 7`, `data_inicio>=hoje`, `proxima_geracao`, `prazo 3/5/7/15/30`, job `gerarOrdensAutomatica` em memória + botão `Rodar Job`);
- `minhas-ordens.tsx` (única API-ready: `GET /minhas-ordens`, `PATCH /ordens/:id/status`, Iniciar/Concluir com observação obrigatória).
Classificação: NÃO EXISTE correspondência direta — DECISÃO NECESSÁRIA (mapear `solicitacao/ordem/procedimento/plano → maintenances` ou manter mocks; NÃO inventar `POST /ordens`, `POST /planos` no Back).

## 14. Solicitações/Ordens/Outros módulos

Ver §13. `Notificacao` é frontend-only (sem tabela, `notificationsForUser` filtra por `tecnico_id/solicitante_id`).
`POST /api/alerts` = `501` — Front não consome (correto). `GET /api/health` público — Front pode usar p/ conectividade.

## 15. Endpoints necessários (Front → Back oficial)

```text
POST /api/auth/login | GET /api/auth/me | GET /api/health
GET /api/dashboard/admin-summary (ADMIN)
GET/POST /api/companies | GET/PATCH/DELETE /api/companies/:id
GET /api/companies/:id/details | GET /api/companies/:id/users (ADMIN)
GET /api/users?empresaId&tipo&status&page&pageSize | POST /api/users
PATCH /api/users/:id | PATCH /api/users/:id/status | DELETE /api/users/:id
GET/POST /api/sectors | PATCH/DELETE /api/sectors/:id
GET /api/assets?setorId= | POST/PATCH/DELETE /api/assets/:id
POST/GET /api/devices | GET /api/devices/:id
POST/GET /api/sensors | PATCH/DELETE /api/sensors/:id
GET /api/readings?sensorId= (+ POST /api/readings via X-Token p/ dispositivo)
GET/POST/PATCH/DELETE /api/maintenances
```

## 16. Requests (assumidos pelo Front — normalizar p/ camel no Back)

- Login `{email,senha}`. Empresa `{nome,cnpj?}`. Funcionário `{nome,email,senha,tipo,empresaId,especialidade?}` (senha só se alterando).
- Setor `{nome,descricao?,localizacao?,ativo?}` (2 últimos UI-only). Ativo `{setorId,nome,tag,tipo,criticidade,centroCusto?,fotoUrl?,manualUrl?,descricao?}`.
- Device `{setorId,espId,descricao?}`. Sensor `{ativoId,esp32Id,sensorId,tag|null,descricao?,ativoStatus?}`.
- Ordem-status `{status: em_andamento|concluida, observacao_execucao?}`.

## 17. Responses

Back oficial `{success:true,data,meta?{total,page,pageSize,totalPages}}`; erro `{success:false,error:{code,message,details}}`.
Front hoje espera `T` cru (`EmpresaListItem[]`, `AuthUser[]`, `{esp32,token}`, `OrdemServico[]`).
**Ação Front:** unwrap centralizado em `apiFetch`. Back mantém envelope.

## 18. Erros (como o Front trata hoje)

- `401 Sessão expirada → login` (`handleUnauthorized`, `clearToken`). OK.
- `403 Acesso negado → Placeholder` (`handleForbidden`). OK; estender p/ INATIVO.
- `404 Registro não encontrado` (ex: empresa). Toast error.
- `409 Já existe ESP32 / email-CNPJ duplicado / vínculo` → mensagem de campo + Toast. `DELETE` com vínculo deve dar `409` (Front espera modal explicativo).
- `422 Verifique os dados` → campo (ex: `setorId mismatch` sensor — Front ainda não trata, precisa).
- `500 Erro interno, tente novamente` + preserva `message` do Back. `apiFetch` hoje lê `body.message` (Back usa `error.message` — Front deve ler ambos).

## 19. Permissões (UX-only no Front)

`permissions.ts`: `can(infra:write,esp32:token,ordem:manage,ordem:execute,job:run,admin:read,admin:write)`,
`TECNICO_DENY/GESTOR_DENY`, `TECNICO_ROUTES/GESTOR_ROUTES/ADMIN_ROUTES`.
ADMIN=total; GESTOR=operacional sem `admin:*|esp32:token|job:run`; TECNICO=`minhas-ordens|solicitacoes|setores|ativos|esp32|sensores` read-only infra + executa próprias OS.
Back é autoridade (`assertSameCompany`, `PATCH /ordens/:id/status` só próprias, `token` omitido p/ técnico).

## 20. Multiempresa

`empresaId` em todos os domínios (`App.handleLogin` força `1`, `notificationsForUser`, filtros).
Risco: `fEmpresaId` em `admin-cadastros` é select livre — GESTOR/TECNICO não acessam essa tela (só ADMIN), mas Front não impede `empresaId` manual em payload; Back deve manter `assertSameCompany` + `403` e Front deve tratar como falta de permissão sem retry.

## 21. Paginação

Front: **nenhuma** (filtra em memória, `orderBy nome` manual, sem `page/pageSize`).
Back: `meta{total,page,pageSize,totalPages}` em listagens.
Ação Front: adotar `meta` quando migrar; Back mantém formato.

## 22. Mocks (completos — AINDA MOCK, migráveis gradualmente)

```text
src/data/mock.ts → dashboard mockStats(5)/mockSensors(10)/mockStatusCounts(18/4/3/3)/mockActivities(8) → dashboard.tsx | Substituto: /dashboard/admin-summary + /readings | AINDA MOCK
src/data/setores.mock.ts → mockSetores(4)+mockAtivos(7) → setores/ativos via App state | Substituto: /sectors + /assets | PODE SER MIGRADO
src/data/siva-domain.mock.ts → mockUsuarios(6)/mockEsp32(4)/mockSensorEntities(5)/mockEspecialidades(5)/mockProcedimentos(3)/mockPlanos(3)/mockSolicitacoes(4)/mockOrdens(4)/mockNotificacoes(3) empresa_id=1 → todas telas operacionais | Substituto: /users /devices /sensors /maintenances | AINDA MOCK (exceto minhas-ordens parcial)
src/data/admin.mock.ts → mockAdminEmpresas(3)/mockAdminFuncionarios(4)/mockAdminSensores(3) → admin-* via services | Substituto: /companies /users /dashboard/admin-summary | PODE SER MIGRADO (admin-sensores sem equivalente)
db/requisits.ts → rafael@etec.com/ana.tecnica@siva.com 123456 → login mock | Substituto: /auth/login real | AINDA MOCK
```

## 23. Variáveis de ambiente

- `VITE_API_URL=http://localhost:3000/api` (sem barra final; `api.ts` faz trim). Sem `.env*` no repo.
- `CORS_ORIGIN=http://localhost:5173` no Back. Nada de URL fixa em componentes; nada de `JWT_SECRET/X-Token` no Front.

## 24. Necessidades de banco (informativo — Back valida no Prisma)

```text
Usuario: id,nome,email,tipo,especialidade,empresaId,status,criadoEm
Empresa: id,nome,cnpj,status + resumo{funcionarios,setores,ativos,esp32,sensores}
Setor: id,empresaId,nome,ativo (+descricao/localizacao SOMENTE se DECISÃO)
Ativo: id,empresaId,setorId,nome,tag UNIQUE(empresa),tipo,criticidade,centroCusto,fotoUrl,manualUrl,descricao,ativo
ESP32: id,setorId,espId UNIQUE,token(hash?),descricao,ultimoContato
Sensor: id,ativoId,esp32Id,sensorId,tag NULL|UNIQUE?,descricao,ativoStatus
Leitura: espId,sensorId,vazao,setor,timestamp
Manutencao: id,empresaId,sensorId?,funcionarioId?,status,... (mapeamento de ordem/solicitacao PENDENTE)
```

## 25. Compatibilidades (Back já atende, Front adapta consumo)

`/auth/login,/auth/me,/companies,/companies/:id,/users(partes),/sectors,/assets,/devices(POST+GET),/sensors,/readings(GET+POST X-Token),/dashboard/admin-summary,/health`, envelope, `401/403/404/409/422/500`, `ADMIN|GESTOR|TECNICO`, `MECANICO|ELETRICISTA`.

## 26. Incompatibilidades (Front diverge — adaptar Front, NÃO criar no Back)

1. `POST /auth/login` sem `/api` + `{user,token}` sem envelope + `nivel/cpf/snake` → usar oficial.
2. `Bearer` nunca enviado + sem `/me` → implementar.
3. Roles `super_admin/funcionario` + `admin lowercase` → remover.
4. `/empresas|/usuarios|/esp32|/solicitacoes|/ordens|minhas-ordens|/admin/sensores` → usar `/companies|/users|/devices|/sensors|/sectors|/assets|/maintenances`.
5. `PUT /empresas|PUT /usuarios|PUT /esp32` vs `PATCH` oficial.
6. `PATCH /usuarios/:id/ativar|inativar` vs `PATCH /:id/status {ATIVO|INATIVO}`.
7. `GET /empresas/:id/funcionarios` vs `GET /users?empresaId=` ou `/companies/:id/users`.
8. `GET /esp32/:id/token` (revelação) — não existe oficialmente.
9. `AdminSensor /admin/sensores` com `codigo SIVA-SENS-*` — sem equivalente.
10. `solicitacao/ordem/procedimento/plano` — sem endpoint dedicado (só `/maintenances` genérico).
11. Erro lido em `body.message` vs `error.message` do Back.

## 27. Implementações necessárias (Back — verificar antes, reutilizar services/repos/middlewares)

1. Nada novo p/ auth/companies/users/sectors/assets/devices/sensors/readings/dashboard se já implementados — apenas garantir Swagger + testes + `403 sameCompany` + omissão de `token` em GET.
2. Avaliar `PATCH /api/devices/:id` (Front precisa editar `setor/esp_id/descricao`) se ausente.
3. Avaliar `DELETE /api/devices/:id` + `DELETE /api/sectors/:id` com `409` por vínculo (Front espera bloqueio).
4. Avaliar query `GET /api/assets?setorId=` + `GET /api/readings?sensorId=` + filtros `GET /api/users?empresaId&tipo&status` + paginação `page/pageSize` se ausentes.
5. Documentar mapeamento `maintenances ↔ solicitacao/ordem/plano/procedimento` ou declarar fora de escopo.

## 28. Itens que NÃO devem ser implementados

- `POST /auth/register` (sem cadastro público) nem `GET /users/me` (oficial é `/auth/me`).
- `GET /esp32/:id/token`, regeneração de token, MFA, recuperação de senha.
- `GET /api/alerts` real (oficial `501`; Front não consome — manter).
- Colunas `setor.descricao/localizacao`, tabelas `procedimento/plano/ordem/solicitacao/notificacao` espelhando o mock sem DECISÃO.
- Endpoints paralelos `/empresas|/esp32|/usuarios/:id/ativar` só p/ agradar o Front.

## 29. Decisões pendentes (DECISÃO NECESSÁRIA)

1. `maintenances` cobre `solicitação→ordem→plano→procedimento` ou esses 4 seguem mock até v2?
2. `AdminSensor codigo SIVA-SENS-*` tem equivalente ou tela `admin-sensores` sai de escopo?
3. `GET /companies/:id/users` vs `GET /users?empresaId=` — qual o Front usa?
4. `PATCH /devices/:id` + `DELETE` com `409` existem?
5. `setor.descricao/localizacao` viram coluna ou seguem UI-only?
6. `sensor.tag` UNIQUE por empresa? `foto/manual upload S3` entra agora?
7. Agregado dashboard operacional (`7d/15d/30d/90d` vazão) — novo endpoint ou `GET /readings` + agregação no Front?

## 30. Checklist final

- [x] Analisei todo o `src/` (21 páginas, 8 services, 16 tipos, 4 mocks, `permissions.ts`, `api.ts`, `login.tsx`, `App.tsx`)
- [x] Analisei services, tipos, páginas, formulários, permissões, mocks, chamadas HTTP
- [x] Comparei com o contrato atual do Back-End (§5)
- [x] Listei endpoints existentes / incompatíveis / realmente ausentes (§15/25/26/27)
- [x] Listei payloads, responses, erros, auth, autorização, empresa, banco (§16/17/18/4/19/20/24)
- [x] Não inventei regras (divergências marcadas DECISÃO NECESSÁRIA)
- [x] Não alterei código, não removi mocks, não criei endpoints
- [x] Criei somente `docs/FRONTEND_BACKEND_REQUIREMENTS.md`
