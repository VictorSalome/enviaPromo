import { buscarVagas, buscarVagaFonte, getFontes } from './feed.service.js';
import { ranquearVagas } from './match.service.js';
import { executarPipeline } from './autoApply.service.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * GET /buscar-vagas
 * Lista fontes disponíveis
 */
export const listarFontesController = (req, res) => {
  res.json({ ok: true, fontes: getFontes() });
};

/**
 * POST /buscar-vagas
 * Busca vagas em todas as fontes e retorna ranqueadas
 */
export const buscarVagasController = async (req, res) => {
  try {
    const { query, tags, limit } = req.body || {};

    logInfo(`Busca recebida: query="${query || ''}" tags=${(tags || []).join(',')}`);

    const vagas = await buscarVagas({
      query: query || '',
      tags: tags || [],
      limit: Math.min(limit || 10, 20),
    });

    const ranqueadas = ranquearVagas(vagas);

    res.json({
      ok: true,
      total: ranqueadas.length,
      vagas: ranqueadas,
    });
  } catch (err) {
    logError(`Erro na busca de vagas: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * POST /buscar-vagas/fonte
 * Busca vagas de uma fonte específica
 */
export const buscarPorFonteController = async (req, res) => {
  try {
    const { fonte } = req.params;
    const { query, tags, limit } = req.body || {};

    const vagas = await buscarVagaFonte(fonte, {
      query: query || '',
      tags: tags || [],
      limit: Math.min(limit || 10, 20),
    });

    const ranqueadas = ranquearVagas(vagas);

    res.json({
      ok: true,
      fonte,
      total: ranqueadas.length,
      vagas: ranqueadas,
    });
  } catch (err) {
    logError(`Erro na busca por fonte: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * POST /buscar-vagas/auto-apply
 * Pipeline completo: busca → match → gera currículo → envia
 */
export const autoApplyController = async (req, res) => {
  try {
    const { query, tags, minScore, limit, autoSend } = req.body || {};

    logInfo(`Auto-apply iniciado: minScore=${minScore || 70} autoSend=${autoSend || false}`);

    const resultado = await executarPipeline({
      query: query || '',
      tags: tags || [],
      minScore: minScore || 70,
      limit: Math.min(limit || 10, 20),
      autoSend: autoSend || false,
    });

    res.json({ ok: true, ...resultado });
  } catch (err) {
    logError(`Erro no auto-apply: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
};
