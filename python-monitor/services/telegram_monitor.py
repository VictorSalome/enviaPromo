import asyncio
from datetime import datetime
from telethon import TelegramClient, events
from config import API_ID, API_HASH, CANAL_ID, PALAVRAS_CHAVE, TEMPO_MINIMO_ENTRE_MENSAGENS
from services.whatsapp_sender import enviar_whatsapp
from utils.filtro import contem_palavra_chave
from utils.logger import log_info, log_error, log_debug


ultimo_envio = None


async def monitorar_canal():
    """
    Monitora o canal/grupo configurado e envia mensagens filtradas para o WhatsApp.
    """
    global ultimo_envio
    
    if not API_ID or not API_HASH:
        log_error('API_ID ou API_HASH não configurados. Obtenha em https://my.telegram.org/apps')
        return
    
    log_info(f'Iniciando monitoramento do canal: {CANAL_ID}')
    log_info(f'Palavras-chave ativas: {len(PALAVRAS_CHAVE)} termos configurados')
    
    client = TelegramClient('session', API_ID, API_HASH)
    
    await client.start()
    log_info('Conectado ao Telegram com sucesso!')
    
    @client.on(events.NewMessage(chats=CANAL_ID))
    async def handler(event):
        global ultimo_envio
        
        try:
            mensagem = event.message.text
            
            if not mensagem:
                log_debug('Mensagem sem texto, ignorando')
                return
            
            log_debug(f'Nova mensagem recebida: {mensagem[:100]}...')
            
            # Verifica se contém palavra-chave
            if not contem_palavra_chave(mensagem):
                log_debug('Mensagem não contém palavra-chave, ignorando')
                return
            
            # Verifica tempo mínimo entre envios
            agora = datetime.now()
            if ultimo_envio and (agora - ultimo_envio).seconds < TEMPO_MINIMO_ENTRE_MENSAGENS:
                log_debug(f'Muito cedo para enviar novamente. Aguarde {TEMPO_MINIMO_ENTRE_MENSAGENS}s')
                return
            
            # Envia para WhatsApp
            log_info(f'Palavra-chave detectada! Enviando para WhatsApp...')
            sucesso = enviar_whatsapp(mensagem)
            
            if sucesso:
                ultimo_envio = agora
                log_info('Mensagem enviada com sucesso!')
            else:
                log_error('Falha ao enviar mensagem para WhatsApp')
                
        except Exception as e:
            log_error(f'Erro no handler: {str(e)}')
    
    log_info('Monitoramento ativo! Aguardando mensagens...')
    log_info('Pressione Ctrl+C para parar')
    
    await client.run_until_disconnected()
