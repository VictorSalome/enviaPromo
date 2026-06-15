import { Request, Response } from 'express';
import { startMonitor, stopMonitor, getMonitorStatus } from './monitor.service.js';
import { startTelegramMonitor } from './monitor.telegram.js';
import { getConnectionStatus } from './monitor.state.js';
import { sendTelegramMessage } from '../telegram-bot/bot.service.js';

export const getStatus = async (_req: Request, res: Response): Promise<void> => {
  const status = getMonitorStatus();
  res.json({ success: true, data: status });
};

export const getConnectionStatusEndpoint = async (_req: Request, res: Response): Promise<void> => {
  const status = getConnectionStatus();
  res.json({ success: true, data: status });
};

export const testConnection = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sent = await sendTelegramMessage(
      '🚀 *Promo Monitor* — Teste de Conexão\n\n' +
      '🤖 Bot Telegram funcionando!\n' +
      `🕐 ${new Date().toLocaleString('pt-BR')}\n\n` +
      '_Conexão verificada com sucesso._'
    );

    if (sent) {
      res.json({ success: true, message: 'Mensagem enviada ao grupo de teste!' });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mensagem. Verifique TELEGRAM_BOT_TOKEN e TELEGRAM_BOT_GROUP_ID no .env',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao testar conexão' });
  }
};

export const start = async (_req: Request, res: Response): Promise<void> => {
  try {
    await startMonitor();
    res.json({ success: true, message: 'Monitor iniciado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao iniciar monitor' });
  }
};

export const stop = async (_req: Request, res: Response): Promise<void> => {
  try {
    await stopMonitor();
    res.json({ success: true, message: 'Monitor parado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao parar monitor' });
  }
};

export const forceCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    await startTelegramMonitor();
    res.json({ success: true, message: 'Verificação forçada concluída' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro na verificação' });
  }
};
