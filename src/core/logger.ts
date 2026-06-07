import { Log } from './types.js';

const now = (): string => {
  const d = new Date();
  return d.toISOString().replace('T', ' ').slice(0, 19);
};

export const info = (message: string, feature?: string): void => {
  console.log(`[${now()}] [INFO] ${feature ? `[${feature}] ` : ''}${message}`);
};

export const warn = (message: string, feature?: string): void => {
  console.log(`[${now()}] [WARN] ${feature ? `[${feature}] ` : ''}${message}`);
};

export const error = (message: string, feature?: string): void => {
  console.error(`[${now()}] [ERRO] ${feature ? `[${feature}] ` : ''}${message}`);
};

export const debug = (message: string, feature?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${now()}] [DEBUG] ${feature ? `[${feature}] ` : ''}${message}`);
  }
};
