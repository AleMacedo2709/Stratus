import { logger } from '../monitoring/logger';
import {
  ValidationRule,
  ValidationOptions,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationService
} from './types';

export abstract class BaseValidation<T> implements ValidationService<T> {
  protected rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): void {
    this.rules.push(rule);
  }

  removeRule(code: string): void {
    this.rules = this.rules.filter(rule => rule.code !== code);
  }

  validate(entity: T, options?: ValidationOptions): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      this.rules.forEach(rule => {
        const isValid = rule.validate(entity, options);
        
        if (!isValid) {
          const validation = {
            code: rule.code,
            message: rule.message,
            ...(rule.field && { field: rule.field })
          };

          if (rule.severity === 'error') {
            errors.push(validation);
          } else {
            warnings.push(validation);
          }
        }
      });

      logger.info('Validation completed', {
        entityType: this.constructor.name,
        errorsCount: errors.length,
        warningsCount: warnings.length,
        context: options?.context
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logger.error('Error during validation', {
        error,
        entityType: this.constructor.name,
        context: options?.context
      });
      throw error;
    }
  }

  protected formatError(
    code: string,
    message: string,
    field?: string,
    details?: any
  ): ValidationError {
    return {
      code,
      message,
      ...(field && { field }),
      ...(details && { details })
    };
  }

  protected formatWarning(
    code: string,
    message: string,
    field?: string,
    details?: any
  ): ValidationWarning {
    return {
      code,
      message,
      ...(field && { field }),
      ...(details && { details })
    };
  }
} 