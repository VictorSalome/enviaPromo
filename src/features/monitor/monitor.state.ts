// Estado global do monitor
let isRunning = false;
let monitorInterval: NodeJS.Timeout | null = null;

export function setRunningState(running: boolean): void {
  isRunning = running;
}

export function getMonitorStatus(): { running: boolean } {
  return { running: isRunning };
}

export function setMonitorInterval(interval: NodeJS.Timeout | null): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }
  monitorInterval = interval;
}
