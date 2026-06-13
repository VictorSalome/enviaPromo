import { Request, Response } from 'express';
import { getDb } from '../../core/database.js';

export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await getDb();
    const alerts = await db.all('SELECT * FROM price_alerts WHERE is_active = 1');
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar alertas' });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, targetPrice } = req.body;
    
    if (!productName || !targetPrice) {
      res.status(400).json({ success: false, message: 'Nome do produto e preço alvo são obrigatórios' });
      return;
    }
    
    const db = await getDb();
    
    // Verificar se já existe alerta para o mesmo produto+preço
    const existing = await db.get(
      'SELECT * FROM price_alerts WHERE product_name = ? AND target_price = ? AND is_active = 1',
      productName, targetPrice
    );
    if (existing) {
      res.status(409).json({ success: false, message: 'Já existe um alerta para este produto com este preço' });
      return;
    }
    
    const result = await db.run(
      'INSERT INTO price_alerts (product_name, target_price) VALUES (?, ?)',
      productName, targetPrice
    );
    res.json({ success: true, message: 'Alerta criado', data: { id: result.lastID } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar alerta' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.run('DELETE FROM price_alerts WHERE id = ?', id);
    res.json({ success: true, message: 'Alerta removido' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao remover alerta' });
  }
};
