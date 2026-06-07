import requests
import urllib.parse
from config import WHATSAPP_PHONE, CALLMEBOT_APIKEY
from utils.logger import log_info, log_error


def enviar_whatsapp(mensagem: str) -> bool:
    """
    Envia mensagem para o WhatsApp via CallMeBot.
    
    Args:
        mensagem: Texto a ser enviado
    
    Returns:
        True se enviado com sucesso, False caso contrário
    """
    if not WHATSAPP_PHONE or not CALLMEBOT_APIKEY:
        log_error('WHATSAPP_PHONE ou CALLMEBOT_APIKEY não configurados')
        return False
    
    try:
        texto_codificado = urllib.parse.quote(mensagem)
        url = f'https://api.callmebot.com/whatsapp.php?phone={WHATSAPP_PHONE}&apikey={CALLMEBOT_APIKEY}&text={texto_codificado}'
        
        resposta = requests.get(url, timeout=10)
        
        if resposta.ok:
            log_info(f'Mensagem enviada para WhatsApp: {mensagem[:50]}...')
            return True
        else:
            log_error(f'Erro ao enviar WhatsApp: {resposta.status_code}')
            return False
            
    except Exception as e:
        log_error(f'Exceção ao enviar WhatsApp: {str(e)}')
        return False
