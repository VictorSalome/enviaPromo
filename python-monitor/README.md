# Monitor de Canal do Telegram

Monitora um canal ou grupo privado do Telegram e envia mensagens filtradas por palavras-chave para o WhatsApp via CallMeBot.

## Diferença do Bot na Vercel

Este script Python usa sua **própria conta do Telegram** (Userbot) para monitorar canais, enquanto o bot na Vercel só funciona em grupos onde ele é administrador.

## Requisitos

- Python 3.8+
- Conta do Telegram
- API ID e Hash do Telegram (obter em https://my.telegram.org/apps)

## Instalação

```bash
cd python-monitor
pip install -r requirements.txt
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Obtenha suas credenciais do Telegram:
   - Acesse https://my.telegram.org/apps
   - Faça login com seu número
   - Crie um novo aplicativo
   - Copie o **API ID** e **API Hash**

3. Edite o arquivo `.env`:
```env
API_ID=123456789
API_HASH=seu_api_hash_aqui
CANAL_ID=@canal_promocoes

WHATSAPP_PHONE=5511987319331
CALLMEBOT_APIKEY=2359872
```

**Nota:** O `CANAL_ID` pode ser:
- Username do canal: `@canal_promocoes`
- ID numérico: `-1001234567890` (canais começam com `-100`)

## Uso

```bash
python main.py
```

Na primeira execução, o Telegram pedirá:
1. Seu número de telefone
2. Código de verificação enviado ao Telegram

Após autenticar, um arquivo `session.session` será criado para manter a sessão.

## Estrutura do Projeto

```
python-monitor/
├── config/
│   ├── __init__.py
│   └── settings.py          # Configurações e variáveis de ambiente
├── services/
│   ├── __init__.py
│   ├── telegram_monitor.py  # Monitoramento do canal
│   └── whatsapp_sender.py   # Envio para WhatsApp
├── utils/
│   ├── __init__.py
│   ├── filtro.py            # Filtro de palavras-chave
│   └── logger.py            # Logs da aplicação
├── main.py                  # Ponto de entrada
├── requirements.txt         # Dependências Python
└── .env.example            # Exemplo de configuração
```

## Palavras-chave Configuradas

Edite `config/settings.py` para adicionar/remover palavras-chave:

```python
PALAVRAS_CHAVE = [
    'placa de video',
    'rtx',
    'rx',
    'gpu',
    '4060',
    '4070',
    # ... adicione mais
]
```

## Hospedagem

Este script precisa rodar continuamente. Opções:

### Opção 1: Seu próprio computador
```bash
python main.py
```

### Opção 2: VPS (DigitalOcean, AWS, etc)
```bash
# Use screen ou tmux para manter rodando
screen -S monitor
python main.py
# Ctrl+A, D para sair
```

### Opção 3: Railway.app
1. Crie um projeto no Railway
2. Conecte seu repositório
3. Configure as variáveis de ambiente
4. Deploy automático

### Opção 4: Render.com
1. Crie um Web Service
2. Configure o comando: `python main.py`
3. Adicione as variáveis de ambiente

## Limitações

- A sessão pode expirar após muito tempo sem uso
- Se o Telegram detectar uso automatizado excessivo, pode pedir verificação novamente
- Não funciona em modo sleep (computador desligado)

## Segurança

- **NUNCA** compartilhe seu `API_ID`, `API_HASH` ou arquivo `.env`
- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `session.session` contém suas credenciais, mantenha seguro
