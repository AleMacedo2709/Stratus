using PlanMP.API.Domain.Common;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Domain.Events;

public class TaskCreatedEvent : DomainEvent
{
    public Task Task { get; }

    public TaskCreatedEvent(Task task)
    {
        Task = task;
    }
}

public class TaskUpdatedEvent : DomainEvent
{
    public Task Task { get; }

    public TaskUpdatedEvent(Task task)
    {
        Task = task;
    }
}

public class TaskStatusChangedEvent : DomainEvent
{
    public Task Task { get; }
    public TaskStatus OldStatus { get; }
    public TaskStatus NewStatus { get; }
    public string ChangedBy { get; }

    public TaskStatusChangedEvent(Task task, TaskStatus oldStatus, TaskStatus newStatus, string changedBy)
    {
        Task = task;
        OldStatus = oldStatus;
        NewStatus = newStatus;
        ChangedBy = changedBy;
    }
}

public class TaskProgressUpdatedEvent : DomainEvent
{
    public Task Task { get; }
    public decimal OldProgress { get; }
    public decimal NewProgress { get; }
    public string UpdatedBy { get; }

    public TaskProgressUpdatedEvent(Task task, decimal oldProgress, decimal newProgress, string updatedBy)
    {
        Task = task;
        OldProgress = oldProgress;
        NewProgress = newProgress;
        UpdatedBy = updatedBy;
    }
}

public class TaskAssignedEvent : DomainEvent
{
    public Task Task { get; }
    public string OldAssigneeId { get; }
    public string NewAssigneeId { get; }
    public string AssignedBy { get; }

    public TaskAssignedEvent(Task task, string oldAssigneeId, string newAssigneeId, string assignedBy)
    {
        Task = task;
        OldAssigneeId = oldAssigneeId;
        NewAssigneeId = newAssigneeId;
        AssignedBy = assignedBy;
    }
}

public class TaskDeletedEvent : DomainEvent
{
    public Task Task { get; }
    public string DeletedBy { get; }

    public TaskDeletedEvent(Task task, string deletedBy)
    {
        Task = task;
        DeletedBy = deletedBy;
    }
} 