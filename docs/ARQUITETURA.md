# 🏗️ Jenus API — Arquitetura

## Visão Geral

**Jenus API** é o backend geral que hospeda todos os sistemas da Jenus em um único processo Express, organizado como uma **API pura** (apenas JSON, sem páginas HTML) com auth geral JWT.

```
monitor-app (React Native)
   │  consumes JWT + endpoints
   ▼
Jenus API (Express, 1 processo)
   ├── src/apps/           ← entrypoints (o ÚNICO local com acesso à internet)
   │   ├── auth/           ← POST /api/auth/*
   │   ├── promo-monitor/  ← /api/* (telegram, channels, filters, monitor...)
   │   └── curriculo-monitor/ ← /api/curriculo/*
   ├── src/promo/          ← domínio Promo Monitor
   ├── src/curriculos/     ← domínio Currículo Automatizado (JavaScript)
   ├── src/core/           ← config, logger, database, utils
   └── src/shared/         ← auth JWT, rate-limiter (compartilhado entre apps)
```

## Princípios de Design

1. **API pura** — sem servir HTML/estáticos. Frontends foram removidos; o app mobile consome JSON.
2. **1 processo, mount modular** — `src/index.ts` cria o Express e monta cada app em um prefixo. Deploy continua sendo `node dist/index.js`.
3. **Entrypoints em `src/apps/`** — a regra é: apps só acessam a internet através dos entrypoints. Nada fora de `src/apps/` deve expor HTTP. Isso força o código de negócio a ser testável e portável.
4. **Auth geral JWT** — um único sistema de auth (access token curto + refresh token) protege todos os apps. Nada de sessão.

## Estrutura de Pastas

| Pasta | Conteúdo |
|---|---|
| `src/apps/` | Entrypoints HTTP (auth, promo-monitor, curriculo-monitor). Única camada que importa Express. |
| `src/promo/` | Lógica de negócio do Promo Monitor (routes/controllers/services por feature). |
| `src/curriculos/` | Lógica de negócio do Currículo Automatizado (JavaScript legado, importado via `@ts-ignore`). |
| `src/core/` | Infraestrutura: `config.ts` (env validado), `logger.ts`, `database.ts`, `utils/`. |
| `src/shared/` | Utilidades reutilizáveis: `auth/jwt-auth.ts`, `rate-limiter.ts`. |

## Fluxo de Requisição

```
Cliente → Authorization: Bearer <accessToken>
       → src/index.ts (Express, cors, json)
       → /api/auth     → src/apps/auth/index.ts
       → /api          → src/apps/promo-monitor/index.ts
       → /api/curriculo → requireAuth (JWT) → src/apps/curriculo-monitor/index.ts
```

## Decisões Registradas

- **Por que não `monitor-app-api` separado?** O app React Native consome os mesmos endpoints do backend; manter 1 processo simplifica deploy e DB.
- **Por que curriculos em JS?** Código legado estável; importado como é para não introduzir risco na fase 1.
- **Por que `dist/index.js` não mudou?** `tsconfig` com `rootDir: ./src` + build copiando `src/curriculos` → `dist/curriculos` mantém o mesmo artefato de deploy.

## Como Adicionar um Novo App

1. Crie a lógica de negócio em `src/<dominio>/`.
2. Crie `src/apps/<nome>/index.ts` com um `Router()` e monte as rotas com prefixos.
3. No `src/index.ts`, importe o app e monte em `app.use('/api/<prefixo>', ...)`.
4. Se precisar de auth, use `requireAuth` de `src/promo/auth/auth.middleware.js` (JWT).