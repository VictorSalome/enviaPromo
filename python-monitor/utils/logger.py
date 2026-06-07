from datetime import datetime


def log_info(mensagem: str):
    """Log de informação"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] [INFO] {mensagem}')


def log_error(mensagem: str):
    """Log de erro"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] [ERRO] {mensagem}')


def log_debug(mensagem: str):
    """Log de debug"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] [DEBUG] {mensagem}')
