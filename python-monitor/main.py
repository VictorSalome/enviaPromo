#!/usr/bin/env python3
"""
Monitor de Canal do Telegram para WhatsApp
Monitora um canal/grupo privado e envia mensagens filtradas para o WhatsApp.
"""

import asyncio
import sys
from services.telegram_monitor import monitorar_canal
from utils.logger import log_info, log_error


def main():
    """Função principal"""
    log_info('=== Monitor de Canal Telegram ===')
    log_info('Iniciando aplicação...')
    
    try:
        asyncio.run(monitorar_canal())
    except KeyboardInterrupt:
        log_info('Aplicação encerrada pelo usuário')
        sys.exit(0)
    except Exception as e:
        log_error(f'Erro fatal: {str(e)}')
        sys.exit(1)


if __name__ == '__main__':
    main()
