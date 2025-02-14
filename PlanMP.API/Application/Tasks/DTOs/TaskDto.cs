using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Tasks.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; }
    public TaskStatus Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string AssigneeId { get; set; } = string.Empty;
    public string AssigneeName { get; set; } = string.Empty;
    public decimal Progress { get; set; }
    public int InitiativeId { get; set; }
    public string InitiativeName { get; set; } = string.Empty;
    public decimal ImpactWeight { get; set; }
    public decimal StrategicWeight { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public CostImpact CostImpact { get; set; }
    public List<TaskTagDto> Tags { get; set; } = new();
    public List<TaskDependencyDto> Dependencies { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

public class TaskTagDto
{
    public int TagId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class TaskDependencyDto
{
    public int TaskId { get; set; }
    public string Name { get; set; } = string.Empty;
    public TaskStatus Status { get; set; }
    public decimal Progress { get; set; }
}

public class TaskHistoryDto
{
    public int Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ChangedBy { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public Dictionary<string, object> Changes { get; set; } = new();
}

public class TaskDashboardDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int DelayedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public decimal AverageProgress { get; set; }
    public List<TasksByPriorityDto> TasksByPriority { get; set; } = new();
    public List<TasksByStatusDto> TasksByStatus { get; set; } = new();
    public List<TasksByAssigneeDto> TasksByAssignee { get; set; } = new();
    public List<TasksByRiskDto> TasksByRisk { get; set; } = new();
    public List<UpcomingTaskDto> UpcomingTasks { get; set; } = new();
}

public class TasksByPriorityDto
{
    public TaskPriority Priority { get; set; }
    public int Count { get; set; }
    public decimal Progress { get; set; }
}

public class TasksByStatusDto
{
    public TaskStatus Status { get; set; }
    public int Count { get; set; }
}

public class TasksByAssigneeDto
{
    public string AssigneeId { get; set; } = string.Empty;
    public string AssigneeName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int DelayedTasks { get; set; }
    public decimal AverageProgress { get; set; }
}

public class TasksByRiskDto
{
    public RiskLevel RiskLevel { get; set; }
    public int Count { get; set; }
    public decimal AverageProgress { get; set; }
}

public class UpcomingTaskDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime EndDate { get; set; }
    public TaskPriority Priority { get; set; }
    public decimal Progress { get; set; }
    public string AssigneeName { get; set; } = string.Empty;
} 