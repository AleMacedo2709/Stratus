using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Application.Common.Services;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;
using PlanMP.API.Tests.Common;
using Xunit;

namespace PlanMP.API.Tests.Application.Common.Services;

public class StrategicCalculationServiceTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<IDateTime> _dateTimeMock;
    private readonly Mock<ILogger<StrategicCalculationService>> _loggerMock;
    private readonly StrategicCalculationService _service;

    public StrategicCalculationServiceTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _dateTimeMock = new Mock<IDateTime>();
        _loggerMock = new Mock<ILogger<StrategicCalculationService>>();

        _service = new StrategicCalculationService(
            _contextMock.Object,
            _dateTimeMock.Object,
            _loggerMock.Object);

        SetupMockData();
    }

    [Fact]
    public async Task CalculateInitiativeProgress_ShouldReturnWeightedAverage()
    {
        // Arrange
        var tasks = new List<Domain.Entities.Task>
        {
            new Domain.Entities.Task("Task 1", "Description", TaskPriority.High, DateTime.Now.AddDays(7), "user1", 1, 0.6m, 0.4m, RiskLevel.Low, CostImpact.Low) { Progress = 100 },
            new Domain.Entities.Task("Task 2", "Description", TaskPriority.Medium, DateTime.Now.AddDays(7), "user2", 1, 0.4m, 0.6m, RiskLevel.Medium, CostImpact.Medium) { Progress = 50 }
        };

        SetupTasksDbSet(tasks);

        // Act
        var result = await _service.CalculateInitiativeProgress(1);

        // Assert
        Assert.Equal(80m, result); // (100 * 0.6 + 50 * 0.4)
    }

    [Fact]
    public async Task CalculateObjectiveProgress_ShouldReturnWeightedAverage()
    {
        // Arrange
        var initiatives = new List<Initiative>
        {
            new Initiative { Id = 1, ObjectiveId = 1, Weight = 0.7m },
            new Initiative { Id = 2, ObjectiveId = 1, Weight = 0.3m }
        };

        var tasks1 = new List<Domain.Entities.Task>
        {
            new Domain.Entities.Task("Task 1", "Description", TaskPriority.High, DateTime.Now.AddDays(7), "user1", 1, 1m, 1m, RiskLevel.Low, CostImpact.Low) { Progress = 100 }
        };

        var tasks2 = new List<Domain.Entities.Task>
        {
            new Domain.Entities.Task("Task 2", "Description", TaskPriority.Medium, DateTime.Now.AddDays(7), "user2", 2, 1m, 1m, RiskLevel.Medium, CostImpact.Medium) { Progress = 50 }
        };

        SetupInitiativesDbSet(initiatives);
        SetupTasksDbSet(tasks1.Concat(tasks2).ToList());

        // Act
        var result = await _service.CalculateObjectiveProgress(1);

        // Assert
        Assert.Equal(85m, result); // (100 * 0.7 + 50 * 0.3)
    }

    [Fact]
    public async Task CalculatePerspectiveProgress_ShouldReturnWeightedAverage()
    {
        // Arrange
        var objectives = new List<Objective>
        {
            new Objective { Id = 1, PerspectiveId = 1, Weight = 0.6m },
            new Objective { Id = 2, PerspectiveId = 1, Weight = 0.4m }
        };

        SetupObjectivesDbSet(objectives);
        SetupInitiativesAndTasks();

        // Act
        var result = await _service.CalculatePerspectiveProgress(1);

        // Assert
        Assert.Equal(70m, result); // (80 * 0.6 + 55 * 0.4)
    }

    [Fact]
    public async Task CalculateStrategicPlanProgress_ShouldReturnWeightedAverage()
    {
        // Arrange
        var perspectives = new List<Perspective>
        {
            new Perspective { Id = 1, CycleId = 1, Weight = 0.5m },
            new Perspective { Id = 2, CycleId = 1, Weight = 0.5m }
        };

        SetupPerspectivesDbSet(perspectives);
        SetupObjectivesAndInitiativesAndTasks();

        // Act
        var result = await _service.CalculateStrategicPlanProgress(1);

        // Assert
        Assert.Equal(65m, result); // (70 * 0.5 + 60 * 0.5)
    }

    [Fact]
    public async Task CalculateKPIs_ShouldReturnAllMetrics()
    {
        // Arrange
        var indicators = new List<Indicator>
        {
            new Indicator 
            { 
                Id = 1, 
                CycleId = 1, 
                CurrentValue = 80, 
                TargetValue = 100,
                History = new List<IndicatorMeasurement>
                {
                    new IndicatorMeasurement { Value = 75, Date = DateTime.Now.AddMonths(-1) },
                    new IndicatorMeasurement { Value = 80, Date = DateTime.Now }
                }
            }
        };

        SetupIndicatorsDbSet(indicators);

        // Act
        var result = await _service.CalculateKPIs(1);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.ContainsKey("OnTarget"));
        Assert.True(result.ContainsKey("Warning"));
        Assert.True(result.ContainsKey("Critical"));
        Assert.Equal(100m, result["OnTarget"]);
    }

    private void SetupMockData()
    {
        _dateTimeMock.Setup(x => x.Now).Returns(DateTime.Now);
    }

    private void SetupTasksDbSet(List<Domain.Entities.Task> tasks)
    {
        var mockDbSet = tasks.AsQueryable().BuildMockDbSet();
        _contextMock.Setup(c => c.Tasks).Returns(mockDbSet.Object);
    }

    private void SetupInitiativesDbSet(List<Initiative> initiatives)
    {
        var mockDbSet = initiatives.AsQueryable().BuildMockDbSet();
        _contextMock.Setup(c => c.Initiatives).Returns(mockDbSet.Object);
    }

    private void SetupObjectivesDbSet(List<Objective> objectives)
    {
        var mockDbSet = objectives.AsQueryable().BuildMockDbSet();
        _contextMock.Setup(c => c.Objectives).Returns(mockDbSet.Object);
    }

    private void SetupPerspectivesDbSet(List<Perspective> perspectives)
    {
        var mockDbSet = perspectives.AsQueryable().BuildMockDbSet();
        _contextMock.Setup(c => c.Perspectives).Returns(mockDbSet.Object);
    }

    private void SetupIndicatorsDbSet(List<Indicator> indicators)
    {
        var mockDbSet = indicators.AsQueryable().BuildMockDbSet();
        _contextMock.Setup(c => c.Indicators).Returns(mockDbSet.Object);
    }

    private void SetupInitiativesAndTasks()
    {
        var initiatives = new List<Initiative>
        {
            new Initiative { Id = 1, ObjectiveId = 1, Weight = 0.7m },
            new Initiative { Id = 2, ObjectiveId = 1, Weight = 0.3m }
        };

        var tasks = new List<Domain.Entities.Task>
        {
            new Domain.Entities.Task("Task 1", "Description", TaskPriority.High, DateTime.Now.AddDays(7), "user1", 1, 1m, 1m, RiskLevel.Low, CostImpact.Low) { Progress = 100 },
            new Domain.Entities.Task("Task 2", "Description", TaskPriority.Medium, DateTime.Now.AddDays(7), "user2", 2, 1m, 1m, RiskLevel.Medium, CostImpact.Medium) { Progress = 50 }
        };

        SetupInitiativesDbSet(initiatives);
        SetupTasksDbSet(tasks);
    }

    private void SetupObjectivesAndInitiativesAndTasks()
    {
        var objectives = new List<Objective>
        {
            new Objective { Id = 1, PerspectiveId = 1, Weight = 0.6m },
            new Objective { Id = 2, PerspectiveId = 1, Weight = 0.4m },
            new Objective { Id = 3, PerspectiveId = 2, Weight = 0.5m },
            new Objective { Id = 4, PerspectiveId = 2, Weight = 0.5m }
        };

        SetupObjectivesDbSet(objectives);
        SetupInitiativesAndTasks();
    }
} 