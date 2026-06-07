import { Request, Response } from 'express';
import * as whatsappService from '../whatsapp/whatsapp.service.js';

export const testWhatsApp = async (_req: Request, res: Response): Promise<void> => {
  try {
    const success = await whatsappService.testConnection();
    if (success) {
      res.json({ success: true, message: 'Mensagem de teste enviada!' });
    } else {
      res.status(500).json({ success: false, message: 'Falha ao enviar mensagem de teste' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

export const sendManual = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: 'Mensagem é obrigatória' });
      return;
    }
    const success = await whatsappService.sendMessage(message);
    res.json({ success, message: success ? 'Enviado' : 'Falha' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};
