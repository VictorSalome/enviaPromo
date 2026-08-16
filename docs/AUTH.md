# 🔐 Jenus API — Autenticação (JWT)

## Modelo

Auth geral JWT com **access token** (curto, 15 min) e **refresh token** (longo, 7 dias) armazenado no banco para revogação.

| Token | Validade | Uso |
|---|---|---|
| `accessToken` | 15 min | `Authorization: Bearer <token>` em todas as rotas protegidas |
| `refreshToken` | 7 dias | `POST /api/auth/refresh` para obter novos tokens |

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Envia `{ username, password }` → retorna `{ accessToken, refreshToken, user }` |
| `POST` | `/api/auth/refresh` | Envia `{ refreshToken }` → retorna novos tokens |
| `POST` | `/api/auth/logout` | Revoga o refresh token (invalida no banco) |
| `GET` | `/api/auth/me` | Retorna o usuário atual (requer Bearer token) |

## Headers

- **Access token** → `Authorization: Bearer <accessToken>`
- Response também seta cookies: `accessToken` (15 min) e `refreshToken` (7 dias) para compatibilidade com clientes que usam cookies.

## Middlewares

| Middleware | Efeito |
|---|---|
| `requireAuth` | Exige access token válido; senão `401` |
| `optionalAuth` | Se houver token válido, anexa `req.user`; senão segue sem auth |

## Configuração (`.env`)

```
JWT_ACCESS_SECRET=...  # obrigatório, min 16 chars
JWT_REFRESH_SECRET=... # obrigatório, min 16 chars
```

Gere com:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Proteções Adicionais

- **Rate limit no login** — 5 tentativas / 15 min por IP (previne brute force).
- **Senha com bcrypt** — hash em `ADMIN_PASSWORD_HASH` no `.env`.
- **Revogação de refresh tokens** — tokens ficam no banco; logout/revoke os remove.
- **Limpeza automática** — tokens expirados são removidos periodicamente.

## Exemplo de Uso

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Acessar rota protegida
curl http://localhost:3001/api/channels \
  -H "Authorization: Bearer <accessToken>"

# Refresh
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Onde Está Implementado

- `src/shared/auth/jwt-auth.ts` — geração/verificação de tokens, `requireAuth`, `optionalAuth`, `refreshToken`
- `src/promo/auth/auth.controller.ts` — `login`, `logout`, `me`
- `src/promo/auth/auth.middleware.ts` — `requireAuth`/`optionalAuth` (usa `jwt-auth`)
- `src/apps/auth/index.ts` — entrypoint `/api/auth`