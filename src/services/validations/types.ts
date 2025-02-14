import { ValidationResult, ValidationError, ValidationWarning } from '@/types/strategic-planning';

// Tipos específicos para implementação do serviço de validação
export interface ValidationContext {
  userId: string;
  timestamp: Date;
  source: string;
}

export interface ValidationOptions {
  strict?: boolean;
  context?: ValidationContext;
}

export interface ValidationRule<T> {
  code: string;
  message: string;
  validate: (value: T, options?: ValidationOptions) => boolean;
  field?: string;
  severity: 'error' | 'warning';
}

export interface ValidationService<T> {
  validate(entity: T, options?: ValidationOptions): ValidationResult;
  addRule(rule: ValidationRule<T>): void;
  removeRule(code: string): void;
}

// Re-exporta os tipos do strategic-planning para conveniência
export type { ValidationResult, ValidationError, ValidationWarning }; 