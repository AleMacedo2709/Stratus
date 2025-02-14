import { NextApiRequest, NextApiResponse } from 'next';
import { Tokens } from 'csrf';
import { LoggingService } from '../services/logging/LoggingService';

const tokens = new Tokens();

// Configurações de CORS
const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 horas
};

// Headers de segurança padrão
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' ${process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ? 'https://login.microsoftonline.com' : ''};
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim()
};

// Middleware CORS
export function cors(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  try {
    // Preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', corsConfig.origin);
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', corsConfig.maxAge);
      res.status(204).end();
      return;
    }

    // Regular requests
    res.setHeader('Access-Control-Allow-Origin', corsConfig.origin);
    next();
  } catch (error) {
    LoggingService.error('CORS error', error as Error);
    next();
  }
}

// Middleware CSRF
export function csrf(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  try {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      // Gera novo token para métodos seguros
      const secret = tokens.secretSync();
      const token = tokens.create(secret);
      
      res.setHeader('X-CSRF-Token', token);
      next();
      return;
    }

    // Valida token para métodos não seguros
    const token = req.headers['x-csrf-token'] as string;
    const secret = req.cookies['csrf-secret'];

    if (!token || !secret || !tokens.verify(secret, token)) {
      LoggingService.warn('CSRF validation failed', {
        ip: req.socket.remoteAddress,
        path: req.url
      });

      res.status(403).json({ error: 'Token CSRF inválido' });
      return;
    }

    next();
  } catch (error) {
    LoggingService.error('CSRF error', error as Error);
    next();
  }
}

// Middleware de headers de segurança
export function securityHeadersMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    Object.entries(securityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });

    // HSTS apenas em produção e com SSL
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SSL === 'true') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    next();
  } catch (error) {
    LoggingService.error('Security headers error', error as Error);
    next();
  }
}

// Middleware de sanitização de entrada
export function sanitizeInput(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    next();
  } catch (error) {
    LoggingService.error('Input sanitization error', error as Error);
    next();
  }
}

// Função auxiliar para sanitizar objetos
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  return Object.keys(obj).reduce((sanitized: any, key) => {
    sanitized[key] = sanitizeValue(obj[key]);
    return sanitized;
  }, Array.isArray(obj) ? [] : {});
}

// Função auxiliar para sanitizar valores
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Remove caracteres perigosos
    return value
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  if (typeof value === 'object' && value !== null) {
    return sanitizeObject(value);
  }
  return value;
}

// Middleware composto com todas as proteções
export const securityMiddleware = [
  cors,
  csrf,
  securityHeadersMiddleware,
  sanitizeInput
]; 