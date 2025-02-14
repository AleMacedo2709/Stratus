using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Application.Tasks.DTOs;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Tasks.Queries;

public class GetTaskDashboardQuery : IRequest<TaskDashboardDto>
{
    // Empty query since we'll get all metrics for the current user's scope
}

public class GetTaskDashboardQueryHandler : IRequestHandler<GetTaskDashboardQuery, TaskDashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;

    public GetTaskDashboardQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService,
        IDateTime dateTime)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public async Task<TaskDashboardDto> Handle(GetTaskDashboardQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var userArea = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.AreaId)
            .FirstOrDefaultAsync(cancellationToken);

        // Get tasks for user's area or where user has permissions
        var tasksQuery = _context.Tasks
            .Include(t => t.Initiative)
            .ThenInclude(i => i.Action)
            .Include(t => t.Assignee)
            .Where(t => t.Initiative.Action.AreaId == userArea ||
                       _context.UnitPermissions.Any(p => p.UserId == userId && 
                                                       p.UnitId == t.Initiative.Action.AreaId && 
                                                       p.Actions.Contains("View")));

        // Calculate basic metrics
        var tasks = await tasksQuery.ToListAsync(cancellationToken);
        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == TaskStatus.Completed);
        var delayedTasks = tasks.Count(t => t.Status == TaskStatus.Delayed);
        var inProgressTasks = tasks.Count(t => t.Status == TaskStatus.In_Progress);
        var averageProgress = tasks.Any() ? tasks.Average(t => t.Progress) : 0;

        // Group tasks by priority
        var tasksByPriority = await tasksQuery
            .GroupBy(t => t.Priority)
            .Select(g => new TasksByPriorityDto
            {
                Priority = g.Key,
                Count = g.Count(),
                Progress = g.Average(t => t.Progress)
            })
            .ToListAsync(cancellationToken);

        // Group tasks by status
        var tasksByStatus = await tasksQuery
            .GroupBy(t => t.Status)
            .Select(g => new TasksByStatusDto
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        // Group tasks by assignee
        var tasksByAssignee = await tasksQuery
            .GroupBy(t => new { t.AssigneeId, t.Assignee.Name })
            .Select(g => new TasksByAssigneeDto
            {
                AssigneeId = g.Key.AssigneeId,
                AssigneeName = g.Key.Name,
                TotalTasks = g.Count(),
                CompletedTasks = g.Count(t => t.Status == TaskStatus.Completed),
                DelayedTasks = g.Count(t => t.Status == TaskStatus.Delayed),
                AverageProgress = g.Average(t => t.Progress)
            })
            .ToListAsync(cancellationToken);

        // Group tasks by risk level
        var tasksByRisk = await tasksQuery
            .GroupBy(t => t.RiskLevel)
            .Select(g => new TasksByRiskDto
            {
                RiskLevel = g.Key,
                Count = g.Count(),
                AverageProgress = g.Average(t => t.Progress)
            })
            .ToListAsync(cancellationToken);

        // Get upcoming tasks (next 7 days)
        var nextWeek = _dateTime.Now.AddDays(7);
        var upcomingTasks = await tasksQuery
            .Where(t => t.EndDate <= nextWeek && 
                       t.Status != TaskStatus.Completed)
            .OrderBy(t => t.EndDate)
            .Take(5)
            .Select(t => new UpcomingTaskDto
            {
                Id = t.TaskId,
                Name = t.Name,
                EndDate = t.EndDate,
                Priority = t.Priority,
                Progress = t.Progress,
                AssigneeName = t.Assignee.Name
            })
            .ToListAsync(cancellationToken);

        return new TaskDashboardDto
        {
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            DelayedTasks = delayedTasks,
            InProgressTasks = inProgressTasks,
            AverageProgress = averageProgress,
            TasksByPriority = tasksByPriority,
            TasksByStatus = tasksByStatus,
            TasksByAssignee = tasksByAssignee,
            TasksByRisk = tasksByRisk,
            UpcomingTasks = upcomingTasks
        };
    }
} 