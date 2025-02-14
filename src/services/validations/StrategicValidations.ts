import { logger } from '../monitoring/logger';
import { 
  StrategicObjective, 
  Indicator, 
  ValidationResult,
  ValidationError,
  ValidationWarning,
  Initiative 
} from '@/types/strategic-planning';

export class StrategicValidations {
  static validateObjectiveAlignment(
    objective: StrategicObjective,
    parentObjective?: StrategicObjective
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic field validations
      if (!objective.name?.trim()) {
        errors.push({
          code: 'INVALID_NAME',
          message: 'Objective name is required',
          field: 'name'
        });
      }

      if (!objective.description?.trim()) {
        warnings.push({
          code: 'MISSING_DESCRIPTION',
          message: 'Objective should have a description',
          field: 'description'
        });
      }

      // Date validations
      const now = new Date();
      if (objective.startDate > objective.endDate) {
        errors.push({
          code: 'INVALID_DATES',
          message: 'Start date must be before end date',
          field: 'dates',
          details: { startDate: objective.startDate, endDate: objective.endDate }
        });
      }

      // Fiscal Year Alignment
      const startYear = new Date(objective.startDate).getFullYear();
      const endYear = new Date(objective.endDate).getFullYear();
      if (startYear !== endYear && !this.isAlignedWithFiscalPlanning(startYear, endYear)) {
        errors.push({
          code: 'MISALIGNED_FISCAL_YEAR',
          message: 'Objective dates must align with fiscal year planning (PPA/LDO/LOA)',
          field: 'dates',
          details: { startYear, endYear }
        });
      }

      // Progress validations
      if (objective.currentProgress < 0 || objective.currentProgress > 100) {
        errors.push({
          code: 'INVALID_PROGRESS',
          message: 'Progress must be between 0 and 100',
          field: 'currentProgress',
          details: { value: objective.currentProgress }
        });
      }

      // Parent alignment validations
      if (parentObjective) {
        if (objective.startDate < parentObjective.startDate) {
          errors.push({
            code: 'MISALIGNED_START_DATE',
            message: 'Start date cannot be before parent objective start date',
            field: 'startDate',
            details: {
              objectiveStart: objective.startDate,
              parentStart: parentObjective.startDate
            }
          });
        }

        if (objective.endDate > parentObjective.endDate) {
          errors.push({
            code: 'MISALIGNED_END_DATE',
            message: 'End date cannot be after parent objective end date',
            field: 'endDate',
            details: {
              objectiveEnd: objective.endDate,
              parentEnd: parentObjective.endDate
            }
          });
        }
      }

      // Responsible validations with public sector specifics
      if (!objective.responsible || objective.responsible.length === 0) {
        errors.push({
          code: 'NO_RESPONSIBLE',
          message: 'At least one responsible person must be assigned',
          field: 'responsible'
        });
      } else {
        // Validate responsible roles
        const validRoles = this.getValidPublicSectorRoles();
        const invalidRoles = objective.responsible.filter(role => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
          warnings.push({
            code: 'INVALID_ROLES',
            message: 'Some responsible roles may not be appropriate for public sector',
            field: 'responsible',
            details: { invalidRoles }
          });
        }
      }

      // Budget alignment validation
      if (objective.budget && !this.isAlignedWithBudget(objective)) {
        errors.push({
          code: 'BUDGET_MISALIGNMENT',
          message: 'Objective budget must align with approved fiscal planning',
          field: 'budget',
          details: { budget: objective.budget }
        });
      }

      // Indicators validations with public sector requirements
      if (!objective.indicators || objective.indicators.length === 0) {
        warnings.push({
          code: 'NO_INDICATORS',
          message: 'Objective should have at least one indicator',
          field: 'indicators'
        });
      } else {
        // Check for mandatory public sector indicators
        const hasTransparencyIndicator = objective.indicators.some(
          ind => ind.name.toLowerCase().includes('transparência') ||
                ind.name.toLowerCase().includes('transparency')
        );
        const hasEfficiencyIndicator = objective.indicators.some(
          ind => ind.name.toLowerCase().includes('eficiência') ||
                ind.name.toLowerCase().includes('efficiency')
        );

        if (!hasTransparencyIndicator) {
          warnings.push({
            code: 'MISSING_TRANSPARENCY_INDICATOR',
            message: 'Consider adding a transparency-related indicator',
            field: 'indicators'
          });
        }
        if (!hasEfficiencyIndicator) {
          warnings.push({
            code: 'MISSING_EFFICIENCY_INDICATOR',
            message: 'Consider adding an efficiency-related indicator',
            field: 'indicators'
          });
        }
      }

      logger.info('Objective alignment validation completed', {
        objectiveId: objective.id,
        errorsCount: errors.length,
        warningsCount: warnings.length
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logger.error('Error during objective alignment validation', error as Error, {
        objectiveId: objective.id
      });
      throw error;
    }
  }

  static validateIndicatorFormula(indicator: Indicator): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic field validations
      if (!indicator.name?.trim()) {
        errors.push({
          code: 'INVALID_NAME',
          message: 'Indicator name is required',
          field: 'name'
        });
      }

      if (!indicator.formula?.trim()) {
        errors.push({
          code: 'INVALID_FORMULA',
          message: 'Indicator formula is required',
          field: 'formula'
        });
      }

      // Value validations with public sector context
      if (indicator.targetValue <= indicator.baselineValue) {
        warnings.push({
          code: 'TARGET_NOT_AMBITIOUS',
          message: 'Target value should be greater than baseline for continuous improvement',
          field: 'targetValue',
          details: {
            baseline: indicator.baselineValue,
            target: indicator.targetValue
          }
        });
      }

      // Data source validation for public sector
      if (!indicator.dataSource?.trim()) {
        errors.push({
          code: 'MISSING_DATA_SOURCE',
          message: 'Data source must be specified for transparency and audit purposes',
          field: 'dataSource'
        });
      } else {
        // Validate official data sources
        const validSources = this.getValidPublicSectorDataSources();
        if (!validSources.includes(indicator.dataSource)) {
          warnings.push({
            code: 'UNOFFICIAL_DATA_SOURCE',
            message: 'Consider using official government systems as data sources',
            field: 'dataSource',
            details: { validSources }
          });
        }
      }

      // Formula syntax validation
      if (indicator.formula) {
        try {
          const formulaPattern = /^[\w\s+\-*/%().,]+$/;
          if (!formulaPattern.test(indicator.formula)) {
            errors.push({
              code: 'INVALID_FORMULA_SYNTAX',
              message: 'Formula contains invalid characters',
              field: 'formula'
            });
          }
        } catch (error) {
          errors.push({
            code: 'FORMULA_EVALUATION_ERROR',
            message: 'Formula cannot be evaluated',
            field: 'formula',
            details: { error: (error as Error).message }
          });
        }
      }

      // Measurement frequency validation for public sector reporting
      const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
      if (!validFrequencies.includes(indicator.measurementFrequency)) {
        errors.push({
          code: 'INVALID_FREQUENCY',
          message: 'Invalid measurement frequency for public sector reporting',
          field: 'measurementFrequency'
        });
      }

      // Responsible validation with public sector roles
      if (!indicator.responsible || indicator.responsible.length === 0) {
        errors.push({
          code: 'NO_RESPONSIBLE',
          message: 'At least one responsible person must be assigned',
          field: 'responsible'
        });
      }

      logger.info('Indicator formula validation completed', {
        indicatorId: indicator.id,
        errorsCount: errors.length,
        warningsCount: warnings.length
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logger.error('Error during indicator formula validation', error as Error, {
        indicatorId: indicator.id
      });
      throw error;
    }
  }

  static validateStrategicAlignment(objectives: StrategicObjective[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Build objective hierarchy
      const objectiveMap = new Map(objectives.map(obj => [obj.id, obj]));
      const rootObjectives = objectives.filter(obj => !obj.parentId);

      // Validate hierarchy
      if (rootObjectives.length === 0) {
        errors.push({
          code: 'NO_ROOT_OBJECTIVES',
          message: 'No root objectives found',
          field: 'hierarchy'
        });
      }

      // Validate strategic alignment
      objectives.forEach(objective => {
        if (objective.parentId) {
          const parent = objectiveMap.get(objective.parentId);
          if (!parent) {
            errors.push({
              code: 'INVALID_PARENT',
              message: `Parent objective not found: ${objective.parentId}`,
              field: 'parentId',
              details: { objectiveId: objective.id }
            });
          } else {
            // Validate type alignment
            const typeHierarchy = ['strategic', 'tactical', 'operational'];
            const objectiveTypeIndex = typeHierarchy.indexOf(objective.type);
            const parentTypeIndex = typeHierarchy.indexOf(parent.type);

            if (objectiveTypeIndex <= parentTypeIndex) {
              errors.push({
                code: 'INVALID_TYPE_HIERARCHY',
                message: `Invalid objective type hierarchy: ${parent.type} -> ${objective.type}`,
                field: 'type',
                details: {
                  objectiveId: objective.id,
                  parentId: parent.id
                }
              });
            }
          }
        }
      });

      // Validate alignment with government priorities
      if (!this.hasAlignmentWithGovernmentPriorities(objectives)) {
        warnings.push({
          code: 'MISSING_GOVERNMENT_ALIGNMENT',
          message: 'Strategic objectives should align with government priorities',
          field: 'alignment'
        });
      }

      // Validate coverage of key public sector areas
      const missingAreas = this.validatePublicSectorCoverage(objectives);
      if (missingAreas.length > 0) {
        warnings.push({
          code: 'INCOMPLETE_SECTOR_COVERAGE',
          message: 'Some key public sector areas may not be covered',
          field: 'coverage',
          details: { missingAreas }
        });
      }

      logger.info('Strategic alignment validation completed', {
        objectivesCount: objectives.length,
        errorsCount: errors.length,
        warningsCount: warnings.length
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logger.error('Error during strategic alignment validation', error as Error);
      throw error;
    }
  }

  private static isAlignedWithFiscalPlanning(startYear: number, endYear: number): boolean {
    // Implement fiscal year alignment logic
    const currentPPAYears = this.getCurrentPPAYears();
    return startYear >= currentPPAYears.start && endYear <= currentPPAYears.end;
  }

  private static getCurrentPPAYears(): { start: number; end: number } {
    const currentYear = new Date().getFullYear();
    const ppaCycle = Math.floor(currentYear / 4) * 4;
    return {
      start: ppaCycle,
      end: ppaCycle + 3
    };
  }

  private static getValidPublicSectorRoles(): string[] {
    return [
      'Secretário',
      'Diretor',
      'Coordenador',
      'Assessor',
      'Superintendente',
      'Ouvidor',
      'Auditor',
      'Procurador'
    ];
  }

  private static getValidPublicSectorDataSources(): string[] {
    return [
      'SIAFI',
      'SIAPE',
      'SEI',
      'SIASG',
      'Portal da Transparência',
      'e-SIC',
      'SIGPLAN',
      'SIOP'
    ];
  }

  private static isAlignedWithBudget(objective: StrategicObjective): boolean {
    // Implement budget alignment validation
    return true; // Placeholder
  }

  private static hasAlignmentWithGovernmentPriorities(objectives: StrategicObjective[]): boolean {
    const priorityKeywords = [
      'transparência',
      'eficiência',
      'participação social',
      'sustentabilidade',
      'inclusão',
      'digitalização',
      'modernização'
    ];

    return objectives.some(obj =>
      priorityKeywords.some(keyword =>
        obj.name.toLowerCase().includes(keyword) ||
        obj.description.toLowerCase().includes(keyword)
      )
    );
  }

  private static validatePublicSectorCoverage(objectives: StrategicObjective[]): string[] {
    const requiredAreas = [
      'transparência',
      'eficiência',
      'atendimento ao cidadão',
      'gestão de recursos',
      'governança',
      'compliance'
    ];

    const coveredAreas = new Set<string>();
    objectives.forEach(obj => {
      requiredAreas.forEach(area => {
        if (
          obj.name.toLowerCase().includes(area) ||
          obj.description.toLowerCase().includes(area)
        ) {
          coveredAreas.add(area);
        }
      });
    });

    return requiredAreas.filter(area => !coveredAreas.has(area));
  }
} 