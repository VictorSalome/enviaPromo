import { app } from './core/server.js';
import { config } from './core/config.js';
import './core/database.js';
import * as logger from './core/logger.js';

const startServer = (): void => {
  try {
    app.listen(config.PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${config.PORT}`, 'Server');
      logger.info(`📊 Ambiente: ${config.NODE_ENV}`, 'Server');
      logger.info(`💾 Banco: ${config.DATABASE_PATH}`, 'Server');
    });
  } catch (err) {
    logger.error(`Falha ao iniciar servidor: ${err}`, 'Server');
    process.exit(1);
  }
};

startServer();
