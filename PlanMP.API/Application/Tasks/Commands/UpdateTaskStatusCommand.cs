using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PlanMP.API.Application.Common.Exceptions;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Tasks.Commands;

public class UpdateTaskStatusCommand : IRequest
{
    public int Id { get; set; }
    public TaskStatus NewStatus { get; set; }
}

public class UpdateTaskStatusCommandValidator : AbstractValidator<UpdateTaskStatusCommand>
{
    public UpdateTaskStatusCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty();

        RuleFor(v => v.NewStatus)
            .IsInEnum();
    }
}

public class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateTaskStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(Task), request.Id);
        }

        // Check if user has permission to update this task
        var userId = _currentUserService.UserId;
        var userArea = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.AreaId)
            .FirstOrDefaultAsync(cancellationToken);

        var taskArea = await _context.Tasks
            .Where(t => t.TaskId == request.Id)
            .Include(t => t.Initiative)
            .ThenInclude(i => i.Action)
            .Select(t => t.Initiative.Action.AreaId)
            .FirstOrDefaultAsync(cancellationToken);

        if (userArea != taskArea && !await _context.UnitPermissions
            .AnyAsync(p => p.UserId == userId && p.UnitId == taskArea && p.Actions.Contains("Edit"), cancellationToken))
        {
            throw new ForbiddenAccessException();
        }

        // Check if all dependencies are completed when marking as completed
        if (request.NewStatus == TaskStatus.Completed)
        {
            var hasUncompletedDependencies = await _context.TaskDependencies
                .Include(td => td.DependencyTask)
                .Where(td => td.TaskId == request.Id)
                .AnyAsync(td => td.DependencyTask.Status != TaskStatus.Completed, cancellationToken);

            if (hasUncompletedDependencies)
            {
                throw new ValidationException("Cannot mark task as completed while it has uncompleted dependencies.");
            }
        }

        task.UpdateStatus(request.NewStatus, userId);

        await _context.SaveChangesAsync(cancellationToken);

        // Update initiative progress
        await _context.Database
            .ExecuteSqlRawAsync(
                "EXEC sp_UpdateInitiativeProgress @InitiativeID",
                new SqlParameter("@InitiativeID", task.InitiativeId));
    }
} 