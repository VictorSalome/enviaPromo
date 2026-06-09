import { startTelegramMonitor, stopTelegramMonitor } from './monitor.telegram.js';
import { getMonitorStatus, setRunningState, setMonitorInterval } from './monitor.state.js';

export const startMonitor = async (): Promise<void> => {
  if (getMonitorStatus().running) {
    console.log('[Monitor] Monitor já está rodando');
    return;
  }
  
  setRunningState(true);
  console.log('[Monitor] Iniciando monitoramento real do Telegram...');
  
  // Iniciar imediatamente
  await startTelegramMonitor();
  
  // Agendar verificações periódicas (a cada 2 minutos)
  const interval = setInterval(async () => {
    if (getMonitorStatus().running) {
      await startTelegramMonitor();
    }
  }, 120000);
  
  setMonitorInterval(interval);
};

export const stopMonitor = async (): Promise<void> => {
  if (!getMonitorStatus().running) {
    console.log('[Monitor] Monitor já está parado');
    return;
  }
  
  setRunningState(false);
  setMonitorInterval(null);
  await stopTelegramMonitor();
  console.log('[Monitor] Monitor parado com sucesso');
};

export { getMonitorStatus };
