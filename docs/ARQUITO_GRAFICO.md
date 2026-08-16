# 🔄 Fluxo da Aplicação - Currículo Automatizado

## 📊 Diagrama Visual do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🌐 FRONTEND (HTML/Tailwind)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  Login Page     │───▶│  Dashboard      │───▶│  Gerar Currículo│        │
│  │  /envia-curriculo/login │  /envia-curriculo │  /api/curriculo/gerar-curriculo │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│         │                      │                           │                │
│         │                      │                           │                │
│         ▼                      ▼                           ▼                │
│  Token de sessão         Navegação              PDF gerado (preview)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🔐 AUTH MIDDLEWARE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Verifica sessão do usuário → Permite ou rejeita acesso                    │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🏗️  BACKEND (Express)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        📦 ROUTAS PRINCIPAIS                          │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  AUTH ROUTES:                                                     │  │
│  │  POST /api/auth/login      → Login com username/senha (bcrypt)   │  │
│  │  POST /api/auth/logout     → Logout e limpa sessão               │  │
│  │                                                                    │  │
│  │  CURRICULO ROUTES (protegidas):                                   │  │
│  │  GET  /api/curriculo/status → Status do sistema                 │  │
│  │  POST /api/curriculo/gerar-curriculo → Gera preview PDF          │  │
│  │  POST /api/curriculo/enviar-curriculo → Envia PDF por e-mail   │  │
│  │  POST /api/curriculo/auto-apply → Pipeline completo              │  │
│  │  GET  /api/curriculo/scraper/vagas → Busca vagas               │  │
│  │  GET  /api/curriculo/scraper/status → Status do scraper       │  │
│  │                                                                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ⚙️  PROCESSAMENTO PRINCIPAL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐         │
│  │  1. SCRAPER    │────▶│  2. ANÁLISE    │────▶│  3. PERSONALIZAÇÃO │         │
│  │                │     │                │     │                  │         │
│  │• Busca vagas   │     │• Extrai dados  │     │• Adapta currículo│         │
│  │  via API/RSS   │     │  da vaga        │     │  para a vaga     │         │
│  │• Fontes:      │     │• Título, empresa│     │• Destaca skills │         │
│  │  Jobicy,       │     │  descrição, etc│     │  relevantes     │         │
│  │  Remotive,     │     │• Email contato │     │• Resumo dinâmico│         │
│  │  Arbeitnow     │     │                │     │                  │         │
│  └────────────────┘     └────────────────┘     └────────────────┘         │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌────────────────┐                                  │
│                         │  4. GERAÇÃO PDF │                                  │
│                         │                │                                  │
│                         │• PDFKit A4 ABNT │                                  │
│                         │• Salvo em temp/ │                                  │
│                         │• Preview URL   │                                  │
│                         └────────────────┘                                  │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌────────────────┐                                  │
│                         │  5. ENVIO EMAIL │                                  │
│                         │                │                                  │
│                         │• Nodemailer    │                                  │
│                         │• SMTP (Gmail)  │                                  │
│                         │• HTML + PDF    │                                  │
│                         │• Fallback portas│                                 │
│                         └────────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          💾  DADOS & CONFIGURAÇÕES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐         │
│  │  .env          │     │  candidate-    │     │  SQLite DB     │         │
│  │                │     │  profile.json  │     │                │         │
│  │• SMTP config   │     │                │     │• Auth users    │         │
│  │• Porta         │     │• Perfil prof.  │     │• Configs       │         │
│  │• Secrets       │     │• Experiencias  │     │• Logs/stats    │         │
│  └────────────────┘     │• Skills        │     └────────────────┘         │
│         │               │• Educação      │                                 │
│         │               │• Certificações │                                 │
│         │               └────────────────┘                                 │
│         │                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Fluxos Principais

### Fluxo 1: Geração Manual de Currículo

