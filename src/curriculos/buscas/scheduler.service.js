import cron from 'node-cron';
import { executarPipeline } from './autoApply.service.js';
import { logInfo, logError } from '../utils/logger.js';

let tarefaAtiva = null;
let ultimaExecucao = null;
let historico = [];

/**
 * Inicia o scheduler de busca automática
 * @param {Object} config
 * @param {string} config.cron - Expressão cron (default: a cada 6 horas)
 * @param {string[]} config.tags - Tags para buscar
 * @param {number} config.minScore - Score mínimo (default 70)
 * @param {boolean} config.autoSend - Enviar automaticamente (default false)
 */
export const iniciarScheduler = ({
  cron: cronExpr = '0 */6 * * *',
  tags = ['react', 'node', 'typescript', 'full stack'],
  minScore = 70,
  autoSend = false,
} = {}) => {
  if (tarefaAtiva) {
    logInfo('Scheduler já está rodando, parando anterior...');
    pararScheduler();
  }

  logInfo(`Iniciando scheduler: ${cronExpr} | tags: ${tags.join(',')} | minScore: ${minScore}`);

  tarefaAtiva = cron.schedule(cronExpr, async () => {
    await executarBusca({ tags, minScore, autoSend });
  });

  logInfo('Scheduler iniciado com sucesso');
  return { status: 'iniciado', cron: cronExpr, tags, minScore, autoSend };
};

/**
 * Para o scheduler
 */
export const pararScheduler = () => {
  if (tarefaAtiva) {
    tarefaAtiva.stop();
    tarefaAtiva = null;
    logInfo('Scheduler parado');
  }
  return { status: 'parado' };
};

/**
 * Executa uma busca manualmente
 */
export const executarBusca = async ({ tags, minScore = 70, autoSend = false } = {}) => {
  const startTime = Date.now();
  logInfo('Executando busca agendada...');

  try {
    const resultado = await executarPipeline({ tags, minScore, limit: 10, autoSend });
    const registro = {
      timestamp: new Date().toISOString(),
      duracao: `${Date.now() - startTime}ms`,
      total: resultado.resumo.total,
      compatveis: resultado.resumo.compatveis,
      enviados: resultado.resumo.enviados,
      gerados: resultado.resumo.gerados,
    };

    historico.push(registro);
    if (historico.length > 50) historico = historico.slice(-50);
    ultimaExecucao = registro;

    logInfo('Busca agendada concluída', registro);
    return resultado;
  } catch (err) {
    logError(`Erro na busca agendada: ${err.message}`);
    throw err;
  }
};

/**
 * Retorna status do scheduler
 */
export const getStatus = () => ({
  rodando: !!tarefaAtiva,
  ultimaExecucao,
  historico: historico.slice(-10),
});
