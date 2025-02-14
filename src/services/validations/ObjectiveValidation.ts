import { StrategicObjective, ObjectiveStatus } from '@/types/strategic-planning';
import { BaseValidation } from './BaseValidation';
import { ValidationOptions } from './types';

export class ObjectiveValidation extends BaseValidation<StrategicObjective> {
  constructor() {
    super();
    this.initializeRules();
  }

  private initializeRules(): void {
    // Validação de nome
    this.addRule({
      code: 'INVALID_NAME',
      message: 'Objective name is required',
      field: 'name',
      severity: 'error',
      validate: (objective) => Boolean(objective.name?.trim())
    });

    // Validação de descrição
    this.addRule({
      code: 'MISSING_DESCRIPTION',
      message: 'Objective should have a description',
      field: 'description',
      severity: 'warning',
      validate: (objective) => Boolean(objective.description?.trim())
    });

    // Validação de progresso
    this.addRule({
      code: 'INVALID_PROGRESS',
      message: 'Progress must be between 0 and 100',
      field: 'progress',
      severity: 'error',
      validate: (objective) => {
        const progress = objective.progress;
        return progress >= 0 && progress <= 100;
      }
    });

    // Validação de responsável
    this.addRule({
      code: 'NO_RESPONSIBLE',
      message: 'At least one responsible person must be assigned',
      field: 'responsible',
      severity: 'error',
      validate: (objective) => Boolean(objective.responsible)
    });

    // Validação de tipo
    this.addRule({
      code: 'INVALID_TYPE',
      message: 'Invalid objective type',
      field: 'type',
      severity: 'error',
      validate: (objective) => {
        const validTypes = ['strategic', 'tactical', 'operational'];
        return validTypes.includes(objective.type);
      }
    });

    // Validação de status
    this.addRule({
      code: 'INVALID_STATUS',
      message: 'Invalid objective status',
      field: 'status',
      severity: 'error',
      validate: (objective) => {
        const validStatus = ['Não iniciado', 'Em andamento', 'Concluído', 'Cancelado'];
        return validStatus.includes(objective.status as ObjectiveStatus);
      }
    });
  }

  validateAlignment(objective: StrategicObjective, parentObjective?: StrategicObjective): void {
    if (parentObjective) {
      // Validação de alinhamento com objetivo pai
      this.addRule({
        code: 'MISALIGNED_TYPE',
        message: 'Child objective type must be aligned with parent type',
        field: 'type',
        severity: 'error',
        validate: (obj) => {
          const typeHierarchy = {
            strategic: ['tactical'],
            tactical: ['operational'],
            operational: []
          };
          return typeHierarchy[parentObjective.type].includes(obj.type);
        }
      });
    }
  }

  static validateStatus(status: string): boolean {
    const validStatus: ObjectiveStatus[] = [
      'Não iniciado',
      'Em andamento',
      'Concluído',
      'Cancelado'
    ];
    return validStatus.includes(status as ObjectiveStatus);
  }
} 