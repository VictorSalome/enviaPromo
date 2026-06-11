import { TelegramConfig } from './telegram-config.types.js';
import { getDb } from '../../core/database.js';

export const getConfig = async (): Promise<TelegramConfig | null | undefined> => {
  const db = await getDb();
  const row = await db.get('SELECT * FROM telegram_config WHERE id = 1');
  
  if (!row) return null;
  
  // Map snake_case columns to camelCase
  return {
    id: row.id,
    apiId: row.api_id,
    apiHash: row.api_hash,
    phone: row.phone,
    sessionString: row.session_string,
    isConnected: !!row.is_connected,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const saveConfig = async (config: Partial<TelegramConfig>): Promise<void> => {
  const db = await getDb();
  const existing = await getConfig();
  
  if (existing && existing.id) {
    await db.run(
      `UPDATE telegram_config 
       SET api_id = COALESCE(?, api_id),
           api_hash = COALESCE(?, api_hash),
           phone = COALESCE(?, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      config.apiId || null,
      config.apiHash || null,
      config.phone || null
    );
  } else {
    await db.run(
      `INSERT INTO telegram_config (id, api_id, api_hash, phone, is_connected)
       VALUES (1, ?, ?, ?, 0)`,
      config.apiId || '',
      config.apiHash || '',
      config.phone || ''
    );
  }
};

export const updateSession = async (sessionString: string, isConnected: boolean): Promise<void> => {
  const db = await getDb();
  await db.run(
    'UPDATE telegram_config SET session_string = ?, is_connected = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    sessionString,
    isConnected ? 1 : 0
  );
};
