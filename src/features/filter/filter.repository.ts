import { getDb } from '../../core/database.js';

export const findAllCategories = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM categories ORDER BY sort_order');
};

export const findAllFilters = async () => {
  const db = await getDb();
  return db.all('SELECT * FROM filters ORDER BY created_at DESC');
};

export const findFiltersByCategory = async (categoryId: number) => {
  const db = await getDb();
  return db.all('SELECT * FROM filters WHERE category_id = ?', categoryId);
};

export const createCategory = async (category: any) => {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO categories (name, color, icon, sort_order) VALUES (?, ?, ?, ?)',
    category.name, category.color || '#3b82f6', category.icon || '📁', category.sortOrder || 0
  );
  return result.lastID;
};

export const createFilter = async (filter: any) => {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO filters (category_id, name, type, keywords) VALUES (?, ?, ?, ?)',
    filter.categoryId, filter.name, filter.type, JSON.stringify(filter.keywords)
  );
  return result.lastID;
};

export const toggleFilter = async (id: number) => {
  const db = await getDb();
  await db.run(
    'UPDATE filters SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?',
    id
  );
};

export const deleteFilter = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM filters WHERE id = ?', id);
};

export const deleteCategory = async (id: number) => {
  const db = await getDb();
  await db.run('DELETE FROM categories WHERE id = ?', id);
};

export const updateCategory = async (id: number, data: any) => {
  const db = await getDb();
  await db.run(
    "UPDATE categories SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?",
    data.name || null,
    data.color || null,
    id
  );
};

export const updateFilter = async (id: number, data: any) => {
  const db = await getDb();
  const keywords = data.keywords ? (Array.isArray(data.keywords) ? data.keywords.join(",") : data.keywords) : null;
  await db.run(
    "UPDATE filters SET name = COALESCE(?, name), type = COALESCE(?, type), keywords = COALESCE(?, keywords) WHERE id = ?",
    data.name || null,
    data.type || null,
    keywords,
    id
  );
};

export const toggleAllFilters = async (isActive: boolean) => {
  const db = await getDb();
  const value = isActive ? 1 : 0;
  await db.run("UPDATE filters SET is_active = ?", value);
};

export const getActiveFiltersCount = async () => {
  const db = await getDb();
  const result = await db.get("SELECT COUNT(*) as count FROM filters WHERE is_active = 1");
  return result?.count || 0;
};

export const getTotalFiltersCount = async () => {
  const db = await getDb();
  const result = await db.get("SELECT COUNT(*) as count FROM filters");
  return result?.count || 0;
};
