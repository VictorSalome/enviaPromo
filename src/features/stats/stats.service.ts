import { getDb } from '../../core/database.js';

export const getStats = async (): Promise<any> => {
  const db = await getDb();
  
  const today = await db.get(`
    SELECT COUNT(*) as count FROM sent_messages 
    WHERE date(sent_at) = date('now')
  `);
  
  const week = await db.get(`
    SELECT COUNT(*) as count FROM sent_messages 
    WHERE sent_at > datetime('now', '-7 days')
  `);
  
  const month = await db.get(`
    SELECT COUNT(*) as count FROM sent_messages 
    WHERE sent_at > datetime('now', '-30 days')
  `);
  
  const channels = await db.get('SELECT COUNT(*) as count FROM channels WHERE is_active = 1');
  const filters = await db.get('SELECT COUNT(*) as count FROM filters WHERE is_active = 1');
  
  return {
    today: today.count,
    week: week.count,
    month: month.count,
    activeChannels: channels.count,
    activeFilters: filters.count
  };
};

export const getByChannel = async (): Promise<any[]> => {
  const db = await getDb();
  return db.all(`
    SELECT channel, COUNT(*) as count 
    FROM sent_messages 
    WHERE sent_at > datetime('now', '-7 days')
    GROUP BY channel
    ORDER BY count DESC
  `);
};

export const getByFilter = async (): Promise<any[]> => {
  const db = await getDb();
  return db.all(`
    SELECT json_each.value as filter_name, COUNT(*) as count
    FROM sent_messages, json_each(matched_filters)
    WHERE sent_at > datetime('now', '-7 days')
    GROUP BY filter_name
    ORDER BY count DESC
  `);
};
