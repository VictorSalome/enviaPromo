import { Request, Response } from 'express';
import * as authService from './auth.service.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username e password são obrigatórios' });
      return;
    }

    const result = await authService.login({ username, password });

    if (result.success) {
      req.session.user = result.user;
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
};

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Erro ao fazer logout' });
      return;
    }
    res.json(authService.logout());
  });
};

export const me = (req: Request, res: Response): void => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Não autenticado' });
  }
};
