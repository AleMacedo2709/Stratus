import { NextApiRequest, NextApiResponse } from 'next';
import { DataMaskingService } from '../services/security/DataMaskingService';
import { AuditService } from '../services/security/AuditService';
import { LoggingService } from '../services/logging/LoggingService';

const SENSITIVE_FIELDS = {
  email: DataMaskingService.maskEmail,
  phone: DataMaskingService.maskPhone,
  cpf: DataMaskingService.maskCPF,
  creditCard: DataMaskingService.maskCreditCard,
  address: DataMaskingService.maskAddress,
};

type SensitiveFieldsConfig = {
  [key: string]: keyof typeof SENSITIVE_FIELDS;
};

export function createSensitiveDataMiddleware(config: SensitiveFieldsConfig) {
  return async function sensitiveDataMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    const originalJson = res.json;
    const startTime = performance.now();

    res.json = function (data: any) {
      try {
        const maskedData = maskSensitiveData(data, config);
        
        // Log access to sensitive data
        if (req.user?.id) {
          AuditService.logAccess(
            req.user.id,
            'view',
            req.url || 'unknown',
            {
              method: req.method,
              ipAddress: req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              accessedFields: Object.keys(config),
            }
          );
        }

        return originalJson.call(this, maskedData);
      } catch (error) {
        LoggingService.error('Failed to mask sensitive data', error as Error);
        return originalJson.call(this, data);
      }
    };

    await next();
  };
}

function maskSensitiveData(data: any, config: SensitiveFieldsConfig): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item, config));
  }

  if (typeof data === 'object') {
    const maskedData: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (config[key] && typeof value === 'string') {
        const maskFunction = SENSITIVE_FIELDS[config[key]];
        maskedData[key] = maskFunction(value);
      } else if (typeof value === 'object') {
        maskedData[key] = maskSensitiveData(value, config);
      } else {
        maskedData[key] = value;
      }
    }

    return maskedData;
  }

  return data;
}

// Exemplo de uso:
// const sensitiveDataMiddleware = createSensitiveDataMiddleware({
//   email: 'email',
//   phoneNumber: 'phone',
//   documentNumber: 'cpf',
//   cardNumber: 'creditCard',
//   residentialAddress: 'address',
// }); 