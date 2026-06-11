import { Request, Response } from 'express';
import * as filterRepo from './filter.repository.js';

export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await filterRepo.findAllCategories();
    const filters = await filterRepo.findAllFilters();
    
    // Agrupa filtros por categoria
    const categoriesWithFilters = categories.map((cat: any) => ({
      ...cat,
      filters: filters.filter((f: any) => f.category_id === cat.id)
    }));
    
    res.json({ success: true, data: categoriesWithFilters });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar filtros' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, color, icon } = req.body;
    const id = await filterRepo.createCategory({ name, color, icon });
    res.json({ success: true, message: 'Categoria criada', data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar categoria' });
  }
};

export const createFilter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, name, type, keywords } = req.body;
    
    if (!categoryId || !name || !keywords) {
      res.status(400).json({ success: false, message: 'Dados inválidos' });
      return;
    }
    
    const keywordsStr = Array.isArray(keywords) ? keywords.join(',') : keywords;
    const id = await filterRepo.createFilter({ categoryId, name, type: type || 'broad', keywords: keywordsStr });
    res.json({ success: true, message: 'Filtro criado', data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar filtro' });
  }
};

export const toggle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await filterRepo.toggleFilter(id);
    res.json({ success: true, message: 'Status alterado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao alterar status' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await filterRepo.deleteFilter(id);
    res.json({ success: true, message: 'Filtro removido' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao remover filtro' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, color } = req.body;
    await filterRepo.updateCategory(id, { name, color });
    res.json({ success: true, message: 'Categoria atualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar categoria' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await filterRepo.deleteCategory(id);
    res.json({ success: true, message: 'Categoria removida' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao remover categoria' });
  }
};

export const updateFilter = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, type, keywords } = req.body;
    await filterRepo.updateFilter(id, { name, type, keywords });
    res.json({ success: true, message: 'Filtro atualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar filtro' });
  }
};
