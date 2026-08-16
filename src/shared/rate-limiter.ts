/**
 * Rate Limiting System with Redis
 * ================================
 * 
 * Rate limiting global e por rota
 * - Global: 1000 req/min (proteção geral)
 * - Auth: 5 tentativas/15min (prevenção brute force)
 * - API: 100 req/min (proteção endpoints)
 * - Upload: 10 req/min
 * - Curriculo: 50 req/dia
 * 
 * Uso:
 * app.use('/api/curriculo', rateLimitConfig.api)
 * app.use('/auth/login', rateLimitConfig.auth)
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  headers: boolean;
  standardHeaders: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Armazenamento em memória (use Redis em produção)
const store: RateLimitStore = {};
const CLEANUP_INTERVAL = 60000; // 1 minuto

// Cleanup periódico
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Limitador genérico
 */
function rateLimiter(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.originalUrl}`;
    const now = Date.now();
    
    const windowMs = config.windowMs;
    
    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 1, resetTime: now + windowMs };
    } else {
      store[key].count += 1;
      
      if (store[key].count > config.max) {
        res.setHeader('X-RateLimit-Limit', String(config.max));
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', String(store[key].resetTime));
        
        res.status(429).json({
          success: false,
          message: config.message,
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        });
        return;
      }
    }
    
    // Headers de rate limiting
    if (config.headers) {
      res.setHeader('X-RateLimit-Limit', String(config.max));
      res.setHeader('X-RateLimit-Remaining', String(config.max - store[key].count));
      res.setHeader('X-RateLimit-Reset', String(store[key].resetTime));
    }
    
    next();
  };
}

// Configurações específicas
export const rateLimitConfig = {
  // Proteção geral - 1000 req/min
  global: rateLimiter({
    windowMs: 60000,
    max: 1000,
    message: 'Limite global de requisições excedido. Tente novamente em 1 minuto.',
    headers: true,
    standardHeaders: true,
  }),
  
  // Auth - prevenção brute force 5 tentativas/15min
  auth: rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    headers: true,
    standardHeaders: true,
  }),
  
  // API geral - 100 req/min
  api: rateLimiter({
    windowMs: 60000,
    max: 100,
    message: 'Limite de requisições por minuto excedido.',
    headers: true,
    standardHeaders: true,
  }),
  
  // Upload - 10 req/min
  upload: rateLimiter({
    windowMs: 60000,
    max: 10,
    message: 'Limite de uploads excedido. Tente novamente em 1 minuto.',
    headers: true,
    standardHeaders: true,
  }),
  
  // Curriculo - 50 req/dia
  curriculo: rateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 50,
    message: 'Limite diário de currículos excedido. Reset em 24 horas.',
    headers: true,
    standardHeaders: true,
  }),
  
  // WhatsApp - 20 req/min
  whatsapp: rateLimiter({
    windowMs: 60000,
    max: 20,
    message: 'Limite de mensagens WhatsApp excedido.',
    headers: true,
    standardHeaders: true,
  }),
  
  // Premium users - 500 req/min
  premium: rateLimiter({
    windowMs: 60000,
    max: 500,
    message: 'Limite excedido.',
    headers: true,
    standardHeaders: true,
  }),
};

/**
 * Rate limit com base no usuário (premium vs normal)
 */
export const userBasedRateLimit = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (user?.role === 'premium') {
      return rateLimitConfig.premium(req, res, next);
    }
    
    return rateLimitConfig.api(req, res, next);
  };
};

/**
 * Cache de estatísticas para reduzir carga no banco
 */
const statsCache = new Map<string, { data: any; timestamp: number }>();

export const cacheMiddleware = (ttlMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
    const cached = statsCache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < ttlMs) {
      res.json({
        success: true,
        fromCache: true,
        cachedAt: new Date(cached.timestamp).toISOString(),
        ...cached.data,
      });
      return;
    }
    
    // Intercepta a response para cachear
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      try {
        const data = typeof body === 'string' ? JSON.parse(body) : body;
        if (data.success) {
          statsCache.set(key, { data, timestamp: now });
        }
      } catch (e) {}
      return originalSend(body);
    };
    
    next();
  };
};

// Limpa cache periodicamente
setInterval(() => {
  const now = Date.now();
  for (const key of statsCache.keys()) {
    const cached = statsCache.get(key);
    if (cached && now - cached.timestamp > 60000) {
      statsCache.delete(key);
    }
  }
}, 60000);

export default rateLimitConfig;