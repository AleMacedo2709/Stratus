import { logger } from '../monitoring/logger';
import { DatabaseService } from '../database';
import { environment } from '@/config/environment';

export interface CalculationResult {
  value: number;
  metadata: {
    formula: string;
    variables: Record<string, number>;
    intermediateResults?: Record<string, number>;
  };
}

export interface PublicSectorMetrics {
  efficiency: {
    costPerService: number;
    processTime: number;
    resourceUtilization: number;
  };
  transparency: {
    dataAvailability: number;
    informationAccess: number;
    responseTime: number;
  };
  governance: {
    complianceRate: number;
    controlEffectiveness: number;
    riskManagement: number;
  };
  socialImpact: {
    citizenSatisfaction: number;
    serviceAccessibility: number;
    socialParticipation: number;
  };
}

export class StrategicCalculationService {
  static async calculateIndicatorValue(
    indicatorId: string,
    variables: Record<string, number>
  ): Promise<CalculationResult> {
    try {
      // Get indicator formula
      const query = `
        SELECT Formula
        FROM Indicators
        WHERE IndicatorID = @indicatorId
      `;

      const result = await DatabaseService.query(query, [indicatorId]);
      
      if (!result || result.length === 0) {
        throw new Error(`Indicator not found: ${indicatorId}`);
      }

      const formula = (result[0] as { Formula: string }).Formula;
      
      // Calculate the result
      const calculationResult = this.evaluateFormula(formula, variables);

      logger.info('Indicator value calculated successfully', {
        indicatorId,
        result: calculationResult
      });

      return calculationResult;
    } catch (error) {
      logger.error('Failed to calculate indicator value', error as Error, {
        indicatorId,
        variables
      });
      throw error;
    }
  }

  private static evaluateFormula(
    formula: string,
    variables: Record<string, number>
  ): CalculationResult {
    try {
      // Replace variables in formula with their values
      let evaluableFormula = formula;
      const intermediateResults: Record<string, number> = {};

      Object.entries(variables).forEach(([key, value]) => {
        evaluableFormula = evaluableFormula.replace(
          new RegExp(key, 'g'),
          value.toString()
        );
      });

      // Evaluate the formula
      // Note: In a production environment, you should use a proper formula parser
      // that can safely evaluate mathematical expressions
      const value = Number(eval(evaluableFormula));

      return {
        value,
        metadata: {
          formula,
          variables,
          intermediateResults
        }
      };
    } catch (error) {
      throw new Error(`Failed to evaluate formula: ${formula}`);
    }
  }

  static async calculatePublicSectorMetrics(
    objectiveId: string
  ): Promise<PublicSectorMetrics> {
    try {
      // Calculate efficiency metrics
      const efficiency = await this.calculateEfficiencyMetrics(objectiveId);
      
      // Calculate transparency metrics
      const transparency = await this.calculateTransparencyMetrics(objectiveId);
      
      // Calculate governance metrics
      const governance = await this.calculateGovernanceMetrics(objectiveId);
      
      // Calculate social impact metrics
      const socialImpact = await this.calculateSocialImpactMetrics(objectiveId);

      return {
        efficiency,
        transparency,
        governance,
        socialImpact
      };
    } catch (error) {
      logger.error('Failed to calculate public sector metrics', error as Error, {
        objectiveId
      });
      throw error;
    }
  }

  private static async calculateEfficiencyMetrics(
    objectiveId: string
  ): Promise<PublicSectorMetrics['efficiency']> {
    const query = `
      SELECT 
        AVG(CostPerService) as avgCost,
        AVG(ProcessTime) as avgTime,
        AVG(ResourceUtilization) as avgUtilization
      FROM EfficiencyMetrics
      WHERE ObjectiveID = @objectiveId
      AND Timestamp >= DATEADD(month, -3, GETDATE())
    `;

    const result = await DatabaseService.query(query, [objectiveId]);
    
    return {
      costPerService: result[0]?.avgCost || 0,
      processTime: result[0]?.avgTime || 0,
      resourceUtilization: result[0]?.avgUtilization || 0
    };
  }

  private static async calculateTransparencyMetrics(
    objectiveId: string
  ): Promise<PublicSectorMetrics['transparency']> {
    const query = `
      SELECT 
        (COUNT(CASE WHEN IsPublic = 1 THEN 1 END) * 100.0 / COUNT(*)) as DataAvailability,
        AVG(AccessCount) as InformationAccess,
        AVG(ResponseTimeHours) as AvgResponseTime
      FROM TransparencyMetrics
      WHERE ObjectiveID = @objectiveId
      AND Timestamp >= DATEADD(month, -3, GETDATE())
    `;

    const result = await DatabaseService.query(query, [objectiveId]);
    
    return {
      dataAvailability: result[0]?.DataAvailability || 0,
      informationAccess: result[0]?.InformationAccess || 0,
      responseTime: result[0]?.AvgResponseTime || 0
    };
  }

