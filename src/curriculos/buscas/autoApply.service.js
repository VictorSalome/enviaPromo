import { buscarVagas } from './feed.service.js';
import { calcularCompatibilidade } from './match.service.js';
import { extrairDadosVaga } from '../analisar/vagaExtractor.service.js';
import { personalizarCurriculo } from '../analisar/curriculoPersonalizador.service.js';
import { gerarPdfCurriculo } from '../pdf/pdfGenerator.service.js';
import { enviarCurriculo } from '../email/email.service.js';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

/**
 * Pipeline completo: busca → match → gera currículo → envia email
 * @param {Object} params
 * @param {string} params.query - Palavras-chave
 * @param {string[]} params.tags - Tags de tecnologia
 * @param {number} params.minScore - Score mínimo para auto-apply (default 70)
 * @param {number} params.limit - Máximo de vagas por busca
 * @param {boolean} params.autoSend - Enviar automaticamente (default false)
 * @returns {Object} Resultado do pipeline
 */
export const executarPipeline = async ({
  query = '',
  tags = [],
  minScore = 70,
  limit = 10,
  autoSend = false,
} = {}) => {
  const startTime = Date.now();
  const resultados = { buscas: [], applied: [], skipped: [], erros: [] };

  logInfo('Iniciando pipeline auto-apply', { query, tags, minScore, autoSend });

  // 1. Buscar vagas
  const vagas = await buscarVagas({ query, tags, limit: Math.min(limit, 20) });
  logInfo(`Encontradas ${vagas.length} vagas brutas`);

  // 2. Para cada vaga, calcular match
  for (const vaga of vagas) {
    try {
      const match = calcularCompatibilidade(vaga);
      resultados.buscas.push({ title: vaga.title, company: vaga.company, score: match.score });

      if (match.score < minScore) {
        resultados.skipped.push({ title: vaga.title, company: vaga.company, score: match.score, reason: 'Score abaixo do mínimo' });
        continue;
      }

      // 3. Gerar currículo personalizado
      logInfo(`Gerando currículo para: ${vaga.title} @ ${vaga.company} (${match.score}%)`);

      const textoVaga = `${vaga.title}\n${vaga.company}\n${vaga.description}`;
      const dadosVaga = await extrairDadosVaga(textoVaga);
      const curriculo = await personalizarCurriculo(dadosVaga);
      const pdfPath = await gerarPdfCurriculo(curriculo, dadosVaga);
      const nomeArquivo = path.basename(pdfPath);

      const resultado = {
        title: vaga.title,
        company: vaga.company,
        score: match.score,
        matches: match.matches.map((m) => m.required),
        missing: match.missing,
        arquivo: nomeArquivo,
        url: vaga.url,
        email: dadosVaga.emailContato,
        status: 'curriculo_gerado',
      };

      // 4. Enviar email se autoSend=true e tiver email
      if (autoSend && dadosVaga.emailContato) {
        try {
          await enviarCurriculo({
            nomeArquivo,
            emailDestino: dadosVaga.emailContato,
            vagaTitulo: vaga.title,
          });
          resultado.status = 'enviado';
          logInfo(`Email enviado: ${vaga.title} → ${dadosVaga.emailContato}`);
        } catch (err) {
          resultado.status = 'erro_envio';
          resultado.erroEnvio = err.message;
          logError(`Erro ao enviar: ${err.message}`);
        }
      } else if (!dadosVaga.emailContato) {
        resultado.status = 'sem_email';
        logWarn(`Sem email na vaga: ${vaga.title}`);
      }

      resultados.applied.push(resultado);
    } catch (err) {
      logError(`Erro ao processar vaga "${vaga.title}": ${err.message}`);
      resultados.erros.push({ title: vaga.title, error: err.message });
    }
  }

  const totalTime = Date.now() - startTime;
  resultados.resumo = {
    total: vagas.length,
    compatveis: resultados.applied.length,
    enviados: resultados.applied.filter((a) => a.status === 'enviado').length,
    gerados: resultados.applied.filter((a) => a.status === 'curriculo_gerado').length,
    semEmail: resultados.applied.filter((a) => a.status === 'sem_email').length,
    erros: resultados.erros.length,
    tempoTotal: `${totalTime}ms`,
  };

  logInfo('Pipeline concluído', resultados.resumo);
  return resultados;
};
