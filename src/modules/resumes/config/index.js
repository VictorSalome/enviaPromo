import dotenv from "dotenv";
import path from "path";

// Carregar variáveis de ambiente
dotenv.config();

const runtimeEnv = process.env.NODE_ENV || "development";
const requestedHost = (process.env.HOST || "").trim();
const isRenderRuntime =
  process.env.RENDER === "true" ||
  Boolean(process.env.RENDER_EXTERNAL_HOSTNAME);
const shouldForcePublicHost =
  runtimeEnv === "production" ||
  isRenderRuntime ||
  requestedHost === "localhost" ||
  requestedHost === "127.0.0.1";
const resolvedHost =
  shouldForcePublicHost &&
  (!requestedHost ||
    requestedHost === "localhost" ||
    requestedHost === "127.0.0.1")
    ? "0.0.0.0"
    : requestedHost || "0.0.0.0";

/**
 * Configurações centralizadas da aplicação
 */

// Configurações do servidor
export const serverConfig = {
  port: parseInt(process.env.PORT) || 3000,
  host: resolvedHost,
  env: runtimeEnv,
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "https://www.linkedin.com",
        "http://localhost:3001",
        "null",
      ],
  trustProxy: process.env.TRUST_PROXY === "true",
};

// Configurações de rate limiting
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // máximo 100 requisições por janela
  message: {
    error: "Muitas requisições deste IP, tente novamente mais tarde.",
    status: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Configurações de logging
export const logConfig = {
  level: process.env.LOG_LEVEL || "info",
  logDir: process.env.LOG_DIR || "logs",
  maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
  enableConsole: process.env.LOG_CONSOLE !== "false",
  enableFile: process.env.LOG_FILE !== "false",
};

// Configurações de e-mail
export const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || "Sistema de Currículo",
    address: process.env.SMTP_USER,
  },
  templates: {
    subject:
      process.env.EMAIL_SUBJECT_TEMPLATE || "Candidatura: {candidato} - {vaga}",
    replyTo: process.env.EMAIL_REPLY_TO,
  },
};

