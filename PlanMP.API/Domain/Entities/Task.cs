using PlanMP.API.Domain.Common;
using PlanMP.API.Domain.Events;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Domain.Entities;

public class Task : BaseEntity
{
    public int TaskId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public TaskPriority Priority { get; private set; }
    public TaskStatus Status { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public string AssigneeId { get; private set; } = string.Empty;
    public decimal Progress { get; private set; }
    public int InitiativeId { get; private set; }
    public decimal ImpactWeight { get; private set; }
    public decimal StrategicWeight { get; private set; }
    public RiskLevel RiskLevel { get; private set; }
    public CostImpact CostImpact { get; private set; }

    public Initiative Initiative { get; private set; } = null!;
    public User Assignee { get; private set; } = null!;
    public ICollection<TaskTag> Tags { get; private set; } = new List<TaskTag>();
    public ICollection<TaskDependency> Dependencies { get; private set; } = new List<TaskDependency>();
    public ICollection<TaskDependency> DependentTasks { get; private set; } = new List<TaskDependency>();

    private Task() { } // Required by EF Core

    public Task(
        string name,
        string description,
        TaskPriority priority,
        DateTime endDate,
        string assigneeId,
        int initiativeId,
        decimal impactWeight,
        decimal strategicWeight,
        RiskLevel riskLevel,
        CostImpact costImpact,
        DateTime? startDate = null)
    {
        Name = name;
        Description = description;
        Priority = priority;
        Status = TaskStatus.Not_Started;
        StartDate = startDate;
        EndDate = endDate;
        AssigneeId = assigneeId;
        Progress = 0;
        InitiativeId = initiativeId;
        ImpactWeight = impactWeight;
        StrategicWeight = strategicWeight;
        RiskLevel = riskLevel;
        CostImpact = costImpact;

        AddDomainEvent(new TaskCreatedEvent(this));
    }

    public void UpdateStatus(TaskStatus newStatus, string userId)
    {
        if (Status == newStatus) return;

        var oldStatus = Status;
        Status = newStatus;

        // Update progress based on status
        Progress = newStatus switch
        {
            TaskStatus.Not_Started => 0,
            TaskStatus.In_Progress => 50,
            TaskStatus.Completed => 100,
            TaskStatus.Delayed => 25,
            _ => Progress
        };

        AddDomainEvent(new TaskStatusChangedEvent(this, oldStatus, newStatus, userId));
    }

    public void UpdateProgress(decimal newProgress, string userId)
    {
        if (Progress == newProgress) return;

        var oldProgress = Progress;
        Progress = newProgress;

        // Update status based on progress
        Status = (Progress, EndDate) switch
        {
            (0, _) => TaskStatus.Not_Started,
            (100, _) => TaskStatus.Completed,
            (_, var end) when end < DateTime.UtcNow => TaskStatus.Delayed,
            (> 0, _) => TaskStatus.In_Progress,
            _ => Status
        };

        AddDomainEvent(new TaskProgressUpdatedEvent(this, oldProgress, newProgress, userId));
    }

    public void AddTag(Tag tag)
    {
        if (!Tags.Any(t => t.TagId == tag.TagId))
        {
            Tags.Add(new TaskTag { Task = this, Tag = tag });
        }
    }

    public void RemoveTag(int tagId)
    {
        var tag = Tags.FirstOrDefault(t => t.TagId == tagId);
        if (tag != null)
        {
            Tags.Remove(tag);
        }
    }

    public void AddDependency(Task dependencyTask)
    {
        if (!Dependencies.Any(d => d.DependencyTaskId == dependencyTask.TaskId))
        {
            Dependencies.Add(new TaskDependency { Task = this, DependencyTask = dependencyTask });
        }
    }

    public void RemoveDependency(int dependencyTaskId)
    {
        var dependency = Dependencies.FirstOrDefault(d => d.DependencyTaskId == dependencyTaskId);
        if (dependency != null)
        {
            Dependencies.Remove(dependency);
        }
    }

    public void Update(
        string name,
        string description,
        TaskPriority priority,
        DateTime endDate,
        string assigneeId,
        decimal impactWeight,
        decimal strategicWeight,
        RiskLevel riskLevel,
        CostImpact costImpact,
        DateTime? startDate = null)
    {
        Name = name;
        Description = description;
        Priority = priority;
        StartDate = startDate;
        EndDate = endDate;
        AssigneeId = assigneeId;
        ImpactWeight = impactWeight;
        StrategicWeight = strategicWeight;
        RiskLevel = riskLevel;
        CostImpact = costImpact;

        AddDomainEvent(new TaskUpdatedEvent(this));
    }
} 