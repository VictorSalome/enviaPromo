import { buscarVagas } from "./feed.service.js";
import { calcularCompatibilidade } from "./match.service.js";
import { extrairDadosVaga } from "../analisar/vagaExtractor.service.js";
import { personalizarCurriculo } from "../analisar/curriculoPersonalizador.service.js";
import { gerarPdfCurriculo } from "../pdf/pdfGenerator.service.js";
import { enviarCurriculo } from "../email/email.service.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";
import path from "path";

/**
 * Pipeline: busca → match → gera currículo → envia email (se tiver email)
 */
export const executarPipeline = async ({
  query = "",
  tags = [],
  minScore = 60,
  limit = 10,
  autoSend = true,
} = {}) => {
  const startTime = Date.now();
  const resultados = {
    buscas: [],
    applied: [],
    skipped: [],
    erros: [],
    stats: { gerados: 0, enviados: 0, semEmail: 0, erroEnvio: 0 },
  };

  logInfo("Iniciando pipeline auto-apply", {
    tags: tags.join(","),
    minScore,
    autoSend,
  });

  // 1. Buscar vagas
  const vagas = await buscarVagas({ query, tags, limit: Math.min(limit, 20) });
  logInfo(`Vagas brutas: ${vagas.length}`);

  // 2. Processar cada vaga
  for (const vaga of vagas) {
    try {
      const match = calcularCompatibilidade(vaga);
      resultados.buscas.push({
        title: vaga.title,
        score: match.score,
      });

      if (match.score < minScore) {
        resultados.skipped.push({
          title: vaga.title,
          score: match.score,
        });
        continue;
      }

      // 3. Extrair dados da vaga (inclui email do description)
      const textoVaga = `${vaga.title}\n${vaga.company}\n${vaga.description || ""}`;
      const dadosVaga = await extrairDadosVaga(textoVaga);

      // Email pode vir da vaga API OU do description
      const emailFinal =
        dadosVaga.emailContato ||
        vaga._emails?.[0] ||
        extrairEmailDoTexto(vaga.description || "");

      logInfo(`Vaga: ${vaga.title} | Score: ${match.score}% | Email: ${emailFinal || "NENHUM"}`);

      // 4. Gerar currículo
      let nomeArquivo = null;
      try {
        const curriculo = await personalizarCurriculo(dadosVaga);
        const pdfPath = await gerarPdfCurriculo(curriculo, dadosVaga);
        if (pdfPath) {
          nomeArquivo = path.basename(pdfPath);
          resultados.stats.gerados++;
          logInfo(`PDF gerado: ${nomeArquivo}`);
        }
      } catch (err) {
        logError(`Erro ao gerar PDF para "${vaga.title}": ${err.message}`);
      }

      const resultado = {
        title: vaga.title,
        company: vaga.company,
        score: match.score,
        matches: match.matches.map((m) => m.required),
        missing: match.missing,
        arquivo: nomeArquivo,
        url: vaga.url,
        email: emailFinal,
        status: nomeArquivo ? "curriculo_gerado" : "erro_pdf",
      };

      // 5. Enviar email
      if (autoSend && emailFinal && nomeArquivo) {
        try {
          await enviarCurriculo({
            nomeArquivo,
            emailDestino: emailFinal,
            vagaTitulo: vaga.title,
          });
          resultado.status = "enviado";
          resultados.stats.enviados++;
          logInfo(`✅ EMAIL ENVIADO: ${vaga.title} → ${emailFinal}`);
        } catch (err) {
          resultado.status = "erro_envio";
          resultado.erroEnvio = err.message;
          resultados.stats.erroEnvio++;
          logError(`❌ Erro envio "${vaga.title}": ${err.message}`);
        }
      } else if (!emailFinal) {
        resultado.status = "sem_email";
        resultados.stats.semEmail++;
        logWarn(`⚠️ Sem email: ${vaga.title}`);
      }

      resultados.applied.push(resultado);
    } catch (err) {
      logError(`Erro ao processar "${vaga.title}": ${err.message}`);
      resultados.erros.push({ title: vaga.title, error: err.message });
    }
  }

  const totalTime = Date.now() - startTime;
  resultados.resumo = {
    total: vagas.length,
    compatveis: resultados.applied.length,
    ...resultados.stats,
    erros: resultados.erros.length,
    tempoTotal: `${totalTime}ms`,
  };

  logInfo("Pipeline concluído", resultados.resumo);
  return resultados;
};

/**
 * Tenta extrair email de texto livre (descrição da vaga)
 */
function extrairEmailDoTexto(texto) {
  if (!texto) return null;
  const match = texto.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  return match ? match[0] : null;
}
