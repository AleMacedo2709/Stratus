import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { MonitoringService } from '../../services/monitoring/MonitoringService';
import { LoggingService } from '../../services/logging/LoggingService';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      latency: number;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      latency: number;
    };
    api: {
      status: 'healthy' | 'unhealthy';
      uptime: number;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: 'healthy',
        latency: 0
      },
      redis: {
        status: 'healthy',
        latency: 0
      },
      api: {
        status: 'healthy',
        uptime: process.uptime()
      }
    }
  };

  try {
    // Verifica banco de dados
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database.latency = Date.now() - dbStartTime;
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.services.database.status = 'unhealthy';
    LoggingService.error('Database health check failed', error as Error);
  }

  try {
    // Verifica Redis
    const redisStartTime = Date.now();
    await redis.ping();
    healthStatus.services.redis.latency = Date.now() - redisStartTime;
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.services.redis.status = 'unhealthy';
    LoggingService.error('Redis health check failed', error as Error);
  }

  // Registra métricas
  const duration = Date.now() - startTime;
  MonitoringService.trackPerformance('HealthCheck', duration);

  Object.entries(healthStatus.services).forEach(([service, status]) => {
    if (status.latency) {
      MonitoringService.trackMetric(`${service}Latency`, status.latency);
    }
  });

  // Define status code baseado no estado geral
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  // Registra log
  LoggingService.info('Health check completed', {
    status: healthStatus.status,
    duration,
    services: healthStatus.services
  });

  res.status(statusCode).json(healthStatus);
} 