using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Common.Services;

public interface IStrategicCalculationService
{
    Task<decimal> CalculateInitiativeProgress(int initiativeId);
    Task<decimal> CalculateObjectiveProgress(int objectiveId);
    Task<decimal> CalculatePerspectiveProgress(int perspectiveId);
    Task<decimal> CalculateStrategicPlanProgress(int cycleId);
    Task<Dictionary<string, decimal>> CalculateKPIs(int cycleId);
    Task<(decimal Target, decimal Current, decimal Trend)> CalculateIndicatorMetrics(int indicatorId);
    Task<Dictionary<string, decimal>> CalculateRiskMetrics(int initiativeId);
}

public class StrategicCalculationService : IStrategicCalculationService
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTime _dateTime;
    private readonly ILogger<StrategicCalculationService> _logger;

    public StrategicCalculationService(
        IApplicationDbContext context,
        IDateTime dateTime,
        ILogger<StrategicCalculationService> logger)
    {
        _context = context;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<decimal> CalculateInitiativeProgress(int initiativeId)
    {
        try
        {
            var tasks = await _context.Tasks
                .Where(t => t.InitiativeId == initiativeId)
                .Select(t => new { t.Progress, t.ImpactWeight })
                .ToListAsync();

            if (!tasks.Any())
                return 0;

            var totalWeight = tasks.Sum(t => t.ImpactWeight);
            if (totalWeight == 0)
                return tasks.Average(t => t.Progress);

            return tasks.Sum(t => t.Progress * t.ImpactWeight) / totalWeight;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating initiative progress for ID {InitiativeId}", initiativeId);
            throw;
        }
    }

    public async Task<decimal> CalculateObjectiveProgress(int objectiveId)
    {
        try
        {
            var initiatives = await _context.Initiatives
                .Where(i => i.ObjectiveId == objectiveId)
                .Select(i => new { i.Id, i.StrategicWeight })
                .ToListAsync();

            if (!initiatives.Any())
                return 0;

            var progressList = new List<(decimal Progress, decimal Weight)>();

            foreach (var initiative in initiatives)
            {
                var progress = await CalculateInitiativeProgress(initiative.Id);
                progressList.Add((progress, initiative.StrategicWeight));
            }

            var totalWeight = progressList.Sum(p => p.Weight);
            if (totalWeight == 0)
                return progressList.Average(p => p.Progress);

            return progressList.Sum(p => p.Progress * p.Weight) / totalWeight;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating objective progress for ID {ObjectiveId}", objectiveId);
            throw;
        }
    }

    public async Task<decimal> CalculatePerspectiveProgress(int perspectiveId)
    {
        try
        {
            var objectives = await _context.Objectives
                .Where(o => o.PerspectiveId == perspectiveId)
                .Select(o => new { o.Id, o.Weight })
                .ToListAsync();

            if (!objectives.Any())
                return 0;

            var progressList = new List<(decimal Progress, decimal Weight)>();

            foreach (var objective in objectives)
            {
                var progress = await CalculateObjectiveProgress(objective.Id);
                progressList.Add((progress, objective.Weight));
            }

            var totalWeight = progressList.Sum(p => p.Weight);
            if (totalWeight == 0)
                return progressList.Average(p => p.Progress);

            return progressList.Sum(p => p.Progress * p.Weight) / totalWeight;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating perspective progress for ID {PerspectiveId}", perspectiveId);
            throw;
        }
    }

    public async Task<decimal> CalculateStrategicPlanProgress(int cycleId)
    {
        try
        {
            var perspectives = await _context.Perspectives
                .Where(p => p.StrategicCycleId == cycleId)
                .Select(p => new { p.Id, p.Weight })
                .ToListAsync();

            if (!perspectives.Any())
                return 0;

            var progressList = new List<(decimal Progress, decimal Weight)>();

            foreach (var perspective in perspectives)
            {
                var progress = await CalculatePerspectiveProgress(perspective.Id);
                progressList.Add((progress, perspective.Weight));
            }

            var totalWeight = progressList.Sum(p => p.Weight);
            if (totalWeight == 0)
                return progressList.Average(p => p.Progress);

            return progressList.Sum(p => p.Progress * p.Weight) / totalWeight;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating strategic plan progress for cycle ID {CycleId}", cycleId);
            throw;
        }
    }

    public async Task<Dictionary<string, decimal>> CalculateKPIs(int cycleId)
    {
        try
        {
            var now = _dateTime.Now;
            var indicators = await _context.Indicators
                .Where(i => i.StrategicCycleId == cycleId)
                .Include(i => i.Measurements)
                .ToListAsync();

            var kpis = new Dictionary<string, decimal>();

            // Calcula KPIs gerais
            kpis["OverallProgress"] = await CalculateStrategicPlanProgress(cycleId);
            kpis["CompletedObjectives"] = await _context.Objectives
                .Where(o => o.StrategicCycleId == cycleId && o.Status == ObjectiveStatus.Completed)
                .CountAsync();

            // Calcula métricas de indicadores
            kpis["IndicatorsOnTarget"] = indicators.Count(i => IsIndicatorOnTarget(i));
            kpis["IndicatorsAtRisk"] = indicators.Count(i => IsIndicatorAtRisk(i));
            kpis["IndicatorsCritical"] = indicators.Count(i => IsIndicatorCritical(i));

            // Calcula tendências
            kpis["PositiveTrend"] = indicators.Count(i => CalculateIndicatorTrend(i) > 0);
            kpis["NegativeTrend"] = indicators.Count(i => CalculateIndicatorTrend(i) < 0);

            return kpis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating KPIs for cycle ID {CycleId}", cycleId);
            throw;
        }
    }

    public async Task<(decimal Target, decimal Current, decimal Trend)> CalculateIndicatorMetrics(int indicatorId)
    {
        try
        {
            var indicator = await _context.Indicators
                .Include(i => i.Measurements)
                .FirstOrDefaultAsync(i => i.Id == indicatorId);

            if (indicator == null)
                throw new NotFoundException(nameof(Indicator), indicatorId);

            var current = indicator.Measurements
                .OrderByDescending(m => m.Date)
                .FirstOrDefault()?.Value ?? 0;

            var trend = CalculateIndicatorTrend(indicator);

            return (indicator.TargetValue, current, trend);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating metrics for indicator ID {IndicatorId}", indicatorId);
            throw;
        }
    }

    public async Task<Dictionary<string, decimal>> CalculateRiskMetrics(int initiativeId)
    {
        try
        {
            var tasks = await _context.Tasks
                .Where(t => t.InitiativeId == initiativeId)
                .ToListAsync();

            var metrics = new Dictionary<string, decimal>
            {
                ["HighRiskPercentage"] = CalculateRiskPercentage(tasks, RiskLevel.High),
                ["MediumRiskPercentage"] = CalculateRiskPercentage(tasks, RiskLevel.Medium),
                ["LowRiskPercentage"] = CalculateRiskPercentage(tasks, RiskLevel.Low),
                ["DelayedTasksPercentage"] = CalculateDelayedPercentage(tasks),
                ["RiskExposureIndex"] = CalculateRiskExposureIndex(tasks)
            };

            return metrics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating risk metrics for initiative ID {InitiativeId}", initiativeId);
            throw;
        }
    }

    private bool IsIndicatorOnTarget(Indicator indicator)
    {
        var currentValue = indicator.Measurements
            .OrderByDescending(m => m.Date)
            .FirstOrDefault()?.Value ?? 0;

        var targetValue = indicator.TargetValue;
        var tolerance = indicator.Tolerance ?? 0.1m; // 10% default tolerance

        return Math.Abs(currentValue - targetValue) <= (targetValue * tolerance);
    }

    private bool IsIndicatorAtRisk(Indicator indicator)
    {
        var currentValue = indicator.Measurements
            .OrderByDescending(m => m.Date)
            .FirstOrDefault()?.Value ?? 0;

        var targetValue = indicator.TargetValue;
        var tolerance = indicator.Tolerance ?? 0.1m;
        var riskThreshold = tolerance * 2;

        return Math.Abs(currentValue - targetValue) <= (targetValue * riskThreshold) &&
               !IsIndicatorOnTarget(indicator);
    }

    private bool IsIndicatorCritical(Indicator indicator)
    {
        return !IsIndicatorOnTarget(indicator) && !IsIndicatorAtRisk(indicator);
    }

    private decimal CalculateIndicatorTrend(Indicator indicator)
    {
        var measurements = indicator.Measurements
            .OrderByDescending(m => m.Date)
            .Take(3)
            .ToList();

        if (measurements.Count < 2)
            return 0;

        var latest = measurements[0].Value;
        var previous = measurements[^1].Value;

        return (latest - previous) / previous;
    }

    private decimal CalculateRiskPercentage(List<Domain.Entities.Task> tasks, RiskLevel level)
    {
        if (!tasks.Any())
            return 0;

        return (decimal)tasks.Count(t => t.RiskLevel == level) / tasks.Count * 100;
    }

    private decimal CalculateDelayedPercentage(List<Domain.Entities.Task> tasks)
    {
        if (!tasks.Any())
            return 0;

        return (decimal)tasks.Count(t => t.Status == TaskStatus.Delayed) / tasks.Count * 100;
    }

    private decimal CalculateRiskExposureIndex(List<Domain.Entities.Task> tasks)
    {
        if (!tasks.Any())
            return 0;

        var riskWeights = new Dictionary<RiskLevel, decimal>
        {
            [RiskLevel.High] = 1.0m,
            [RiskLevel.Medium] = 0.5m,
            [RiskLevel.Low] = 0.25m
        };

        var weightedRiskSum = tasks.Sum(t => riskWeights[t.RiskLevel] * t.ImpactWeight);
        var totalWeight = tasks.Sum(t => t.ImpactWeight);

        return weightedRiskSum / totalWeight * 100;
    }
} 