```
Usuário → Browser → Dashboard → "Gerar Currículo" 
    ↓
Frontend JS → POST /api/curriculo/gerar-curriculo {vaga: "..."}
    ↓
Backend → extrairDadosVaga() → personalizarCurriculo() → gerarPdfCurriculo()
    ↓
Backend → Resposta JSON {previewUrl: "/temp/arquivo.pdf", ...}
    ↓
Browser → Mostra preview do PDF
    ↓
Usuário → "Enviar por e-mail"
    ↓
Browser → POST /api/curriculo/enviar-curriculo {nomeArquivo, emailDestino}
    ↓
Backend → Verifica PDF → enviarCurriculo() → Envia e-mail SMTP
    ↓
Backend → Resposta {status: "success", ...}
```

### Fluxo 2: Auto-Apply (Automático)

```
Usuário → Dashboard → "Auto-Apply" 
    ↓
Frontend → POST /api/curriculo/auto-apply 
           {query: "react", tags: [...], minScore: 70, autoSend: true}
    ↓
Backend (autoApply.service.js):
    1. buscarVagas() → Obtém vagas das fontes
    2. calcularCompatibilidade() → Calcula score %
    3. filtra por minScore
    4. extrairDadosVaga() → Extrai dados estruturados
    5. se tem email e score ≥ minScore:
         personalizarCurriculo() → gerarPdfCurriculo()
         enviarCurriculo() → Envia e-mail
    ↓
Backend → Resposta JSON com estatísticas:
          {
            resumo: {
              total: 10,
              compatveis: 7,
              enviados: 5,
              semEmail: 3,
              erros: 0
            }
          }
```

### Fluxo 3: Scraping de Vagas

```
Scheduler → Node-Cron → executarBusca() a cada 1h
    ↓
autoApply.service.js → buscarVagas() 
    ↓
feed.service.js → HTTP GET para APIs:
                 • Jobicy API
                 • Remotive API
                 • Arbeitnow API
    ↓
Normaliza vagas → [{title, company, description, ...}]
    ↓
Retorna array de vagas para processamento
```

### Fluxo 4: Admin/Configurações

```
Usuário → /envia-curriculo/smtp-config
    ↓
GET /api/curriculo/config/smtp → Carrega config SMTP atual
    ↓
Usuário altera host/port/user/pass
    ↓
PUT /api/curriculo/config/smtp → updateSmtpConfig()
    ↓
Salva em ./data/smtp-config.json
    ↓
Próximo envio usa nova configuração
```

## 🔧 Tecnologias & Dependências

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                   │
├─────────────────────────────────────────────────────────────┤
│ Express.js      → Framework web                              │
│ Nodemailer      → Envio de e-mails SMTP                      │
│ PDFKit          → Geração de PDFs                            │
│ bcryptjs        → Hash de senhas                             │
│ node-cron       → Agendamento                              │
│ axios           → HTTP requests                              │
│ sqlite3         → Banco de dados                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                  │
├─────────────────────────────────────────────────────────────┤
│ HTML/CSS/Tailwind → Interface web moderna                    │
│ JavaScript        → Requisições API                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Pastas Final

```
src/
├── core/                 # Config, DB, server, logger
├── promo/                # Monitor de promoções (Telegram/WhatsApp)
│   ├── auth/             # Autenticação compartilhada
│   ├── telegram-config/  # Config API Telegram
│   └── ...
└── curriculos/           # Módulo de currículos
    ├── analisar/         # Extração e personalização
    │   ├── vagaExtractor.service.js
    │   ├── curriculoPersonalizador.service.js
    │   └── resumoProfissional.service.js
    ├── buscas/           # Busca de vagas
    │   ├── feed.service.js
    │   ├── scraperBR.service.js  <-- NOVO
    │   ├── autoApply.service.js  <-- CORRIGIDO
    │   └── match.service.js
    ├── scraper/          # Rotas de scraping
    │   └── scraper.routes.js     <-- NOVO
    ├── email/            # Envio de e-mails
    │   └── email.service.js
    ├── pdf/              # Geração PDF
    │   └── pdfGenerator.service.js
    ├── smtp/             # Config SMTP
    │   └── smtpConfig.service.js
    ├── middleware/       # Middlewares
    │   └── apiKeyAuth.js         <-- NOVO
    ├── public/           # Frontend HTML
    │   ├── index.html
    │   ├── login.html
    │   └── smtp-config.html
    └── config/           # Configurações
        └── index.js
```