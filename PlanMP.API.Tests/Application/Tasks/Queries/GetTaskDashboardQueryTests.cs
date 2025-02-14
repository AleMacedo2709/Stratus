using AutoMapper;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Application.Tasks.DTOs;
using PlanMP.API.Application.Tasks.Queries;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace PlanMP.API.Tests.Application.Tasks.Queries;

public class GetTaskDashboardQueryTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<IDateTime> _dateTimeMock;

    public GetTaskDashboardQueryTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _mapperMock = new Mock<IMapper>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _dateTimeMock = new Mock<IDateTime>();
    }

    [Fact]
    public async Task Handle_ShouldReturnDashboardData_WhenUserHasAccess()
    {
        // Arrange
        var userId = "user1";
        var userAreaId = 1;
        var now = DateTime.UtcNow;
        var tasks = GetSampleTasks();
        var query = new GetTaskDashboardQuery();

        SetupMocks(userId, userAreaId, now, tasks);

        var handler = new GetTaskDashboardQueryHandler(
            _contextMock.Object,
            _mapperMock.Object,
            _currentUserServiceMock.Object,
            _dateTimeMock.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalTasks.Should().Be(tasks.Count);
        result.CompletedTasks.Should().Be(tasks.Count(t => t.Status == TaskStatus.Completed));
        result.DelayedTasks.Should().Be(tasks.Count(t => t.Status == TaskStatus.Delayed));
        result.InProgressTasks.Should().Be(tasks.Count(t => t.Status == TaskStatus.In_Progress));
        
        // Verify metrics calculations
        result.AverageProgress.Should().BeApproximately(
            tasks.Average(t => t.Progress),
            0.01);

        // Verify groupings
        result.TasksByPriority.Should().HaveCount(3); // Low, Medium, High
        result.TasksByStatus.Should().HaveCount(4);   // Not Started, In Progress, Completed, Delayed
        result.TasksByAssignee.Should().NotBeEmpty();
        result.TasksByRisk.Should().HaveCount(3);     // Low, Medium, High
        result.UpcomingTasks.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldFilterByUserArea_WhenUserHasNoSpecialPermissions()
    {
        // Arrange
        var userId = "user1";
        var userAreaId = 1;
        var now = DateTime.UtcNow;
        var tasks = GetSampleTasks();
        var query = new GetTaskDashboardQuery();

        SetupMocks(userId, userAreaId, now, tasks, hasSpecialPermissions: false);

        var handler = new GetTaskDashboardQueryHandler(
            _contextMock.Object,
            _mapperMock.Object,
            _currentUserServiceMock.Object,
            _dateTimeMock.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalTasks.Should().Be(
            tasks.Count(t => t.Initiative.Action.AreaId == userAreaId));
    }

    [Fact]
    public async Task Handle_ShouldIncludeUpcomingTasks_WithinNextSevenDays()
    {
        // Arrange
        var userId = "user1";
        var userAreaId = 1;
        var now = DateTime.UtcNow;
        var tasks = GetSampleTasks();
        var query = new GetTaskDashboardQuery();

        SetupMocks(userId, userAreaId, now, tasks);

        var handler = new GetTaskDashboardQueryHandler(
            _contextMock.Object,
            _mapperMock.Object,
            _currentUserServiceMock.Object,
            _dateTimeMock.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.UpcomingTasks.Should().OnlyContain(
            t => t.EndDate <= now.AddDays(7) && 
                 t.EndDate >= now);
    }

    private void SetupMocks(
        string userId,
        int userAreaId,
        DateTime now,
        List<Domain.Entities.Task> tasks,
        bool hasSpecialPermissions = true)
    {
        _currentUserServiceMock.Setup(x => x.UserId)
            .Returns(userId);

        _dateTimeMock.Setup(x => x.Now)
            .Returns(now);

        var usersDbSet = CreateDbSetMock(new List<User>
        {
            new() { Id = userId, AreaId = userAreaId }
        });

        var tasksDbSet = CreateDbSetMock(tasks);

        var permissionsDbSet = CreateDbSetMock(
            hasSpecialPermissions
                ? new List<UnitPermission>
                {
                    new() { UserId = userId, UnitId = userAreaId, Actions = new[] { "View" } }
                }
                : new List<UnitPermission>());

        _contextMock.Setup(x => x.Users)
            .Returns(usersDbSet.Object);

        _contextMock.Setup(x => x.Tasks)
            .Returns(tasksDbSet.Object);

        _contextMock.Setup(x => x.UnitPermissions)
            .Returns(permissionsDbSet.Object);
    }

    private static Mock<DbSet<T>> CreateDbSetMock<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var dbSetMock = new Mock<DbSet<T>>();

        dbSetMock.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        dbSetMock.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        dbSetMock.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        dbSetMock.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());

        return dbSetMock;
    }

    private static List<Domain.Entities.Task> GetSampleTasks()
    {
        var now = DateTime.UtcNow;
        return new List<Domain.Entities.Task>
        {
            new()
            {
                TaskId = 1,
                Name = "Tarefa 1",
                Status = TaskStatus.Em_Andamento,
                Priority = TaskPriority.Alta,
                Progress = 50,
                EndDate = now.AddDays(3),
                RiskLevel = RiskLevel.Alto,
                Initiative = new Initiative
                {
                    Action = new StrategicAction { AreaId = 1 }
                },
                Assignee = new User { Id = "user1", Name = "Usuário 1" }
            },
            new()
            {
                TaskId = 2,
                Name = "Tarefa 2",
                Status = TaskStatus.Concluido,
                Priority = TaskPriority.Media,
                Progress = 100,
                EndDate = now.AddDays(5),
                RiskLevel = RiskLevel.Medio,
                Initiative = new Initiative
                {
                    Action = new StrategicAction { AreaId = 1 }
                },
                Assignee = new User { Id = "user2", Name = "Usuário 2" }
            },
            new()
            {
                TaskId = 3,
                Name = "Tarefa 3",
                Status = TaskStatus.Atrasado,
                Priority = TaskPriority.Baixa,
                Progress = 25,
                EndDate = now.AddDays(2),
                RiskLevel = RiskLevel.Baixo,
                Initiative = new Initiative
                {
                    Action = new StrategicAction { AreaId = 2 }
                },
                Assignee = new User { Id = "user1", Name = "Usuário 1" }
            }
        };
    }
} 