using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using PlanMP.API.Application.Tasks.Commands;
using PlanMP.API.Application.Tasks.DTOs;
using PlanMP.API.Domain.Enums;
using Xunit;

namespace PlanMP.API.Tests.Integration.Controllers;

public class TasksControllerTests : IntegrationTestBase
{
    public TasksControllerTests(WebApplicationFactory<Program> factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task GetTasks_ShouldReturnPaginatedList()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        await CreateTestTask();

        // Act
        var response = await _client.GetAsync("/api/tasks?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PaginatedList<TaskDto>>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        result.TotalCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetTask_ShouldReturnTask_WhenExists()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var taskId = await CreateTestTask();

        // Act
        var response = await _client.GetAsync($"/api/tasks/{taskId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<TaskDto>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(taskId);
    }

    [Fact]
    public async Task Create_ShouldCreateTask_WhenValidData()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var command = new CreateTaskCommand
        {
            Name = "Test Task",
            Description = "Test Description",
            Priority = TaskPriority.High,
            EndDate = DateTime.Now.AddDays(7),
            AssigneeId = "test-user",
            InitiativeId = 1,
            ImpactWeight = 0.7m,
            StrategicWeight = 0.3m,
            RiskLevel = RiskLevel.Low,
            CostImpact = CostImpact.Low
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var taskId = await response.Content.ReadFromJsonAsync<int>();
        taskId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Update_ShouldUpdateTask_WhenValidData()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var taskId = await CreateTestTask();
        var command = new UpdateTaskCommand
        {
            Id = taskId,
            Name = "Updated Task",
            Description = "Updated Description",
            Priority = TaskPriority.Medium,
            EndDate = DateTime.Now.AddDays(14),
            AssigneeId = "test-user",
            ImpactWeight = 0.6m,
            StrategicWeight = 0.4m,
            RiskLevel = RiskLevel.Medium,
            CostImpact = CostImpact.Medium
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tasks/{taskId}", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify the update
        var getResponse = await _client.GetAsync($"/api/tasks/{taskId}");
        var updatedTask = await getResponse.Content.ReadFromJsonAsync<TaskDto>();
        updatedTask.Should().NotBeNull();
        updatedTask!.Name.Should().Be(command.Name);
        updatedTask.Description.Should().Be(command.Description);
    }

    [Fact]
    public async Task UpdateStatus_ShouldUpdateTaskStatus()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var taskId = await CreateTestTask();
        var command = new UpdateTaskStatusCommand
        {
            Id = taskId,
            NewStatus = TaskStatus.Em_Andamento
        };

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/tasks/{taskId}/status", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify the status update
        var getResponse = await _client.GetAsync($"/api/tasks/{taskId}");
        var updatedTask = await getResponse.Content.ReadFromJsonAsync<TaskDto>();
        updatedTask.Should().NotBeNull();
        updatedTask!.Status.Should().Be(TaskStatus.Em_Andamento);
    }

    [Fact]
    public async Task Delete_ShouldDeleteTask()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var taskId = await CreateTestTask();

        // Act
        var response = await _client.DeleteAsync($"/api/tasks/{taskId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify the task is deleted
        var getResponse = await _client.GetAsync($"/api/tasks/{taskId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private async Task<int> CreateTestTask()
    {
        var command = new CreateTaskCommand
        {
            Name = "Tarefa de Teste",
            Description = "Descrição da Tarefa de Teste",
            Priority = TaskPriority.Alta,
            EndDate = DateTime.Now.AddDays(7),
            AssigneeId = "test-user",
            InitiativeId = 1,
            ImpactWeight = 0.7m,
            StrategicWeight = 0.3m,
            RiskLevel = RiskLevel.Baixo,
            CostImpact = CostImpact.Baixo
        };

        var response = await _client.PostAsJsonAsync("/api/tasks", command);
        return await response.Content.ReadFromJsonAsync<int>();
    }
}

public static class HttpClientExtensions
{
    public static async Task<HttpResponseMessage> PatchAsJsonAsync<T>(
        this HttpClient client, string requestUri, T value)
    {
        var content = JsonContent.Create(value);
        var request = new HttpRequestMessage(new HttpMethod("PATCH"), requestUri)
        {
            Content = content
        };

        return await client.SendAsync(request);
    }
} 