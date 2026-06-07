import { Request, Response } from 'express';
import * as telegramConfigRepo from './telegram-config.repository.js';

export const getConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await telegramConfigRepo.getConfig();
    if (config) {
      // Oculta API_HASH parcial por segurança
      const safeConfig = {
        ...config,
        apiHash: config.apiHash ? `${config.apiHash.substring(0, 4)}****${config.apiHash.substring(config.apiHash.length - 4)}` : ''
      };
      res.json({ success: true, data: safeConfig });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar configuração' });
  }
};

export const saveConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, apiHash, phone } = req.body;
    
    if (!apiId || !apiHash) {
      res.status(400).json({ success: false, message: 'API_ID e API_HASH são obrigatórios' });
      return;
    }
    
    await telegramConfigRepo.saveConfig({ apiId, apiHash, phone });
    res.json({ success: true, message: 'Configuração salva com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao salvar configuração' });
  }
};

export const getStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await telegramConfigRepo.getConfig();
    res.json({ 
      success: true, 
      data: {
        isConfigured: !!(config?.apiId && config?.apiHash),
        isConnected: config?.isConnected ? true : false
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar status' });
  }
};
