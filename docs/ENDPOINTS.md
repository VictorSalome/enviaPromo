# 🌐 Jenus API — Endpoints

Base URL: `http://localhost:3001` (dev) · `https://<vm-oracle>/` (prod)

## Autenticação (`/api/auth`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login `{username, password}` → tokens |
| POST | `/api/auth/refresh` | — | `{refreshToken}` → novos tokens |
| POST | `/api/auth/logout` | — | Revoga refresh token |
| GET | `/api/auth/me` | Bearer | Usuário atual |

Todas as rotas abaixo exigem `Authorization: Bearer <accessToken>`.

## Promo Monitor (`/api`)

### Telegram Config
| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/telegram-config` | Obter/salvar config |
| GET | `/api/telegram-config/status` | Status da conexão |
| GET | `/api/telegram-config/auth-status` | Status de auth |
| POST | `/api/telegram-config/auth/start` | Iniciar auth |
| POST | `/api/telegram-config/auth/verify` | Verificar código |

### Channels
| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/channels` | Listar/criar canal |
| DELETE | `/api/channels/:id` | Remover |
| POST | `/api/channels/:id/toggle` | Ativar/desativar |

### Filters
| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/filters` | Listar/criar filtro |
| GET | `/api/filters/stats` | Estatísticas |
| POST | `/api/filters/toggle-all` | Ativar/desativar todos |
| PUT | `/api/filters/:id` | Atualizar |
| POST | `/api/filters/:id/toggle` | Toggle filtro |
| DELETE | `/api/filters/:id` | Remover |
| POST/PUT/DELETE | `/api/filters/categories` `/api/filters/categories/:id` | Categorias |

### Monitor
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/monitor/status` | Status do monitor |
| GET | `/api/monitor/connection-status` | Status conexão Telegram |
| POST | `/api/monitor/test-connection` | Testar conexão |
| POST | `/api/monitor/test-flow` | Testar fluxo completo |
| POST | `/api/monitor/start` | Iniciar |
| POST | `/api/monitor/stop` | Parar |
| POST | `/api/monitor/force-check` | Checagem forçada |

### Discord
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/discord/test` | Testar webhook Discord |

### Stats
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/stats/overview` | Visão geral |
| GET | `/api/stats/by-channel` | Por canal |
| GET | `/api/stats/by-filter` | Por filtro |

### Backup
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/backup/export` | Exportar config JSON |
| POST | `/api/backup/import` | Importar config |

### Testes
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/test/telegram` | Testar conexão Telegram |
| POST | `/api/test/filters` | Testar filtros com texto |

### Price Alerts
| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/price-alerts` | Listar/criar alerta |
| PUT | `/api/price-alerts/:id` | Atualizar |
| DELETE | `/api/price-alerts/:id` | Remover |

### Deploy
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/deploy/upload` | Upload de arquivo (multer) |
| POST | `/api/deploy/trigger` | Disparar deploy |

## Currículo Automatizado (`/api/curriculo`)

> O mount exige `requireAuth` (JWT) globalmente. Rotas de scraper também aceitam API key.

### Analisar
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/status` | Status do sistema |
| GET | `/api/curriculo/health` | Health check |
| POST | `/api/curriculo/gerar-curriculo` | Gerar currículo |
| POST | `/api/curriculo/enviar-curriculo` | Enviar currículo |

### Teste
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/curriculo-html` | Visualizar currículo HTML |
| POST | `/api/curriculo/curriculo-teste-email` | Enviar currículo de teste |

### SMTP
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/smtp-test` | Testar SMTP |
| GET/PUT | `/api/curriculo/config/smtp` | Obter/atualizar config SMTP |

### Buscar Vagas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/buscar-vagas/fontes` | Listar fontes |
| POST | `/api/curriculo/buscar-vagas` | Buscar vagas |
| POST | `/api/curriculo/buscar-vagas/fonte/:fonte` | Buscar por fonte |
| POST | `/api/curriculo/buscar-vagas/auto-apply` | Auto-apply |
| GET | `/api/curriculo/buscar-vagas/scheduler` | Status scheduler |
| POST | `/api/curriculo/buscar-vagas/scheduler/start` `/stop` `/run` | Controlar scheduler |
| POST | `/api/curriculo/buscar-vagas/linkedin` | Parse LinkedIn |
| GET | `/api/curriculo/buscar-vagas/linkedin-cron` | Status cron LinkedIn |
| POST | `/api/curriculo/buscar-vagas/linkedin-cron/start` `/stop` `/run` | Controlar cron |

### Scraper (aceita API key)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/scraper/vagas` | Vagas (query params) |
| GET | `/api/curriculo/scraper/tecnologia/:tech` | Vagas por tecnologia |
| GET | `/api/curriculo/scraper/remoto` | Vagas remotas |
| POST | `/api/curriculo/scraper/batch` | Batch (exige API key) |
| GET | `/api/curriculo/scraper/status` | Status |

### Monitor
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/monitor` | Status do monitor |
| POST | `/api/curriculo/auto-apply` | Auto-apply manual |

### Outros
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/curriculo/temp/*` | Arquivos temporários (preview PDF) |
| GET | `/api/health` | Health check geral da API |

## Notas
- Resposta padrão de erro: `{ success: false, message }`.
- Resposta 404 padrão: `{ success: false, message: "Rota não encontrada" }`.
- Todas as rotas de curriculo ficam sob `/api/curriculo` (requireAuth JWT) — o app internamente monta em `/`.