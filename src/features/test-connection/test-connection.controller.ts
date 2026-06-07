import { Request, Response } from 'express';
import * as telegramConfigRepo from '../telegram-config/telegram-config.repository.js';

export const testTelegram = async (_req: Request, res: Response): Promise<void> => {
  try {
    const telegramConfig = await telegramConfigRepo.getConfig();
    
    if (!telegramConfig?.apiId || !telegramConfig?.apiHash) {
      res.status(400).json({ 
        success: false, 
        message: 'API_ID e API_HASH não configurados' 
      });
      return;
    }
    
    // Aqui faria teste real de conexão MTProto
    // Por enquanto simula sucesso
    res.json({ 
      success: true, 
      message: 'Configuração encontrada. Use o monitor para testar conexão real.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao testar Telegram' });
  }
};

export const testFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ success: false, message: 'Texto é obrigatório' });
      return;
    }
    
    // Simulação - em produção usaria filter.service.ts
    const matches = [];
    if (text.toLowerCase().includes('galaxy')) matches.push('Galaxy');
    if (text.toLowerCase().includes('rtx')) matches.push('RTX');
    if (text.toLowerCase().includes('iphone')) matches.push('iPhone');
    
    res.json({ 
      success: true, 
      data: { 
        text, 
        matches, 
        wouldSend: matches.length > 0 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao testar filtros' });
  }
};
