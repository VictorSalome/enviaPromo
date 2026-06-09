#!/bin/bash
# Webhook para deploy automático
# Este script é chamado pelo GitHub Actions via curl

cd ~/enviaPromo

echo "🚀 Iniciando deploy..."

# Fazer pull do código mais recente
git fetch origin
git reset --hard origin/main

# Instalar dependências e buildar
npm ci
npm run build

# Reiniciar aplicação
pm2 restart promo-monitor
pm2 save

echo "✅ Deploy concluido!"
