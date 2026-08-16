# 🎯 Jenus API

Backend geral da Jenus: API pura (JSON) que hospeda o **Promo Monitor** e o **Currículo Automatizado** em um único processo Express, com **auth geral JWT**.

## ✨ Sistemas

- 🔐 **Auth geral JWT** — access + refresh tokens (ver `docs/AUTH.md`)
- 🎯 **Promo Monitor** — monitora promoções do Telegram e envia para WhatsApp/Discord
- 📄 **Currículo Automatizado** — gera/envia currículos e busca vagas automaticamente
- 📡 **Monitor** — controle start/stop de ambos os sistemas
- 🧪 **Testes** — testar conexões Telegram, filtros e SMTP
- 💾 **Backup** — exportar/importar configurações

## 🚀 Local (Desenvolvimento)

```bash
git clone https://github.com/VictorSalome/enviaPromo.git
cd enviaPromo

# Instalar (pnpm)
pnpm install

# Configurar .env (obrigatório: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
cp .env.example .env
# Edite .env com suas credenciais

# Build + start
pnpm build
pnpm start

# Dev com watch
pnpm dev
```

Acesse: http://localhost:3001/api/health

## 🚀 Deploy

- **Oracle Cloud**: `pnpm deploy` (ver `docs/DEPLOY.md`)
- **Guia completo Oracle**: `docs/ORACLE_CLOUD.md` e `docs/TUTORIAL_DEPLOY.md`
- **Railway**: `node dist/index.js` (config em `railway.toml`)

## 📁 Estrutura

```
src/
├── apps/            # Entrypoints HTTP (auth, promo-monitor, curriculo-monitor)
├── promo/           # Domínio Promo Monitor (TS)
├── curriculos/      # Domínio Currículo Automatizado (JS)
├── core/            # Config, logger, database, utils
└── shared/          # Auth JWT, rate-limiter (compartilhado)
docs/                # Documentação (arquitetura, auth, endpoints, deploy)
scripts/             # Deploy scripts + pm2.config.js
```

## 📚 Documentação

| Doc | Conteúdo |
|---|---|
| `docs/ARQUITETURA.md` | Visão geral e princípios de design |
| `docs/AUTH.md` | Autenticação JWT |
| `docs/ENDPOINTS.md` | Todos os endpoints |
| `docs/DEPLOY.md` | Deploy Oracle/PM2/Railway |
| `docs/SCAPER_GUIDE.md` | Guia do scraper de vagas |

## 🔧 Stack

- **Backend:** Node.js + Express + TypeScript
- **Banco:** SQLite (auto-create)
- **Auth:** JWT (jsonwebtoken)
- **Deploy:** Oracle Cloud Free Tier (ARM) + PM2