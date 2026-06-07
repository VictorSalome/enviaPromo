#!/bin/bash
# Script de instalação automática para Oracle Cloud Free Tier
# AMPERE ARM - Ubuntu 22.04

set -e

echo "🚀 Instalando Promo Monitor no Oracle Cloud..."

# Atualiza sistema
sudo apt update && sudo apt upgrade -y

# Instala dependências
sudo apt install -y nodejs npm git nginx certbot python3-certbot-nginx

# Instala Node.js 18+ (versão mais recente)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instala PM2 globalmente
sudo npm install -g pm2

# Cria diretório da aplicação
sudo mkdir -p /opt/promo-monitor
sudo chown ubuntu:ubuntu /opt/promo-monitor

# Clona repositório (usuário precisa ter feito git clone antes)
cd /opt/promo-monitor

# Instala dependências
npm install

# Build
npm run build

# Cria diretório de dados
mkdir -p data

# Configura PM2
pm2 start dist/index.js --name "promo-monitor"
pm2 startup systemd
pm2 save

echo "✅ Instalação concluída!"
echo ""
echo "Próximos passos:"
echo "1. Configure o .env em /opt/promo-monitor/.env"
echo "2. Configure o Nginx (veja nginx-config.md)"
echo "3. Configure o SSL (opcional)"
echo ""
echo "Para ver logs: pm2 logs promo-monitor"
echo "Para reiniciar: pm2 restart promo-monitor"
