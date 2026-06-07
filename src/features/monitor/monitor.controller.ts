import { Request, Response } from 'express';
import * as monitorService from './monitor.service.js';

export const getStatus = async (_req: Request, res: Response): Promise<void> => {
  const status = monitorService.getMonitorStatus();
  res.json({ success: true, data: status });
};

export const start = async (_req: Request, res: Response): Promise<void> => {
  try {
    monitorService.startMonitor();
    res.json({ success: true, message: 'Monitor iniciado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao iniciar monitor' });
  }
};

export const stop = async (_req: Request, res: Response): Promise<void> => {
  try {
    monitorService.stopMonitor();
    res.json({ success: true, message: 'Monitor parado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao parar monitor' });
  }
};
