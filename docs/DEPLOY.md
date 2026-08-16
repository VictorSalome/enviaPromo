# 🚀 Jenus API — Deploy

## Infraestrutura

- **Host Oracle Cloud**: `136.248.109.21` (user `ubuntu`, SSH key `~/.ssh/oracle.key`)
- **Diretório remoto**: `/home/ubuntu/enviaPromo`
- **PM2**: processo `promo-monitor` rodando `dist/index.js`
- **GitHub**: `VictorSalome/enviaPromo`, branch `master` (GitHub Actions faz deploy em push)
- **Railway**: `railway.toml` com `startCommand: node dist/index.js`

## Deploy Manual (Oracle)

```bash
pnpm deploy          # = bash scripts/deploy-oracle.sh
```

O script:
1. Faz `pnpm build` local
2. Commit + push para `master`
3. No Oracle: `git pull && npm install && npm run build && pm2 restart promo-monitor`

> ⚠️ O projeto usa **pnpm** localmente (pnpm-lock.yaml). O script remoto ainda usa `npm install` — se o servidor não tiver pnpm, instale com `npm install -g pnpm` na VM. O `npm install` funciona por ler package.json, mas a consistência de lockfile exige pnpm.

## PM2

```bash
pnpm start:pm2    # pm2 start scripts/pm2.config.js
pnpm restart:pm2  # pm2 restart
pnpm logs:pm2     # pm2 logs promo-monitor
```

Config em `scripts/pm2.config.js`: 1 instância, autorestart, NODE_ENV=production, logs em `./logs/`.

## Setup Inicial da VM

Ver `docs/ORACLE_CLOUD.md` e `docs/TUTORIAL_DEPLOY.md` para o passo a passo completo da Oracle. Resumo:

```bash
# 1. Acessar a VM
ssh -i ~/.ssh/oracle.key ubuntu@136.248.109.21

# 2. Instalar dependências
sudo apt install -y nodejs git
curl -fsSL https://get.pnpm.io/install.sh | sh -
sudo npm install -g pm2

# 3. Clonar e rodar
git clone https://github.com/VictorSalome/enviaPromo.git /home/ubuntu/enviaPromo
cd /home/ubuntu/enviaPromo
cp .env.example .env        # edite com ADMIN_USERNAME, ADMIN_PASSWORD_HASH e JWT secrets
pnpm install --prod
pnpm build
pm2 start scripts/pm2.config.js
```

## Variáveis de Ambiente (produção)

Crie `.env` na VM com pelo menos:

```
NODE_ENV=production
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
DISCORD_WEBHOOK_URL=...
```

Referência completa: `.env.example`.

## Notas

- `dist/index.js` é o entrypoint do deploy — a reestruturação para `src/apps/` não muda o artefato.
- O build copia `src/curriculos` → `dist/curriculos` (JS legado não é compilado pelo tsc).
- Backups: `data/` (SQLite) não deve ser versionado — em produção, considere backup periódico dos arquivos `data/*.db`.