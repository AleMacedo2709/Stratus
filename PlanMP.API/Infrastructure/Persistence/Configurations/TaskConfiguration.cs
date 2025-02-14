using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlanMP.API.Domain.Entities;

namespace PlanMP.API.Infrastructure.Persistence.Configurations;

public class TaskConfiguration : IEntityTypeConfiguration<Task>
{
    public void Configure(EntityTypeBuilder<Task> builder)
    {
        builder.ToTable("Tasks");

        builder.HasKey(t => t.TaskId);

        builder.Property(t => t.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        builder.Property(t => t.Priority)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.Progress)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(t => t.ImpactWeight)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(t => t.StrategicWeight)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(t => t.RiskLevel)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.CostImpact)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.HasOne(t => t.Initiative)
            .WithMany(i => i.Tasks)
            .HasForeignKey(t => t.InitiativeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Assignee)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.Tags)
            .WithOne(tt => tt.Task)
            .HasForeignKey(tt => tt.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Dependencies)
            .WithOne(td => td.Task)
            .HasForeignKey(td => td.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.DependentTasks)
            .WithOne(td => td.DependencyTask)
            .HasForeignKey(td => td.DependencyTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.Priority);
        builder.HasIndex(t => t.AssigneeId);
        builder.HasIndex(t => t.InitiativeId);
        builder.HasIndex(t => t.EndDate);
    }
} 