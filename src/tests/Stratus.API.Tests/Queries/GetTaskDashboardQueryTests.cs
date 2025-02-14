using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Stratus.API.Tests.Queries
{
    public class GetTaskDashboardQueryTests
    {
        [Fact]
        public async Task Handle_ShouldReturnTaskDashboardData()
        {
            // Arrange
            var tasks = new List<TaskDto>
            {
                new TaskDto
                {
                    Id = 1,
                    Name = "Tarefa 1",
                    Description = "Descrição da Tarefa 1",
                    Status = TaskStatus.Em_Andamento,
                    Priority = TaskPriority.Alta,
                    DueDate = DateTime.Now.AddDays(1),
                    AssigneeId = 1,
                    Assignee = new UserDto { Id = 1, Name = "Usuário 1" }
                },
                new TaskDto
                {
                    Id = 2,
                    Name = "Tarefa 2",
                    Description = "Descrição da Tarefa 2",
                    Status = TaskStatus.Concluido,
                    Priority = TaskPriority.Media,
                    DueDate = DateTime.Now.AddDays(2),
                    AssigneeId = 2,
                    Assignee = new UserDto { Id = 2, Name = "Usuário 2" }
                },
                new TaskDto
                {
                    Id = 3,
                    Name = "Tarefa 3",
                    Description = "Descrição da Tarefa 3",
                    Status = TaskStatus.Atrasado,
                    Priority = TaskPriority.Baixa,
                    DueDate = DateTime.Now.AddDays(-1),
                    AssigneeId = 1,
                    Assignee = new UserDto { Id = 1, Name = "Usuário 1" }
                }
            };

            var expectedDashboard = new TaskDashboardDto
            {
                TotalTasks = 3,
                TasksByStatus = new Dictionary<string, int>
                {
                    { TaskStatus.Em_Andamento.ToString(), 1 },
                    { TaskStatus.Concluido.ToString(), 1 },
                    { TaskStatus.Atrasado.ToString(), 1 }
                },
                TasksByPriority = new Dictionary<string, int>
                {
                    { TaskPriority.Alta.ToString(), 1 },
                    { TaskPriority.Media.ToString(), 1 },
                    { TaskPriority.Baixa.ToString(), 1 }
                },
                OverdueTasks = 1,
                DueTodayTasks = 0
            };

            // ... existing code ...
        }
    }
} 