  private static async calculateGovernanceMetrics(
    objectiveId: string
  ): Promise<PublicSectorMetrics['governance']> {
    const query = `
      SELECT 
        (ComplianceChecks * 100.0 / TotalChecks) as ComplianceRate,
        (EffectiveControls * 100.0 / TotalControls) as ControlEffectiveness,
        (MitigatedRisks * 100.0 / TotalRisks) as RiskManagement
      FROM GovernanceMetrics
      WHERE ObjectiveID = @objectiveId
      AND Timestamp >= DATEADD(month, -3, GETDATE())
    `;

    const result = await DatabaseService.query(query, [objectiveId]);
    
    return {
      complianceRate: result[0]?.ComplianceRate || 0,
      controlEffectiveness: result[0]?.ControlEffectiveness || 0,
      riskManagement: result[0]?.RiskManagement || 0
    };
  }

  private static async calculateSocialImpactMetrics(
    objectiveId: string
  ): Promise<PublicSectorMetrics['socialImpact']> {
    const query = `
      SELECT 
        AVG(SatisfactionScore) as Satisfaction,
        (AccessibleServices * 100.0 / TotalServices) as Accessibility,
        AVG(ParticipationRate) as Participation
      FROM SocialImpactMetrics
      WHERE ObjectiveID = @objectiveId
      AND Timestamp >= DATEADD(month, -3, GETDATE())
    `;

    const result = await DatabaseService.query(query, [objectiveId]);
    
    return {
      citizenSatisfaction: result[0]?.Satisfaction || 0,
      serviceAccessibility: result[0]?.Accessibility || 0,
      socialParticipation: result[0]?.Participation || 0
    };
  }

  static async calculateObjectiveProgress(objectiveId: string): Promise<number> {
    try {
      const query = `
        WITH RECURSIVE ObjectiveHierarchy AS (
          -- Base case: the objective itself
          SELECT 
            ObjectiveID,
            ParentID,
            CurrentProgress,
            Weight
          FROM StrategicObjectives
          WHERE ObjectiveID = @objectiveId

          UNION ALL

          -- Recursive case: child objectives
          SELECT 
            c.ObjectiveID,
            c.ParentID,
            c.CurrentProgress,
            c.Weight
          FROM StrategicObjectives c
          INNER JOIN ObjectiveHierarchy p ON c.ParentID = p.ObjectiveID
        )
        SELECT 
          CASE 
            WHEN COUNT(*) = 1 THEN MAX(CurrentProgress)
            ELSE SUM(CurrentProgress * COALESCE(Weight, 1)) / SUM(COALESCE(Weight, 1))
          END as Progress
        FROM ObjectiveHierarchy;
      `;

      const result = await DatabaseService.query(query, [objectiveId]);
      
      const progress = (result[0] as { Progress: number }).Progress || 0;

      logger.info('Objective progress calculated successfully', {
        objectiveId,
        progress
      });

      return progress;
    } catch (error) {
      logger.error('Failed to calculate objective progress', error as Error, {
        objectiveId
      });
      throw error;
    }
  }

  static async calculateRiskExposure(
    objectiveId: string
  ): Promise<{ exposure: number; factors: any[] }> {
    try {
      const query = `
        SELECT 
          r.RiskID,
          r.Probability,
          r.Impact,
          r.Severity,
          r.Status,
          COUNT(m.MitigationID) as MitigationCount,
          AVG(m.EffectivenessScore) as MitigationEffectiveness,
          r.ComplianceImpact,
          r.ReputationalImpact,
          r.SocialImpact
        FROM Risks r
        LEFT JOIN RiskMitigations m ON r.RiskID = m.RiskID
        WHERE r.ObjectiveID = @objectiveId
        AND r.Status = 'Ativo'
        GROUP BY 
          r.RiskID, r.Probability, r.Impact, r.Severity, 
          r.Status, r.ComplianceImpact, r.ReputationalImpact, r.SocialImpact
      `;

      const risks = await DatabaseService.query(query, [objectiveId]);
      
      let totalExposure = 0;
      const factors = risks.map((risk: any) => {
        const mitigationFactor = risk.MitigationCount > 0 
          ? (1 - (risk.MitigationEffectiveness || 0) / 100)
          : 1;

        // Calculate weighted risk exposure considering public sector impacts
        const baseExposure = risk.Severity * mitigationFactor;
        const complianceWeight = 0.3;
        const reputationalWeight = 0.3;
        const socialWeight = 0.4;

        const weightedExposure = baseExposure * (
          1 + 
          (risk.ComplianceImpact * complianceWeight) +
          (risk.ReputationalImpact * reputationalWeight) +
          (risk.SocialImpact * socialWeight)
        );

        totalExposure += weightedExposure;

        return {
          riskId: risk.RiskID,
          exposure: weightedExposure,
          mitigationFactor,
          severity: risk.Severity,
          complianceImpact: risk.ComplianceImpact,
          reputationalImpact: risk.ReputationalImpact,
          socialImpact: risk.SocialImpact
        };
      });

      logger.info('Risk exposure calculated successfully', {
        objectiveId,
        totalExposure,
        riskCount: factors.length
      });

      return {
        exposure: totalExposure,
        factors
      };
    } catch (error) {
      logger.error('Failed to calculate risk exposure', error as Error, {
        objectiveId
      });
      throw error;
    }
  }

