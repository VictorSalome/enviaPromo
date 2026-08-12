import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Acesso negado. Faça login.' });
  }
};

export const optionalAuth = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
