import fetch from 'node-fetch';
import { config } from '../../core/config.js';
import * as logger from '../../core/logger.js';

export const sendMessage = async (message: string): Promise<boolean> => {
  try {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${config.WHATSAPP_PHONE}&apikey=${config.CALLMEBOT_APIKEY}&text=${encodedMessage}`;
    
    const response = await fetch(url);
    
    if (response.ok) {
      logger.info('Mensagem enviada para WhatsApp!', 'WhatsApp');
      return true;
    } else {
      logger.error(`Falha ao enviar WhatsApp: ${response.status}`, 'WhatsApp');
      return false;
    }
  } catch (err) {
    logger.error(`Erro ao enviar WhatsApp: ${err}`, 'WhatsApp');
    return false;
  }
};

export const testConnection = async (): Promise<boolean> => {
  return sendMessage('🧪 Teste de conexão do Promo Monitor!');
};