  static async calculateResourceUtilization(
    objectiveId: string
  ): Promise<{ utilization: number; breakdown: any }> {
    try {
      const query = `
        SELECT 
          r.ResourceType,
          SUM(r.AllocatedAmount) as Allocated,
          SUM(r.UsedAmount) as Used,
          SUM(r.PlannedAmount) as Planned
        FROM Resources r
        WHERE r.ObjectiveID = @objectiveId
        GROUP BY r.ResourceType
      `;

      const resources = await DatabaseService.query(query, [objectiveId]);
      
      let totalUtilization = 0;
      const breakdown: Record<string, {
        allocated: number;
        used: number;
        planned: number;
        utilization: number;
      }> = {};

      resources.forEach((resource: any) => {
        const utilization = resource.Allocated > 0 
          ? (resource.Used / resource.Allocated) * 100
          : 0;

        breakdown[resource.ResourceType] = {
          allocated: resource.Allocated,
          used: resource.Used,
          planned: resource.Planned,
          utilization
        };

        totalUtilization += utilization;
      });

      const averageUtilization = resources.length > 0
        ? totalUtilization / resources.length
        : 0;

      logger.info('Resource utilization calculated successfully', {
        objectiveId,
        averageUtilization,
        resourceTypes: Object.keys(breakdown)
      });

      return {
        utilization: averageUtilization,
        breakdown
      };
    } catch (error) {
      logger.error('Failed to calculate resource utilization', error as Error, {
        objectiveId
      });
      throw error;
    }
  }

  static async calculatePerformanceScore(
    objectiveId: string
  ): Promise<{ score: number; components: any }> {
    try {
      // Get objective data
      const progressQuery = `
        SELECT 
          o.CurrentProgress,
          o.TargetProgress,
          COUNT(i.IndicatorID) as IndicatorCount,
          AVG(
            CASE 
              WHEN i.TargetValue = i.BaselineValue THEN 100
              ELSE (i.CurrentValue - i.BaselineValue) / 
                   (i.TargetValue - i.BaselineValue) * 100
            END
          ) as IndicatorProgress
        FROM StrategicObjectives o
        LEFT JOIN Indicators i ON o.ObjectiveID = i.ObjectiveID
        WHERE o.ObjectiveID = @objectiveId
        GROUP BY o.CurrentProgress, o.TargetProgress
      `;

      const progressResult = await DatabaseService.query(progressQuery, [objectiveId]);
      
      if (!progressResult || progressResult.length === 0) {
        throw new Error(`Objective not found: ${objectiveId}`);
      }

      const progressData = progressResult[0] as {
        CurrentProgress: number;
        TargetProgress: number;
        IndicatorCount: number;
        IndicatorProgress: number | null;
      };

      // Calculate risk impact
      const { exposure: riskExposure } = await this.calculateRiskExposure(objectiveId);
      
      // Calculate public sector metrics
      const publicSectorMetrics = await this.calculatePublicSectorMetrics(objectiveId);

      // Calculate final score components with public sector focus
      const components = {
        progress: progressData.CurrentProgress,
        indicatorProgress: progressData.IndicatorProgress || 0,
        riskFactor: Math.max(0, 100 - riskExposure),
        efficiency: publicSectorMetrics.efficiency.resourceUtilization,
        transparency: publicSectorMetrics.transparency.dataAvailability,
        governance: publicSectorMetrics.governance.complianceRate,
        socialImpact: publicSectorMetrics.socialImpact.citizenSatisfaction
      };

      // Calculate weighted score with public sector priorities
      const weights = {
        progress: 0.2,
        indicatorProgress: 0.2,
        riskFactor: 0.1,
        efficiency: 0.1,
        transparency: 0.15,
        governance: 0.15,
        socialImpact: 0.1
      };

      const score = Object.entries(components).reduce(
        (total, [key, value]) => total + (value * weights[key as keyof typeof weights]),
        0
      );

      logger.info('Performance score calculated successfully', {
        objectiveId,
        score,
        components
      });

      return {
        score,
        components
      };
    } catch (error) {
      logger.error('Failed to calculate performance score', error as Error, {
        objectiveId
      });
      throw error;
    }
  }

  static async getActiveStrategicCycle(): Promise<StrategicCycle | null> {
    const query = `
      SELECT *
      FROM StrategicCycles
      WHERE status = 'Ativo'
      AND startDate <= GETDATE()
      AND endDate >= GETDATE()
    `;
    // ... rest of the function
  }

  static calculateObjectiveProgress(objective: StrategicObjective): number {
    if (objective.status === 'Concluído') return 100;
    if (objective.status === 'Não iniciado') return 0;
    // ... rest of the function
  }

  static calculateInitiativeProgress(initiative: Initiative): number {
    if (initiative.status === 'Concluído') return 100;
    if (initiative.status === 'Não iniciado') return 0;
    // ... rest of the function
  }
} 