# 🎯 Promo Monitor v2.0

Monitor de promoções do Telegram para WhatsApp via CallMeBot.

## ✨ Funcionalidades

- 🔐 **Autenticação** - Login seguro com bcrypt
- ⚙️ **Config Telegram** - Configure API_ID/API_HASH pelo painel
- 📺 **Canais** - Gerencie canais para monitorar
- 🎯 **Filtros Inteligentes** - Broad (OR) e Específico (AND)
- 📡 **Monitor** - Controle start/stop
- 💬 **WhatsApp** - Envio automático via CallMeBot
- 🧠 **Deduplicação** - Por link, preço e loja
- 🎯 **Alertas de Preço** - Notifica quando preço < alvo
- 📊 **Estatísticas** - Dashboard com métricas
- 💾 **Backup** - Exportar configurações
- 🧪 **Testes** - Testar conexões
- 🚨 **Modo Urgente** - Detecta descontos > 50%

## 🚀 Deploy

### Local (Desenvolvimento)

```bash
# Clone
git clone https://github.com/VictorSalome/enviaPromo.git
cd enviaPromo

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite .env com suas credenciais

# Build
npm run build

# Iniciar
npm start
```

Acesse: http://localhost:3001

### Oracle Cloud Free Tier (Produção)

Veja o guia completo em: `docs/ORACLE_CLOUD.md`

**Resumo rápido:**

1. Crie conta em https://www.oracle.com/cloud/free/
2. Crie VM ARM (AMPERE) com Ubuntu 22.04
3. SSH na VM
4. Execute:

```bash
git clone https://github.com/VictorSalome/enviaPromo.git
cd enviaPromo
chmod +x scripts/oracle-deploy.sh
./scripts/oracle-deploy.sh
```

5. Configure o `.env`
6. Pronto! Acesse via IP público

## 📁 Estrutura

```
src/
├── core/           # Config, database, server, logger
├── features/       # Auth, Channels, Filters, Monitor, WhatsApp, etc
public/            # Frontend HTML + CSS + JS
scripts/           # Deploy scripts
```

## 🔧 Stack

- **Backend:** Node.js + Express + TypeScript
- **Banco:** SQLite (auto-create)
- **Frontend:** HTML + Tailwind CSS + DaisyUI
- **Deploy:** Oracle Cloud Free Tier (ARM)

## 📄 Licença

MIT
# Deploy Auto Test
# Deploy test Tue Jun  9 14:03:37 UTC 2026
