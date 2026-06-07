import os
from dotenv import load_dotenv

load_dotenv()

# Telegram API
API_ID = os.getenv('API_ID')
API_HASH = os.getenv('API_HASH')

# Lista de canais para monitorar (separados por vírgula no .env)
CANAIS_STR = os.getenv('CANAIS', '@urubupromo')
CANAIS = [canal.strip() for canal in CANAIS_STR.split(',') if canal.strip()]

# WhatsApp via CallMeBot
WHATSAPP_PHONE = os.getenv('WHATSAPP_PHONE')
CALLMEBOT_APIKEY = os.getenv('CALLMEBOT_APIKEY')

# Palavras-chave para filtro (em minúsculas)
PALAVRAS_CHAVE = [
    'placa de video',
    'placa de vídeo',
    'rtx',
    'rx',
    'gpu',
    'geforce',
    'radeon',
    '3060',
    '3070',
    '3080',
    '3090',
    '4060',
    '4070',
    '4080',
    '4090',
    '5060',
    '5070',
    '5080',
    '5090',
    '7600',
    '7700',
    '7800',
    '7900',
    'nvidia',
    'amd',
]

# Tempo mínimo entre mensagens (segundos) - evita spam
TEMPO_MINIMO_ENTRE_MENSAGENS = 30
