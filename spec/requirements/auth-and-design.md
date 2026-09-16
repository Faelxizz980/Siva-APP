# Requisitos — Auth e Design System

> Migrado de `MEMORY.md:2026-09-02` + sessões Design System 2026-09-16.

## Auth
- `src/pages/login.tsx:18` — `useForm` validação `email` regex + `senha >=6`, mock `MOCK_EMAIL/MOCK_SENHA` `db/requisits.ts:2` (`rafael@etec.com`/`123456`), `onLogin` cria `AuthUser` `{cpf, empresa_id, nivel}`.
- `src/pages/cadastro.tsx` — `nome >=3`, `email`, `senha >=6`, `confirmarSenha`, `setSuccess` mock.
- `LoginResponse.token` `auth.types.ts:18` previsto para `Authorization: Bearer`.
- Toggle senha (`login.tsx:37` `showSenha`, `cadastro.tsx:50` `showSenha/showConfirmarSenha`): `Eye`/`EyeOff` `lucide-react`, `relative` + `absolute right-3 top-1/2 -translate-y-1/2`, `pr-10`, `text-air-blue hover:text-sea-green`, `type="button"` sem submit, `size={18}`.

## Design System (Tailwind Centralizado)
- `tailwind.config.js:6` `theme.extend.colors {jet-black #092327, slate-deep #0B5351, sea-green #00A9A5, air-blue #4E8098, sky-blue #90C2E7}` + `fontFamily {heading Manrope, body Inter}` — `src/index.css:1` `@config "../tailwind.config.js"` (necessário Tailwind 4 + `@tailwindcss/vite`).
- Sem `bg-[#...]` hardcode fora do config; uso `bg-jet-black`, `text-sea-green`, `hover:bg-air-blue`, `border-sea-green` etc. em todo projeto.
- `@fontsource/inter` `400/500/600` + `@fontsource/manrope` `700/800` `src/main.tsx:4`.
- `font-heading font-bold/extrabold` em títulos `Entrar`/`Criar conta`, `font-body font-normal/medium/semibold` em labels/placeholders/botões/links.

## Esquema por Tela (histórico)
- Login claro original `from-sky-blue/20 via-white to-sky-blue/30` com chip `bg-jet-black` (`login.tsx:68`) + botão `bg-jet-black hover:bg-air-blue` → unificado para escuro `from-jet-black via-slate-deep to-jet-black` igual Cadastro (`login.tsx:69`) conforme solicitação “deixe a tela de login igual a de cadastro”.
- Cadastro escuro `from-jet-black via-slate-deep to-jet-black`, logo direta `h-20 max-w-[200px]` (branca, `object-contain`), card `border-air-blue/20 bg-jet-black`, títulos `text-white`/`text-sky-blue`.
- Inputs: correção contraste `bg-white text-jet-black placeholder:text-gray-400 border-gray-300 focus:ring-sea-green` explícito (`login.tsx:96`, `cadastro.tsx:112`) para evitar herança `text-white` sobre `bg-white`; rótulos `text-white` externos.
- Botões: Login `bg-jet-black` → Cadastro `bg-sea-green text-jet-black hover:bg-air-blue hover:text-white`, `focus:ring-sea-green/sky-blue`, `transition-colors duration-300` mantendo `hover:-translate-y-0.5 shadow` do `Button` (`button.tsx:27` `filterTokens`).
- Logo ampliada 40-50% `h-14 w-14` → `h-20 w-20 p-3` + `h-14 w-14` inner (`login.tsx:72`) e `h-14` → `h-20` (`cadastro.tsx:89`).
- Background intermediário `from-sky-blue to-air-blue` foi etapa transitória antes da unificação escura.

## Critérios de Aceite
- `tsc -b` 0, `vite build` ~60kB CSS, sem `any`, `font-heading/body` e `bg-jet-black` etc. gerados (`dist` contém `jet-black`, `sea-green`, `Manrope`, `Inter`), `lucide-react` única lib ícones, sem novas deps.
