import express from 'express';
import { analisarPublicacaoController, statusController } from '../controllers/analisar-publicacao.controller.js';
import { visualizarCurriculoHTML, enviarCurriculoTesteHTML } from '../controllers/curriculo-teste.controller.js';
import { validateContentType, requestTimeout } from '../middleware/error-handler.js';
import { loggerMiddleware } from '../utils/logger.js';
import config from '../config/index.js';

const router = express.Router();

// Middleware específico para rotas da API
router.use(loggerMiddleware);
router.use(requestTimeout(config.server.requestTimeout));

/**
 * @route GET /status
 * @description Verificar status e saúde da API
 * @access Public
 */
router.get('/status', statusController);

/**
 * @route GET /health
 * @description Alias para verificação de saúde (para load balancers)
 * @access Public
 */
router.get('/health', statusController);

/**
 * @route POST /analisar-publicacao
 * @description Analisar publicação de vaga e gerar currículo personalizado
 * @access Public
 * @body {string} vaga - Texto completo da publicação da vaga
 */
router.post('/analisar-publicacao', 
  validateContentType(['application/json']),
  analisarPublicacaoController
);

/**
 * @route GET /curriculo-teste-html
 * @description Visualizar currículo formatado em HTML (normas ABNT)
 * @access Public
 */
router.get('/curriculo-teste-html', visualizarCurriculoHTML);

/**
 * @route POST /curriculo-teste-email
 * @description Enviar currículo formatado por e-mail para teste
 * @access Public
 */
router.post('/curriculo-teste-email',
  validateContentType(['application/json']),
  enviarCurriculoTesteHTML
);

/**
 * @route GET /
 * @description Rota raiz da API
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Currículo Automatizado API',
    version: '1.0.0',
    environment: config.server.env,
    endpoints: {
      status: 'GET /status',
      health: 'GET /health',
      analisarPublicacao: 'POST /analisar-publicacao',
      curriculoTesteHTML: 'GET /curriculo-teste-html',
      curriculoTesteEmail: 'POST /curriculo-teste-email'
    },
    documentation: {
      analisarPublicacao: {
        method: 'POST',
        endpoint: '/analisar-publicacao',
        contentType: 'application/json',
        body: {
          vaga: 'string (required) - Texto completo da publicação da vaga'
        },
        response: {
          status: 'string',
          vaga: 'string',
          emailDestino: 'string',
          curriculoGerado: 'string',
          mensagem: 'string',
          detalhes: 'object',
          email: 'object'
        }
      },
      curriculoTesteHTML: {
        method: 'GET',
        endpoint: '/curriculo-teste-html',
        description: 'Visualiza o currículo formatado em HTML seguindo normas ABNT',
        response: 'HTML formatado do currículo'
      },
      curriculoTesteEmail: {
        method: 'POST',
        endpoint: '/curriculo-teste-email',
        contentType: 'application/json',
        description: 'Envia currículo formatado por e-mail para teste',
        response: {
          sucesso: 'boolean',
          mensagem: 'string',
          detalhes: 'object'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;