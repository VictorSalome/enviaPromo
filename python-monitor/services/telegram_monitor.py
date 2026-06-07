import asyncio
import os
from datetime import datetime
from telethon import TelegramClient, events
from config import API_ID, API_HASH, CANAIS, TEMPO_MINIMO_ENTRE_MENSAGENS
from services.whatsapp_sender import enviar_whatsapp
from utils.logger import log_info, log_error, log_debug


ultimo_envio = None


def limpar_sessao_corrompida():
    """Remove arquivos de sessão corrompidos"""
    for arquivo in ['session.session', 'session.session-journal']:
        if os.path.exists(arquivo):
            try:
                os.remove(arquivo)
                log_info(f'Arquivo {arquivo} removido')
            except Exception as e:
                log_error(f'Erro ao remover {arquivo}: {e}')


async def monitorar_canal():
    """
    Monitora os canais/grupos configurados e envia todas as mensagens para o WhatsApp.
    """
    global ultimo_envio
    
    if not API_ID or not API_HASH:
        log_error('API_ID ou API_HASH não configurados. Obtenha em https://my.telegram.org/apps')
        return
    
    log_info(f'Iniciando monitoramento de {len(CANAIS)} canais')
    for canal in CANAIS:
        log_info(f'  - {canal}')
    log_info('Modo: TODAS as mensagens serão enviadas (sem filtro)')
    
    # Limpa sessão corrompida se existir
    limpar_sessao_corrompida()
    
    client = TelegramClient('session', API_ID, API_HASH)
    
    try:
        await client.start()
        log_info('Conectado ao Telegram com sucesso!')
    except Exception as e:
        log_error(f'Erro ao conectar: {e}')
        log_info('Tentando limpar sessão e reconectar...')
        limpar_sessao_corrompida()
        return
    
    @client.on(events.NewMessage(chats=CANAIS))
    async def handler(event):
        global ultimo_envio
        
        try:
            mensagem = event.message.text
            
            if not mensagem:
                log_debug('Mensagem sem texto, ignorando')
                return
            
            chat = await event.get_chat()
            nome_canal = getattr(chat, 'title', 'Desconhecido')
            
            log_debug(f'[{nome_canal}] Nova mensagem: {mensagem[:100]}...')
            
            # Verifica tempo mínimo entre envios
            agora = datetime.now()
            if ultimo_envio and (agora - ultimo_envio).seconds < TEMPO_MINIMO_ENTRE_MENSAGENS:
                log_debug(f'Muito cedo para enviar novamente. Aguarde {TEMPO_MINIMO_ENTRE_MENSAGENS}s')
                return
            
            # Adiciona nome do canal na mensagem
            mensagem_formatada = f"📢 *{nome_canal}*\n\n{mensagem}"
            
            # Envia para WhatsApp
            log_info(f'Enviando mensagem para WhatsApp...')
            sucesso = enviar_whatsapp(mensagem_formatada)
            
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
