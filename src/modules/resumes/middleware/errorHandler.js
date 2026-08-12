import { logError } from "../utils/logger.js";
import { serverConfig } from "../config/index.js";

/**
 * Classes de erro customizadas
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito de dados") {
    super(message, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Muitas requisições") {
    super(message, 429);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Serviço indisponível") {
    super(message, 503);
  }
}

/**
 * Middleware de tratamento de erros
 * @param {Error} error - Erro capturado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const errorHandler = (error, req, res, next) => {
  // Se a resposta já foi enviada, delegar para o handler padrão do Express
  if (res.headersSent) {
    return next(error);
  }

  // Log do erro
  logError("Erro capturado pelo middleware", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Determinar status code e mensagem
  let statusCode = 500;
  let message = "Erro interno do servidor";
  let errors = [];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;

    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  } else if (error.name === "ValidationError") {
    // Erro de validação do Mongoose ou similar
    statusCode = 400;
    message = "Dados inválidos";
    errors = Object.values(error.errors || {}).map((err) => err.message);
  } else if (error.name === "CastError") {
    // Erro de cast do Mongoose
    statusCode = 400;
    message = "ID inválido";
  } else if (error.code === 11000) {
    // Erro de duplicação do MongoDB
    statusCode = 409;
    message = "Dados duplicados";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token inválido";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expirado";
  } else if (error.name === "MulterError") {
    statusCode = 400;
    message = getMulterErrorMessage(error);
  } else if (error.code === "ENOENT") {
    statusCode = 404;
    message = "Arquivo não encontrado";
  } else if (error.code === "EACCES") {
    statusCode = 403;
    message = "Permissão negada";
  } else if (error.code === "EMFILE" || error.code === "ENFILE") {
    statusCode = 503;
    message = "Muitos arquivos abertos";
  } else if (error.code === "ENOSPC") {
    statusCode = 507;
    message = "Espaço em disco insuficiente";
  }

  // Preparar resposta de erro
  const errorResponse = {
    success: false,
    error: {
      message,
      status: statusCode,
    },
  };

  // Adicionar detalhes em desenvolvimento
  if (serverConfig.env === "development") {
    errorResponse.error.stack = error.stack;
    errorResponse.error.details = {
      name: error.name,
      code: error.code,
      originalMessage: error.message,
    };
  }

  // Adicionar erros de validação se existirem
  if (errors.length > 0) {
    errorResponse.error.errors = errors;
  }

  // Adicionar timestamp
  errorResponse.timestamp = new Date().toISOString();

  // Adicionar request ID se disponível
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // Enviar resposta
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar erros assíncronos
 * @param {Function} fn - Função assíncrona
 * @returns {Function} Middleware wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para tratar rotas não encontradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(
    `Rota ${req.method} ${req.originalUrl} não encontrada`,
  );
  next(error);
};

/**
 * Obtém mensagem de erro do Multer
 * @param {Error} error - Erro do Multer
 * @returns {string} Mensagem de erro
 */
const getMulterErrorMessage = (error) => {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return "Arquivo muito grande";
    case "LIMIT_FILE_COUNT":
      return "Muitos arquivos";
    case "LIMIT_FIELD_KEY":
      return "Nome do campo muito longo";
    case "LIMIT_FIELD_VALUE":
      return "Valor do campo muito longo";
    case "LIMIT_FIELD_COUNT":
      return "Muitos campos";
    case "LIMIT_UNEXPECTED_FILE":
      return "Arquivo inesperado";
    case "MISSING_FIELD_NAME":
      return "Nome do campo ausente";
    default:
      return "Erro no upload do arquivo";
  }
};

/**
 * Handler para erros não capturados
 */
process.on("uncaughtException", (error) => {
  logError("Exceção não capturada", error);
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

/**
 * Handler para promises rejeitadas não tratadas
 */
process.on("unhandledRejection", (reason, promise) => {
  logError("Promise rejeitada não tratada", {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
  });
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  process.exit(1);
});

/**
 * Handler para sinais de término
 */
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Aqui você pode adicionar lógica de limpeza:
  // - Fechar conexões de banco de dados
  // - Finalizar operações em andamento
  // - Limpar arquivos temporários

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

/**
 * Middleware para adicionar request ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const requestIdMiddleware = (req, res, next) => {
  req.id = generateRequestId();
  res.setHeader("X-Request-ID", req.id);
  next();
};

/**
 * Gera ID único para requisição
 * @returns {string} ID único
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Middleware para timeout de requisições
 * @param {number} timeout - Timeout em milissegundos
 * @returns {Function} Middleware
 */
export const timeoutMiddleware = (timeout = 30000) => {
  return (req, res, next) => {
    req.timedout = false;
    let timeoutTriggered = false;

    const timer = setTimeout(() => {
      timeoutTriggered = true;
      req.timedout = true;

      if (!res.headersSent && !res.writableEnded) {
        const error = new ServiceUnavailableError("Timeout da requisição");
        next(error);
      }
    }, timeout);

    // Limpar timer quando a resposta finalizar/encerrar
    const clearTimer = () => clearTimeout(timer);
    res.on("finish", clearTimer);
    res.on("close", clearTimer);

    // Limpar timer quando a resposta for enviada (compatibilidade)
    const originalSend = res.send;
    res.send = function (data) {
      clearTimeout(timer);
      return originalSend.call(this, data);
    };

    const originalJson = res.json;
    res.json = function (data) {
      clearTimeout(timer);
      return originalJson.call(this, data);
    };

    // Evitar avanço de pipeline depois do timeout
    if (timeoutTriggered) return;

    next();
  };
};

/**
 * Middleware para validar Content-Type
 * @param {Array} allowedTypes - Tipos de conteúdo permitidos
 * @returns {Function} Middleware
 */
export const contentTypeMiddleware = (allowedTypes = ["application/json"]) => {
  return (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      return next();
    }

    const contentType = req.get("Content-Type");

    if (!contentType) {
      return next(new ValidationError("Content-Type é obrigatório"));
    }

    const isAllowed = allowedTypes.some((type) =>
      contentType.toLowerCase().includes(type.toLowerCase()),
    );

    if (!isAllowed) {
      return next(
        new ValidationError(
          `Content-Type não suportado. Tipos permitidos: ${allowedTypes.join(", ")}`,
        ),
      );
    }

    next();
  };
};
