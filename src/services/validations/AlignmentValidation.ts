import { StrategicObjective } from '@/types/strategic-planning';
import { BaseValidation } from './BaseValidation';
import { ValidationOptions, ValidationResult } from './types';

export class AlignmentValidation extends BaseValidation<StrategicObjective[]> {
  constructor() {
    super();
    this.initializeRules();
  }

  private initializeRules(): void {
    // Validação de hierarquia
    this.addRule({
      code: 'NO_ROOT_OBJECTIVES',
      message: 'No root objectives found',
      field: 'hierarchy',
      severity: 'error',
      validate: (objectives) => objectives.some(obj => !obj.parentId)
    });

    // Validação de ciclos
    this.addRule({
      code: 'CIRCULAR_REFERENCE',
      message: 'Circular reference detected in objective hierarchy',
      field: 'hierarchy',
      severity: 'error',
      validate: (objectives) => !this.hasCircularReference(objectives)
    });

    // Validação de objetivos órfãos
    this.addRule({
      code: 'ORPHAN_OBJECTIVES',
      message: 'Found objectives with invalid parent references',
      field: 'hierarchy',
      severity: 'error',
      validate: (objectives) => {
        const ids = new Set(objectives.map(obj => obj.id));
        return objectives.every(obj => !obj.parentId || ids.has(obj.parentId));
      }
    });
  }

  validateHierarchy(objectives: StrategicObjective[]): ValidationResult {
    // Validações específicas de hierarquia
    const objectiveMap = new Map(objectives.map(obj => [obj.id, obj]));
    const rootObjectives = objectives.filter(obj => !obj.parentId);

    // Adiciona regras específicas para a validação de hierarquia
    this.addRule({
      code: 'INVALID_HIERARCHY_DEPTH',
      message: 'Hierarchy depth exceeds maximum allowed (3 levels)',
      field: 'hierarchy',
      severity: 'error',
      validate: () => this.validateHierarchyDepth(rootObjectives, objectiveMap) <= 3
    });

    return this.validate(objectives);
  }

  private hasCircularReference(objectives: StrategicObjective[]): boolean {
    const objectiveMap = new Map(objectives.map(obj => [obj.id, obj]));
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (objectiveId: string): boolean => {
      if (!objectiveId) return false;
      if (recursionStack.has(objectiveId)) return true;
      if (visited.has(objectiveId)) return false;

      visited.add(objectiveId);
      recursionStack.add(objectiveId);

      const objective = objectiveMap.get(objectiveId);
      if (objective?.parentId) {
        if (hasCycle(objective.parentId)) return true;
      }

      recursionStack.delete(objectiveId);
      return false;
    };

    return objectives.some(obj => hasCycle(obj.id));
  }

  private validateHierarchyDepth(
    objectives: StrategicObjective[],
    objectiveMap: Map<string, StrategicObjective>,
    depth: number = 1
  ): number {
    if (!objectives.length) return depth - 1;

    let maxChildDepth = depth;
    for (const objective of objectives) {
      const children = Array.from(objectiveMap.values())
        .filter(obj => obj.parentId === objective.id);
      
      if (children.length) {
        const childDepth = this.validateHierarchyDepth(children, objectiveMap, depth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
    }

    return maxChildDepth;
  }
} 