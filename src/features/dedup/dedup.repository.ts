import { getDb } from '../../core/database.js';

export const addSentMessage = async (data: {
  link?: string;
  product?: string;
  price?: number;
  store?: string;
  channel: string;
  messageText: string;
  matchedFilters: string[];
}): Promise<void> => {
  const db = await getDb();
  await db.run(
    `INSERT INTO sent_messages (link, product, price, store, channel, message_text, matched_filters)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.link || null,
    data.product || null,
    data.price || null,
    data.store || null,
    data.channel,
    data.messageText,
    JSON.stringify(data.matchedFilters)
  );
};

export const isDuplicate = async (link?: string, product?: string, price?: number, minutes: number = 30): Promise<boolean> => {
  const db = await getDb();
  
  if (link) {
    const existing = await db.get(
      `SELECT * FROM sent_messages 
       WHERE link = ? 
       AND price = ?
       AND sent_at > datetime('now', '-${minutes} minutes')`,
      link, price || 0
    );
    if (existing) return true;
  }
  
  if (product) {
    const existing = await db.get(
      `SELECT * FROM sent_messages 
       WHERE product = ? 
       AND price = ?
       AND sent_at > datetime('now', '-${minutes} minutes')`,
      product, price || 0
    );
    if (existing) return true;
  }
  
  return false;
};

export const getRecentMessages = async (limit: number = 50): Promise<any[]> => {
  const db = await getDb();
  return db.all(
    'SELECT * FROM sent_messages ORDER BY sent_at DESC LIMIT ?',
    limit
  );
};
