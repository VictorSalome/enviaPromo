# 🚀 TUTORIAL COMPLETO - DEPLOY NA VM ORACLE CLOUD

## Passo 1: Acessar o Console da VM

No Oracle Cloud Console:
1. Menu ≡ → **Compute** → **Instances**
2. Clique na instância: **promo-monitor**
3. Procure e clique em: **"Console Connection"** ou **"Remote Console"**

> 💡 Dica: Pode estar no botão **Actions** → **More actions** → **Console Connection**

---

## Passo 2: Fazer Login no Console

Quando abrir o terminal no navegador:
```
Login: ubuntu
Senha: (deixe em branco, pressione Enter)
```

Se pedir senha e não aceitar em branco:
- Tente: `ubuntu`
- Ou verifique se há uma senha nas informações da VM

---

## Passo 3: Executar o Deploy (Comando Único)

**Cole exatamente este comando e pressione Enter:**

```bash
curl -sL https://raw.githubusercontent.com/VictorSalome/enviaPromo/master/scripts/deploy.sh | bash
```

---

## Passo 4: Aguarde o Deploy

O script vai mostrar o progresso:
```
🚀 PROMO MONITOR - DEPLOY ORACLE CLOUD
📦 [1/10] Atualizando sistema...
📦 [2/10] Instalando Node.js 20...
💾 [3/10] Configurando swap (2GB)...
📥 [4/10] Baixando projeto...
📦 [5/10] Instalando dependências...
🔨 [6/10] Build...
📝 [7/10] Configurando .env...
📁 [8/10] Criando diretório de dados...
🌐 [9/10] Instalando PM2...
🚀 [10/10] Iniciando aplicação...
```

**Tempo estimado: 5 minutos**

---

## Passo 5: Verificar se Funcionou

Quando terminar, execute:
```bash
pm2 status
```

Deve mostrar:
```
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ promo-monitor    │ default     │ N/A     │ fork    │ XXXXX    │ Xm     │ 0    │ online    │ 0%       │ XX.0mb   │ ubuntu   │ disabled │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## Passo 6: Acessar o App

No seu navegador, acesse:
```
http://136.248.109.21:3001
```

**Login:** `admin`  
**Senha:** `admin123`

---

## ⚠️ Se der erro na Etapa 3

Se o comando falhar, execute passo a passo:

```bash
# 1. Atualizar
sudo apt update -qq

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# 3. Swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 4. Baixar projeto
cd ~
git clone https://github.com/VictorSalome/enviaPromo.git
cd enviaPromo

# 5. Instalar
npm install

# 6. Build
npm run build

# 7. Configurar
 cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$yXf3vK0vlJKnRD3sWMiVyOeUYdyV4zceeLgxf.Qc5TRE0C3Q5hJrK
SESSION_SECRET=chave-oracle-cloud-32-chars
WHATSAPP_PHONE=5511987319331
CALLMEBOT_APIKEY=2359872
CHECK_INTERVAL_SECONDS=30
MIN_TIME_BETWEEN_MESSAGES=30
URGENT_ENABLED=true
DATABASE_PATH=./data/promo-monitor.db
EOF

# 8. Dados
mkdir -p data

# 9. PM2
sudo npm install -g pm2

# 10. Iniciar
pm2 start dist/index.js --name "promo-monitor"
pm2 save
```

---

## 🔄 Comandos Úteis Depois do Deploy

```bash
# Ver logs
pm2 logs promo-monitor

# Reiniciar
pm2 restart promo-monitor

# Parar
pm2 stop promo-monitor

# Ver recursos (CPU/Memória)
pm2 monit
```

---

## 🆘 Se o Console Não Funcionar

Se não conseguir abrir o console da VM, tente:

1. **Serial Console**:
   - Na página da VM, procure **"Serial Console"** (pode estar em "More actions")

2. **Reiniciar a VM**:
   - Botão **Actions** → **Reboot**
   - Aguarde 2 minutos e tente novamente

3. **Verificar IP**:
   - Na página da VM, verifique se o IP ainda é: `136.248.109.21`
   - Se mudou, use o novo IP

---

## ✅ Checklist Final

- [ ] Acessei o console da VM
- [ ] Fiz login com `ubuntu`
- [ ] Execute o comando de deploy
- [ ] Aguardei 5 minutos
- [ ] Verifiquei com `pm2 status` (mostra "online")
- [ ] Acessei `http://136.248.109.21:3001` no navegador

---

**Boa sorte! 💪**
