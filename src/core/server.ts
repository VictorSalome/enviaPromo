import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import authRoutes from '../features/auth/auth.routes.js';

// Extensão do tipo Session para incluir user
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
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// API Routes
app.use('/api/auth', authRoutes);

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../public')));

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota para SPA (Single Page Application)
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/login', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/login.html'));
});
