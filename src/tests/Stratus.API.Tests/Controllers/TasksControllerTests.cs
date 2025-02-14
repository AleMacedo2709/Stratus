using System;
using System.Threading.Tasks;
using Xunit;
using Stratus.API.Controllers;
using Stratus.API.Commands;
using Stratus.API.DTOs;
using Stratus.API.Services;

namespace Stratus.API.Tests.Controllers
{
    public class TasksControllerTests
    {
        [Fact]
        public async Task CreateTask_ShouldReturnCreatedTask()
        {
            // Arrange
            var command = new CreateTaskCommand
            {
                Name = "Tarefa de Teste",
                Description = "Descrição da Tarefa de Teste",
                Priority = TaskPriority.Alta,
                Status = TaskStatus.Nao_Iniciado,
                DueDate = DateTime.Now.AddDays(7),
                AssigneeId = 1,
                ProjectId = 1
            };

            var expectedTask = new TaskDto
            {
                Id = 1,
                Name = "Tarefa de Teste",
                Description = "Descrição da Tarefa de Teste",
                Priority = TaskPriority.Alta,
                Status = TaskStatus.Nao_Iniciado,
                DueDate = command.DueDate,
                AssigneeId = 1,
                ProjectId = 1
            };

            // ... existing code ...
        }

        [Fact]
        public async Task UpdateTaskStatus_ShouldReturnUpdatedTask()
        {
            // Arrange
            var taskId = 1;
            var command = new UpdateTaskStatusCommand
            {
                TaskId = taskId,
                NewStatus = TaskStatus.Em_Andamento
            };

            var updatedTask = new TaskDto
            {
                Id = taskId,
                Name = "Tarefa de Teste",
                Description = "Descrição da Tarefa de Teste",
                Priority = TaskPriority.Alta,
                Status = TaskStatus.Em_Andamento,
                DueDate = DateTime.Now.AddDays(7),
                AssigneeId = 1,
                ProjectId = 1
            };

            // ... existing code ...
        }
    }
} 