// Configurações de PDF
export const pdfConfig = {
  margins: {
    top: parseInt(process.env.PDF_MARGIN_TOP) || 72, // 2.5cm
    bottom: parseInt(process.env.PDF_MARGIN_BOTTOM) || 72, // 2.5cm
    left: parseInt(process.env.PDF_MARGIN_LEFT) || 72, // 2.5cm
    right: parseInt(process.env.PDF_MARGIN_RIGHT) || 72, // 2.5cm
  },
  fonts: {
    title: {
      family: process.env.PDF_TITLE_FONT || "Helvetica-Bold",
      size: parseInt(process.env.PDF_TITLE_SIZE) || 14,
    },
    subtitle: {
      family: process.env.PDF_SUBTITLE_FONT || "Helvetica-Bold",
      size: parseInt(process.env.PDF_SUBTITLE_SIZE) || 12,
    },
    body: {
      family: process.env.PDF_BODY_FONT || "Helvetica",
      size: parseInt(process.env.PDF_BODY_SIZE) || 11,
    },
    small: {
      family: process.env.PDF_SMALL_FONT || "Helvetica",
      size: parseInt(process.env.PDF_SMALL_SIZE) || 10,
    },
  },
  spacing: {
    betweenSections: parseInt(process.env.PDF_SECTION_SPACING) || 20,
    betweenItems: parseInt(process.env.PDF_ITEM_SPACING) || 12,
    betweenLines: parseInt(process.env.PDF_LINE_SPACING) || 6,
  },
  maxFileSize: parseInt(process.env.PDF_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
};

// Configurações de diretórios
export const pathConfig = {
  root: process.cwd(),
  temp: path.join(process.cwd(), process.env.TEMP_DIR || "temp"),
  logs: path.join(process.cwd(), process.env.LOG_DIR || "logs"),
  data: path.join(process.cwd(), process.env.DATA_DIR || "data"),
  uploads: path.join(process.cwd(), process.env.UPLOADS_DIR || "uploads"),
  candidateProfile: path.join(
    process.cwd(),
    process.env.CANDIDATE_PROFILE_PATH || "candidate-profile.json",
  ),
};

// Configurações de validação
export const validationConfig = {
  vagaText: {
    minLength: parseInt(process.env.VAGA_TEXT_MIN_LENGTH) || 50,
    maxLength: parseInt(process.env.VAGA_TEXT_MAX_LENGTH) || 10000,
  },
  email: {
    maxLength: parseInt(process.env.EMAIL_MAX_LENGTH) || 254,
  },
  name: {
    minLength: parseInt(process.env.NAME_MIN_LENGTH) || 2,
    maxLength: parseInt(process.env.NAME_MAX_LENGTH) || 100,
  },
  phone: {
    minLength: parseInt(process.env.PHONE_MIN_LENGTH) || 8,
    maxLength: parseInt(process.env.PHONE_MAX_LENGTH) || 15,
  },
};

// Configurações de extração de dados
export const extractionConfig = {
  email: {
    // Regex para extrair e-mails
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Domínios comuns de e-mail corporativo
    corporateDomains: ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"],
  },
  stack: {
    // Tecnologias comuns para identificação
    technologies: [
      // Frontend
      "React",
      "Vue",
      "Angular",
      "JavaScript",
      "TypeScript",
      "HTML",
      "CSS",
      "SASS",
      "SCSS",
      "jQuery",
      "Bootstrap",
      "Tailwind",
      "Material-UI",
      "Styled Components",

      // Backend
      "Node.js",
      "Express",
      "NestJS",
      "Python",
      "Django",
      "Flask",
      "Java",
      "Spring",
      "PHP",
      "Laravel",
      "C#",
      ".NET",
      "Ruby",
      "Rails",
      "Go",
      "Rust",

      // Bancos de dados
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "SQLite",
      "Oracle",
      "SQL Server",

      // Cloud e DevOps
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitLab CI",
      "GitHub Actions",
      "Terraform",
      "Ansible",

      // Mobile
      "React Native",
      "Flutter",
      "Swift",
      "Kotlin",
      "Ionic",

      // Ferramentas
      "Git",
      "GitHub",
      "GitLab",
      "Jira",
      "Confluence",
      "Slack",
      "Teams",
    ],
  },
  areas: {
    // Áreas de atuação comuns
    common: [
      "Desenvolvimento",
      "Frontend",
      "Backend",
      "Full Stack",
      "Mobile",
      "DevOps",
      "Data Science",
      "Machine Learning",
      "QA",
      "Tester",
      "UI/UX",
      "Design",
      "Product Manager",
      "Scrum Master",
      "Arquitetura",
      "Segurança",
      "Infraestrutura",
    ],
  },
  keywords: {
    // Palavras-chave para identificar seções
    titulo: [
      "vaga",
      "posição",
      "cargo",
      "oportunidade",
      "desenvolvedor",
      "analista",
      "especialista",
    ],
    requisitos: [
      "requisitos",
      "exigências",
      "necessário",
      "obrigatório",
      "experiência",
    ],
    diferenciais: [
      "diferenciais",
      "desejável",
      "plus",
      "seria um plus",
      "diferencial",
    ],
    responsabilidades: [
      "responsabilidades",
      "atribuições",
      "atividades",
      "funções",
    ],
    beneficios: ["benefícios", "oferecemos", "vantagens", "vale", "plano"],
  },
};

// Configurações de personalização do currículo
export const curriculoConfig = {
  relevance: {
    // Pesos para cálculo de relevância
    weights: {
      skills: parseFloat(process.env.RELEVANCE_SKILLS_WEIGHT) || 0.4,
      experience: parseFloat(process.env.RELEVANCE_EXPERIENCE_WEIGHT) || 0.3,
      education: parseFloat(process.env.RELEVANCE_EDUCATION_WEIGHT) || 0.2,
      certifications:
        parseFloat(process.env.RELEVANCE_CERTIFICATIONS_WEIGHT) || 0.1,
    },
    // Pontuação mínima para incluir item
    minScore: parseFloat(process.env.RELEVANCE_MIN_SCORE) || 0.3,
  },
  summary: {
    // Configurações para geração do resumo profissional
    maxLength: parseInt(process.env.SUMMARY_MAX_LENGTH) || 300,
    includeKeywords: process.env.SUMMARY_INCLUDE_KEYWORDS !== "false",
    templates: {
      junior:
        "Profissional {area} com {experiencia} de experiência, especializado em {tecnologias}. {destaque}",
      pleno:
        "Profissional {area} com experiência de {experiencia}, especializado em {tecnologias}. {destaque}",
      senior:
        "{area} sênior com {experiencia} de experiência, especializado em {tecnologias}. {destaque}",
    },
  },
  limits: {
    // Limites para seções do currículo
    maxExperiences: parseInt(process.env.CURRICULO_MAX_EXPERIENCES) || 5,
    maxEducation: parseInt(process.env.CURRICULO_MAX_EDUCATION) || 3,
    maxCertifications: parseInt(process.env.CURRICULO_MAX_CERTIFICATIONS) || 8,
    maxSkillsPerCategory:
      parseInt(process.env.CURRICULO_MAX_SKILLS_PER_CATEGORY) || 10,
  },
};

// Configurações de segurança
export const securityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  },
  cors: {
    origin: serverConfig.corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  },
  rateLimit: rateLimitConfig,
};

// Configurações de monitoramento
export const monitoringConfig = {
  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== "false",
    endpoint: process.env.HEALTH_CHECK_ENDPOINT || "/health",
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 segundos
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === "true",
    endpoint: process.env.METRICS_ENDPOINT || "/metrics",
  },
};

// Configurações de desenvolvimento
export const devConfig = {
  hotReload: process.env.HOT_RELOAD === "true",
  debugMode: process.env.DEBUG_MODE === "true",
  mockEmail: process.env.MOCK_EMAIL === "true",
  logRequests: process.env.LOG_REQUESTS !== "false",
};

// Validar configurações críticas
const validateConfig = () => {
  const errors = [];

  // Validar configurações de e-mail em produção
  if (serverConfig.env === "production") {
    if (!emailConfig.smtp.host)
      errors.push("SMTP_HOST é obrigatório em produção");
    if (!emailConfig.smtp.auth.user)
      errors.push("SMTP_USER é obrigatório em produção");
    if (!emailConfig.smtp.auth.pass)
      errors.push("SMTP_PASS é obrigatório em produção");
  }

  // Validar porta
  if (
    isNaN(serverConfig.port) ||
    serverConfig.port < 1 ||
    serverConfig.port > 65535
  ) {
    errors.push("PORT deve ser um número válido entre 1 e 65535");
  }

  // Validar diretórios
  const requiredDirs = [pathConfig.temp, pathConfig.logs];
  // Note: A criação dos diretórios será feita pelos serviços que os utilizam

  if (errors.length > 0) {
    console.error("Erros de configuração:", errors);
    process.exit(1);
  }
};

// Executar validação
validateConfig();

// Exportar configuração completa
export default {
  server: serverConfig,
  rateLimit: rateLimitConfig,
  log: logConfig,
  email: emailConfig,
  pdf: pdfConfig,
  paths: pathConfig,
  validation: validationConfig,
  extraction: extractionConfig,
  curriculo: curriculoConfig,
  security: securityConfig,
  monitoring: monitoringConfig,
  dev: devConfig,
};
