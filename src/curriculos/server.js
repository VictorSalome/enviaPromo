import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import { initializeSmtpRuntimeConfig } from "./smtp/smtpConfig.service.js";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  timeoutMiddleware,
  contentTypeMiddleware,
} from "./middleware/errorHandler.js";
import { loggerMiddleware } from "./utils/logger.js";

import analisarRoutes from "./analisar/analisar.routes.js";
import testeRoutes from "./teste/teste.routes.js";
import smtpRoutes from "./smtp/smtp.routes.js";
import buscasRoutes from "./buscas/buscas.routes.js";

const app = express();

await initializeSmtpRuntimeConfig();

// Serve static files from public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
// Expose temporary files for preview during development
app.use("/temp", express.static(config.paths.temp));

// Rota explícita para servir o frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Middleware de request ID
app.use(requestIdMiddleware);

// Middleware de timeout
app.use(timeoutMiddleware(30000)); // 30 segundos

// Middlewares de segurança
if (config.server.env === "production") {
  app.use(helmet(config.security.helmet));
} else {
  // Dev: usar helmet sem CSP restritivo para permitir extensões
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
}

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Middleware de validação de Content-Type
app.use(
  contentTypeMiddleware([
    "application/json",
    "multipart/form-data",
    "application/x-www-form-urlencoded",
  ]),
);

// Middlewares de parsing
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({
          success: false,
          error: {
            message: "JSON inválido",
            status: 400,
          },
        });
        return;
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de logging
if (config.dev.logRequests) {
  app.use(loggerMiddleware);
}

// ── Feature routes ──
app.use(analisarRoutes);
app.use(testeRoutes);
app.use(smtpRoutes);
app.use('/buscar-vagas', buscasRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
