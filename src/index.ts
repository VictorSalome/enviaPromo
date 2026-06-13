// Handlers de erro global para evitar crash em erros n00e3o tratados (ex: timeout do Telegram)
process.on('unhandledRejection', (reason, _promise) => {
  console.error('[Unhandled Rejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

import { app } from './core/server.js';
import { config } from './core/config.js';
import { initDb } from './core/database.js';
import * as logger from './core/logger.js';

const startServer = async (): Promise<void> => {
  try {
    // Inicializa banco de dados (cria tabelas e seed)
    await initDb();

    app.listen(config.PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${config.PORT}`, 'Server');
      logger.info(`📊 Ambiente: ${config.NODE_ENV}`, 'Server');
      logger.info(`💾 Banco: ${config.DATABASE_PATH}`, 'Server');
      logger.info(`👤 Admin: ${config.ADMIN_USERNAME}`, 'Server');
    });
  } catch (err) {
    logger.error(`Falha ao iniciar servidor: ${err}`, 'Server');
    process.exit(1);
  }
};

startServer();
