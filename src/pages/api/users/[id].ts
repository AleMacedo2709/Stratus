import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createSensitiveDataMiddleware } from '@/middleware/sensitiveDataMiddleware';
import { EncryptionService } from '@/services/security/EncryptionService';
import { AuditService } from '@/services/security/AuditService';
import { LoggingService } from '@/services/logging/LoggingService';
import { AuthorizationService } from '@/services/auth/AuthorizationService';

const prisma = new PrismaClient();

// Configuração de campos sensíveis
const sensitiveDataMiddleware = createSensitiveDataMiddleware({
  email: 'email',
  phoneNumber: 'phone',
  documentNumber: 'cpf',
  address: 'address'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    // Verifica autorização
    const authService = AuthorizationService.getInstance();
    const canAccess = authService.hasPermission(req.user, 'ler', 'usuario');

    if (!canAccess) {
      LoggingService.warn('Unauthorized access attempt', {
        userId,
        targetResource: `user/${id}`,
        action: req.method
      });
      return res.status(403).json({ error: 'Acesso negado' });
    }

    switch (req.method) {
      case 'GET':
        const user = await prisma.user.findUnique({
          where: { id: String(id) },
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            documentNumber: true,
            address: true,
            profile: true,
            unit: true,
            active: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Descriptografa dados sensíveis
        if (user.documentNumber) {
          user.documentNumber = EncryptionService.decrypt(user.documentNumber);
        }

        // Aplica middleware de mascaramento
        await sensitiveDataMiddleware(req, res, () => {
          res.json(user);
        });
        break;

      case 'PUT':
        const updates = req.body;

        // Criptografa dados sensíveis antes de salvar
        if (updates.documentNumber) {
          updates.documentNumber = EncryptionService.encrypt(updates.documentNumber);
        }

        const updatedUser = await prisma.user.update({
          where: { id: String(id) },
          data: {
            ...updates,
            updatedAt: new Date(),
            updatedBy: userId
          }
        });

        // Registra a atualização no log de auditoria
        await AuditService.logAccess(
          userId,
          'update',
          `user/${id}`,
          {
            method: req.method,
            ipAddress: req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            updatedFields: Object.keys(updates)
          }
        );

        // Descriptografa e mascara dados para resposta
        if (updatedUser.documentNumber) {
          updatedUser.documentNumber = EncryptionService.decrypt(updatedUser.documentNumber);
        }

        await sensitiveDataMiddleware(req, res, () => {
          res.json(updatedUser);
        });
        break;

      case 'DELETE':
        await prisma.user.update({
          where: { id: String(id) },
          data: {
            isDeleted: true,
            updatedAt: new Date(),
            updatedBy: userId
          }
        });

        // Registra a exclusão no log de auditoria
        await AuditService.logAccess(
          userId,
          'delete',
          `user/${id}`,
          {
            method: req.method,
            ipAddress: req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        );

        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    LoggingService.error('Error processing user request', error as Error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 