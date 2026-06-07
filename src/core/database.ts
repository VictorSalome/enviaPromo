import Database from 'better-sqlite3';
import { config } from './config.js';
import * as logger from './logger.js';
import fs from 'fs';
import path from 'path';

const dbDir = path.dirname(config.DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.DATABASE_PATH);
db.pragma('journal_mode = WAL');

const createTables = (): void => {
  logger.info('Criando tabelas do banco de dados...', 'Database');

  db.exec(`
    CREATE TABLE IF NOT EXISTS telegram_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      api_id TEXT,
      api_hash TEXT,
      phone TEXT,
      session_string TEXT,
      is_connected INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      icon TEXT DEFAULT '📁',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS filters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('broad', 'specific')) DEFAULT 'broad',
      keywords TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      match_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sent_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link TEXT,
      product TEXT,
      price REAL,
      store TEXT,
      channel TEXT NOT NULL,
      message_text TEXT NOT NULL,
      matched_filters TEXT,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      target_price REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT CHECK(level IN ('info', 'warn', 'error')) DEFAULT 'info',
      message TEXT NOT NULL,
      feature TEXT,
      data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  logger.info('Tabelas criadas com sucesso!', 'Database');
};

const createIndexes = (): void => {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sent_link ON sent_messages(link);
    CREATE INDEX IF NOT EXISTS idx_sent_product ON sent_messages(product);
    CREATE INDEX IF NOT EXISTS idx_sent_time ON sent_messages(sent_at);
    CREATE INDEX IF NOT EXISTS idx_filters_category ON filters(category_id);
    CREATE INDEX IF NOT EXISTS idx_filters_active ON filters(is_active);
    CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);
  `);
};

export const initDatabase = (): void => {
  try {
    createTables();
    createIndexes();
    logger.info('Banco de dados inicializado!', 'Database');
  } catch (err) {
    logger.error(`Erro ao inicializar banco: ${err}`, 'Database');
    throw err;
  }
};

export const seedDatabase = (): void => {
  logger.info('Verificando seed...', 'Database');

  const configCount = db.prepare('SELECT COUNT(*) as count FROM telegram_config').get() as { count: number };
  if (configCount.count === 0) {
    logger.info('Inserindo configuração inicial...', 'Database');
    db.prepare(`
      INSERT INTO telegram_config (id, api_id, api_hash, phone, is_connected)
      VALUES (1, '', '', '', 0)
    `).run();
  }

  const channelCount = db.prepare('SELECT COUNT(*) as count FROM channels').get() as { count: number };
  if (channelCount.count === 0) {
    logger.info('Inserindo canais padrão...', 'Database');
    const channels = [
      '@urubupromo',
      '@ofertasgamer_oficial',
      '@LaPromotion',
      '@mpromotech',
      '@ofertasthautec',
      '@iuriindica',
      '@pcdorafa'
    ];

    const stmt = db.prepare('INSERT INTO channels (username, is_active) VALUES (?, 1)');
    for (const channel of channels) {
      try {
        stmt.run(channel);
      } catch {
        // Ignora duplicatas
      }
    }
  }

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    logger.info('Inserindo categorias e filtros padrão...', 'Database');

    const categories = [
      { name: '📱 Celulares', color: '#3b82f6', icon: '📱' },
      { name: '🎮 Hardware', color: '#ef4444', icon: '🎮' }
    ];

    const catStmt = db.prepare('INSERT INTO categories (name, color, icon, sort_order) VALUES (?, ?, ?, ?)');
    const celularesId = Number(catStmt.run(categories[0].name, categories[0].color, categories[0].icon, 0).lastInsertRowid);
    const hardwareId = Number(catStmt.run(categories[1].name, categories[1].color, categories[1].icon, 1).lastInsertRowid);

    const filters = [
      { categoryId: celularesId, name: 'Galaxy', type: 'broad', keywords: JSON.stringify(['galaxy', 'samsung', 's24', 's25', 'tab', 'watch']) },
      { categoryId: celularesId, name: 'Galaxy S22', type: 'specific', keywords: JSON.stringify(['galaxy s22', 's22 ultra', 's22 plus']) },
      { categoryId: celularesId, name: 'iPhone', type: 'broad', keywords: JSON.stringify(['iphone', 'apple', 'ios']) },
      { categoryId: hardwareId, name: 'RTX', type: 'broad', keywords: JSON.stringify(['rtx', 'nvidia', 'geforce']) },
      { categoryId: hardwareId, name: 'RTX 4060', type: 'specific', keywords: JSON.stringify(['rtx 4060', '4060 ti']) },
      { categoryId: hardwareId, name: 'AMD RX', type: 'broad', keywords: JSON.stringify(['rx', 'radeon', 'amd']) }
    ];

    const filterStmt = db.prepare('INSERT INTO filters (category_id, name, type, keywords) VALUES (?, ?, ?, ?)');
    for (const filter of filters) {
      filterStmt.run(filter.categoryId, filter.name, filter.type, filter.keywords);
    }
  }

  logger.info('Seed concluído!', 'Database');
};

initDatabase();
seedDatabase();
