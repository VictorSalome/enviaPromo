from config import PALAVRAS_CHAVE
from utils.logger import log_debug


def contem_palavra_chave(texto: str) -> bool:
    """
    Verifica se o texto contém alguma das palavras-chave configuradas.
    
    Args:
        texto: Texto da mensagem a ser verificado
    
    Returns:
        True se contém pelo menos uma palavra-chave, False caso contrário
    """
    texto_minusculo = texto.lower()
    
    for termo in PALAVRAS_CHAVE:
        if termo in texto_minusculo:
            log_debug(f'Palavra-chave encontrada: "{termo}"')
            return True
    
    return False
