using FluentValidation;
using MediatR;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Domain.Entities;
using PlanMP.API.Domain.Enums;

namespace PlanMP.API.Application.Tasks.Commands;

public class CreateTaskCommand : IRequest<int>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string AssigneeId { get; set; } = string.Empty;
    public int InitiativeId { get; set; }
    public decimal ImpactWeight { get; set; }
    public decimal StrategicWeight { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public CostImpact CostImpact { get; set; }
    public List<int> TagIds { get; set; } = new();
    public List<int> DependencyIds { get; set; } = new();
}

public class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskCommandValidator()
    {
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

        RuleFor(v => v.InitiativeId)
            .GreaterThan(0);

        RuleFor(v => v.ImpactWeight)
            .InclusiveBetween(0, 100);

        RuleFor(v => v.StrategicWeight)
            .InclusiveBetween(0, 100);
    }
}

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;

    public CreateTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTime dateTime)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public async Task<int> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = new Task(
            request.Name,
            request.Description,
            request.Priority,
            request.EndDate,
            request.AssigneeId,
            request.InitiativeId,
            request.ImpactWeight,
            request.StrategicWeight,
            request.RiskLevel,
            request.CostImpact,
            request.StartDate);

        // Add tags
        if (request.TagIds.Any())
        {
            var tags = await _context.Tags
                .Where(t => request.TagIds.Contains(t.TagId))
                .ToListAsync(cancellationToken);

            foreach (var tag in tags)
            {
                task.AddTag(tag);
            }
        }

        // Add dependencies
        if (request.DependencyIds.Any())
        {
            var dependencies = await _context.Tasks
                .Where(t => request.DependencyIds.Contains(t.TaskId))
                .ToListAsync(cancellationToken);

            foreach (var dependency in dependencies)
            {
                task.AddDependency(dependency);
            }
        }

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync(cancellationToken);

        return task.TaskId;
    }
} 