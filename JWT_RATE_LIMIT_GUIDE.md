# Guia de Implementação JWT + Rate Limiting

## 🚀 Resumo

Sistema completo de autenticação JWT com refresh tokens, rate limiting global e por rota, e integração mobile.

---

## 1. 🔐 JWT Authentication

### Arquivos Criados

```
src/shared/auth/
├── jwt.ts                          # Funções JWT principais
├── jwt-auth.ts                     # Middleware JWT avançado
└── auth.middleware.ts              # CSRF + Session management

src/services/api.ts                 # Cliente API mobile com refresh automático
hooks/useAuth.ts                    # Hook de autenticação React
```

### Configuração

**.env**
```bash
JWT_ACCESS_SECRET=gerado_em_produção
JWT_REFRESH_SECRET=gerado_em_produção
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Uso

**Login (Mobile):**
```typescript
import { login } from '../src/services/api';

const handleLogin = async () => {
  try {
    await login('user@email.com', 'senha123', 'fingerprint_device');
    router.replace('/dashboard');
  } catch (error) {
    alert('Login falhou: ' + error.message);
  }
};
```

**Middleware Backend:**
```typescript
import { requireAuth } from '../shared/auth/jwt';

router.post('/api/curriculo/monitor', requireAuth, (req, res) => {
  const user = req.user; // { userId, email, role }
  // ...
});
```

**Refresh Automático:**
```typescript
// O axios interceptor já lida com isso automaticamente
// Quando 401 é retornado, tenta refresh e retenta a requisição
```

---

## 2. 🛡️ Rate Limiting

### Arquivos Criados

```
src/shared/
└── rate-limiter.ts                # Sistema de rate limiting
```

### Configurações Disponíveis

| Config | Janela | Limite | Uso |
|--------|--------|--------|-----|
| `global` | 1 min | 1000 req | Proteção geral |
| `auth` | 15 min | 5 tentativas | Login brute force |
| `api` | 1 min | 100 req | Endpoints gerais |
| `upload` | 1 min | 10 req | Upload de arquivos |
| `curriculo` | 24h | 50 req | Geração de currículos |
| `whatsapp` | 1 min | 20 req | Mensagens WhatsApp |

### Uso no Routes

```typescript
import { rateLimitConfig } from '../shared/rate-limiter';
import { requireAuth } from '../shared/auth/jwt';

// Proteção geral para tudo
app.use('/api', rateLimitConfig.global);

// Rota específica
router.post('/api/auth/login', rateLimitConfig.auth, authController.login);

// Rota de currículo (limite diário)
router.post('/api/curriculo/gerar', rateLimitConfig.curriculo, requireAuth, curriculoController.gerar);

// WebSocket endpoint
router.get('/api/monitor/status', rateLimitConfig.api, requireAuth, monitorController.getStatus);
```

---

## 3. 📱 Mobile Integration

### Serviços API

```typescript
// Login com JWT
const response = await api.post('/api/auth/login', { email, password });

// Acesso aos monitores
const monitor = await curriculoService.getMonitor();
const promoStatus = await promoService.getStatus();
```

### Cache de Estatísticas

```typescript
// Cache automático (30s TTL por padrão)
import { cacheHelpers } from '../src/services/api';

const getStats = () => {
  const cached = cacheHelpers.getStats('monitor-stats', 30000);
  if (cached) return cached;
  return fetchFromAPI();
};
```

### Refresh Automático

O axios interceptor já lida com refresh automático:

```typescript
// Quando request falha com 401:
1. Detecta refresh token
2. Chama /api/auth/refresh
3. Atualiza accessToken no AsyncStorage
4. Retenta a requisição original
```

---

## 4. 🔧 Configuração no Oracle

### Variáveis de Ambiente

```bash
# .env
ORACLE_HOST=136.248.109.21
ORACLE_PORT=3001
ORACLE_DB_NAME=candidate_flow
ORACLE_USER=candidate_user
ORACLE_PASSWORD=secure_password_123

# JWT (gerar com OpenSSL)
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

### Headers Necessários

```javascript
// Mobile app headers
{
  'Authorization': 'Bearer <access_token>',
  'X-CSRF-Token': '<csrf_token>',
  'X-Fingerprint': '<device_fingerprint>'
}
```

---

## 5. 📊 Monitoramento

### Rate Limit Headers (retornados)

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699876543210
```

### Erros Comuns

```javascript
// 401 - Token inválido/expirado
{
  "success": false,
  "message": "Token inválido ou expirado",
  "error": "INVALID_TOKEN",
  "needsRefresh": true
}

// 429 - Rate limit excedido
{
  "success": false,
  "message": "Limite de requisições excedido",
  "retryAfter": 60
}
```

---

## 6. 🛠️ Scripts de Deploy

```bash
# Setup inicial
chmod +x scripts/setup-oracle-jwt.sh
./scripts/setup-oracle-jwt.sh

# Build
npm run build

# Start
npm start
```

---

## 7. ✅ Checklist de Implementação

- [ ] Gerar chaves JWT com OpenSSL
- [ ] Configurar .env.production
- [ ] Importar middlewares em routes
- [ ] Testar login com refresh
- [ ] Verificar rate limiting nas rotas
- [ ] Testar logout completo
- [ ] Verificar cache de estatísticas
- [ ] Deploy no Oracle

---

## 📞 Suporte

Para problemas de autenticação:
1. Verifique se as chaves JWT estão iguais no backend e client
2. Confirme que o refresh token está sendo armazenado em cookies httpOnly
3. Verifique os timestamps de expiração

Para rate limiting:
1. Verifique IP do cliente
2. Consulte logs de autenticação
3. Verifique se está usando Redis (produção)