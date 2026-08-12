import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

import authRoutes from '../promo/auth/auth.routes.js';
import telegramConfigRoutes from '../promo/telegram-config/telegram-config.routes.js';
import channelRoutes from '../promo/channel/channel.routes.js';
import filterRoutes from '../promo/filter/filter.routes.js';
import monitorRoutes from '../promo/monitor/monitor.routes.js';
import discordRoutes from '../promo/discord/discord.routes.js';
import statsRoutes from '../promo/stats/stats.routes.js';
import backupRoutes from '../promo/backup/backup.routes.js';
import testConnectionRoutes from '../promo/test-connection/test-connection.routes.js';
import priceAlertRoutes from '../promo/price-alert/price-alert.routes.js';
import deployRoutes from '../promo/deploy/deploy.routes.js';
// @ts-ignore
import resumesApp from '../curriculos/server.js';
import { requireAuth } from '../promo/auth/auth.middleware.js';

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
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/telegram-config', telegramConfigRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/test', testConnectionRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/price-alerts', priceAlertRoutes);

// ── Health check ──
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Curriculo API ──
app.use('/api/curriculo', requireAuth, resumesApp);

// ── Root static (CSS/JS only, sem index) ──
app.use(express.static(path.join(__dirname, '../../public'), { index: false }));

// ── Promo frontend ──
app.use('/envia-promo', express.static(path.join(__dirname, '../../public')));
app.get('/envia-promo', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});
app.get('/envia-promo/login', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/login.html'));
});

// ── Curriculo frontend ──
const curriculoPublic = path.join(__dirname, '../curriculos/public');
const requireAuthRedirect = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (req.session.user) { next(); } else { res.redirect('/envia-curriculo/login'); }
};
app.get('/envia-curriculo/login', (_, res) => {
  res.sendFile(path.join(curriculoPublic, 'login.html'));
});
app.use('/envia-curriculo', requireAuthRedirect, express.static(curriculoPublic));
app.get('/envia-curriculo', requireAuthRedirect, (_, res) => {
  res.sendFile(path.join(curriculoPublic, 'index.html'));
});
app.get('/envia-curriculo/smtp-config', requireAuthRedirect, (_, res) => {
  res.sendFile(path.join(curriculoPublic, 'smtp-config.html'));
});

// ── Root redirect ──
app.get('/', (_, res) => res.redirect('/envia-promo'));
app.get('/login', (_, res) => res.redirect('/envia-promo/login'));
