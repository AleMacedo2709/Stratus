import { Indicator } from '@/types/strategic-planning';
import { BaseValidation } from './BaseValidation';
import { ValidationOptions } from './types';

export class IndicatorValidation extends BaseValidation<Indicator> {
  constructor() {
    super();
    this.initializeRules();
  }

  private initializeRules(): void {
    // Validação de nome
    this.addRule({
      code: 'INVALID_NAME',
      message: 'Indicator name is required',
      field: 'name',
      severity: 'error',
      validate: (indicator) => Boolean(indicator.name?.trim())
    });

    // Validação de descrição
    this.addRule({
      code: 'MISSING_DESCRIPTION',
      message: 'Indicator should have a description',
      field: 'description',
      severity: 'warning',
      validate: (indicator) => Boolean(indicator.description?.trim())
    });

    // Validação de unidade
    this.addRule({
      code: 'INVALID_UNIT',
      message: 'Invalid indicator unit',
      field: 'unit',
      severity: 'error',
      validate: (indicator) => {
        const validUnits = ['percentage', 'number', 'currency', 'time'];
        return validUnits.includes(indicator.unit);
      }
    });

    // Validação de valores
    this.addRule({
      code: 'INVALID_VALUES',
      message: 'Target value must be greater than baseline value',
      field: 'values',
      severity: 'error',
      validate: (indicator) => indicator.targetValue > indicator.baselineValue
    });

    // Validação de frequência
    this.addRule({
      code: 'INVALID_FREQUENCY',
      message: 'Invalid measurement frequency',
      field: 'frequency',
      severity: 'error',
      validate: (indicator) => {
        const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
        return validFrequencies.includes(indicator.frequency);
      }
    });

    // Validação de responsável
    this.addRule({
      code: 'NO_RESPONSIBLE',
      message: 'At least one responsible person must be assigned',
      field: 'responsible',
      severity: 'error',
      validate: (indicator) => Boolean(indicator.responsible)
    });

    // Validação de objetivo relacionado
    this.addRule({
      code: 'NO_OBJECTIVE',
      message: 'Indicator must be linked to an objective',
      field: 'objectiveId',
      severity: 'error',
      validate: (indicator) => Boolean(indicator.objectiveId)
    });

    // Validação de valor atual
    this.addRule({
      code: 'INVALID_CURRENT_VALUE',
      message: 'Current value must be a valid number',
      field: 'currentValue',
      severity: 'error',
      validate: (indicator) => {
        const value = indicator.currentValue;
        return typeof value === 'number' && !isNaN(value);
      }
    });
  }

  validateFormula(formula: string): boolean {
    try {
      // Validação básica de sintaxe da fórmula
      const formulaPattern = /^[\w\s+\-*/%().,]+$/;
      return formulaPattern.test(formula);
    } catch (error) {
      return false;
    }
  }
} 