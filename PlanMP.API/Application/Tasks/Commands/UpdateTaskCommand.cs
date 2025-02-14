using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PlanMP.API.Application.Common.Exceptions;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Tasks.Commands;

public class UpdateTaskCommand : IRequest
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string AssigneeId { get; set; } = string.Empty;
    public decimal ImpactWeight { get; set; }
    public decimal StrategicWeight { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public CostImpact CostImpact { get; set; }
}

public class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
{
    public UpdateTaskCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty();

        RuleFor(v => v.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(v => v.Description)
            .MaximumLength(2000);

        RuleFor(v => v.EndDate)
            .NotEmpty()
            .GreaterThan(DateTime.UtcNow);

        RuleFor(v => v.AssigneeId)
            .NotEmpty();

        RuleFor(v => v.ImpactWeight)
            .InclusiveBetween(0, 100);

        RuleFor(v => v.StrategicWeight)
            .InclusiveBetween(0, 100);
    }
}

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
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

        task.Update(
            request.Name,
            request.Description,
            request.Priority,
            request.EndDate,
            request.AssigneeId,
            request.ImpactWeight,
            request.StrategicWeight,
            request.RiskLevel,
            request.CostImpact,
            request.StartDate);

        await _context.SaveChangesAsync(cancellationToken);
    }
} 