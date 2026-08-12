import { logInfo } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

let cachedProfile = null;

/**
 * Carrega o perfil do candidato (candidate-profile.json)
 */
function loadProfile() {
  if (cachedProfile) return cachedProfile;
  const profilePath = path.join(process.cwd(), 'candidate-profile.json');
  if (!fs.existsSync(profilePath)) return null;
  cachedProfile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  return cachedProfile;
}

/**
 * Calcula score de compatibilidade entre uma vaga e o perfil
 * @param {Object} vaga - Vaga normalizada
 * @returns {Object} { score, matches, missing, summary }
 */
export const calcularCompatibilidade = (vaga) => {
  const profile = loadProfile();
  if (!profile) return { score: 0, matches: [], missing: [], summary: 'Perfil não encontrado' };

  const profileSkills = extrairSkillsDoPerfil(profile);
  const vagaSkills = extrairSkillsDaVaga(vaga);

  // ── Match de skills ──
  const matches = [];
  const missing = [];

  for (const skill of vagaSkills) {
    const found = profileSkills.find((ps) =>
      ps.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(ps.toLowerCase())
    );
    if (found) {
      matches.push({ required: skill, found });
    } else {
      missing.push(skill);
    }
  }

  // ── Score por skills (70%) ──
  const skillScore = vagaSkills.length > 0
    ? (matches.length / vagaSkills.length) * 70
    : 35;

  // ── Match de localização (15%) ──
  const locScore = calcularScoreLocalizacao(vaga, profile) * 15;

  // ── Match de nível (15%) ──
  const nivelScore = calcularScoreNivel(vaga, profile) * 15;

  // ── Total ──
  const score = Math.round(skillScore + locScore + nivelScore);

  const summary = gerarResumo(score, matches, missing);

  return { score: Math.min(score, 100), matches, missing, summary };
};

/**
 * Extrai todas as skills do perfil (experiências + skills diretas)
 */
function extrairSkillsDoPerfil(profile) {
  const skills = new Set();

  // skills pode ser array ou objeto com categorias
  if (Array.isArray(profile.skills)) {
    profile.skills.forEach((s) => skills.add(s));
  } else if (profile.skills && typeof profile.skills === 'object') {
    Object.values(profile.skills).forEach((arr) => {
      if (Array.isArray(arr)) arr.forEach((s) => skills.add(s));
    });
  }

  if (profile.experiences) {
    profile.experiences.forEach((exp) => {
      if (exp.technologies) exp.technologies.forEach((t) => skills.add(t));
      if (exp.keywords) exp.keywords.forEach((k) => skills.add(k));
    });
  }

  return [...skills];
}

/**
 * Extrai skills/tecnologias mencionadas na vaga
 */
function extrairSkillsDaVaga(vaga) {
  const skills = new Set();
  const texto = `${vaga.title} ${vaga.description} ${(vaga.tags || []).join(' ')}`.toLowerCase();

  // Lista de tecnologias comuns para detectar
  const tecnologias = [
    'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte',
    'node.js', 'nodejs', 'node', 'express', 'nestjs', 'fastify',
    'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'php',
    'react native', 'flutter', 'swift', 'kotlin',
    'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd',
    'graphql', 'rest api', 'rest', 'api',
    'tailwind', 'css', 'html', 'sass',
    'git', 'github', 'gitlab',
    'prisma', 'sequelize', 'typeorm',
    'jwt', 'oauth', 'auth',
    'sql', 'nosql',
    'html', 'css', 'sass', 'less',
    'figma', 'sketch', 'design',
    'agile', 'scrum', 'kanban',
    'jest', 'cypress', 'playwright', 'testing',
    'linux', 'bash', 'shell',
    'websocket', 'socket.io', 'sse',
  ];

  for (const tech of tecnologias) {
    if (texto.includes(tech)) {
      skills.add(tech);
    }
  }

  // Adiciona tags da vaga diretamente
  if (vaga.tags) {
    vaga.tags.forEach((t) => skills.add(t.toLowerCase()));
  }

  return [...skills];
}

function calcularScoreLocalizacao(vaga, profile) {
  const vagaLoc = (vaga.location || '').toLowerCase();
  const profileLoc = (profile.personalInfo?.location || '').toLowerCase();

  if (vagaLoc.includes('remote') || vagaLoc.includes('remoto')) return 1;
  if (vagaLoc.includes('anywhere') || vagaLoc.includes('worldwide')) return 1;
  if (vagaLoc.includes('brasil') || vagaLoc.includes('brazil')) return 1;
  if (profileLoc && vagaLoc.includes(profileLoc.split(',')[0]?.trim())) return 1;

  return 0.5; // Semi-match
}

function calcularScoreNivel(vaga, profile) {
  const texto = `${vaga.title} ${vaga.description}`.toLowerCase();

  // Detectar se é pleno/senior (perfil tem ~3 anos = pleno)
  if (texto.includes('pleno') || texto.includes('mid-level') || texto.includes('mid level')) return 1;
  if (texto.includes('sênior') || texto.includes('senior')) return 0.8;
  if (texto.includes('júnior') || texto.includes('junior') || texto.includes('entry')) return 0.7;
  if (texto.includes('lead') || texto.includes('staff') || texto.includes('principal')) return 0.4;

  return 0.8; // Default
}

function gerarResumo(score, matches, missing) {
  if (score >= 80) return 'Excelente compatibilidade';
  if (score >= 60) return 'Boa compatibilidade';
  if (score >= 40) return 'Compatibilidade moderada';
  return 'Baixa compatibilidade';
}

/**
 * Ranqueia vagas por score de compatibilidade
 */
export const ranquearVagas = (vagas) => {
  return vagas
    .map((vaga) => ({
      ...vaga,
      match: calcularCompatibilidade(vaga),
    }))
    .sort((a, b) => b.match.score - a.match.score);
};
