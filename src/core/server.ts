import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

import authRoutes from '../features/auth/auth.routes.js';
import telegramConfigRoutes from '../features/telegram-config/telegram-config.routes.js';
import channelRoutes from '../features/channel/channel.routes.js';
import filterRoutes from '../features/filter/filter.routes.js';
import monitorRoutes from '../features/monitor/monitor.routes.js';
import whatsappRoutes from '../features/whatsapp/whatsapp.routes.js';
import statsRoutes from '../features/stats/stats.routes.js';
import backupRoutes from '../features/backup/backup.routes.js';
import testConnectionRoutes from '../features/test-connection/test-connection.routes.js';
import priceAlertRoutes from '../features/price-alert/price-alert.routes.js';
import deployRoutes from '../features/deploy/deploy.routes.js';

declare module 'express-session' {
  interface SessionData {
    user?: { username: string };
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/telegram-config', telegramConfigRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/test', testConnectionRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/price-alerts', priceAlertRoutes);

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../public')));

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota para SPA
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/login', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/login.html'));
});
