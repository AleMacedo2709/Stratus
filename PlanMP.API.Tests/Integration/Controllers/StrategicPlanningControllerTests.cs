using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using PlanMP.API.Application.StrategicPlanning.Commands;
using PlanMP.API.Application.StrategicPlanning.DTOs;
using Xunit;

namespace PlanMP.API.Tests.Integration.Controllers;

public class StrategicPlanningControllerTests : IntegrationTestBase
{
    public StrategicPlanningControllerTests(WebApplicationFactory<Program> factory)
        : base(factory)
    {
    }

    [Fact]
    public async Task GetCycles_ShouldReturnAllCycles()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        await CreateTestCycle();

        // Act
        var response = await _client.GetAsync("/api/strategic-planning/cycles");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<StrategicCycleDTO>>();
        result.Should().NotBeNull();
        result!.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetCycle_ShouldReturnCycle_WhenExists()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var cycleId = await CreateTestCycle();

        // Act
        var response = await _client.GetAsync($"/api/strategic-planning/cycles/{cycleId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<StrategicCycleDTO>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(cycleId);
    }

    [Fact]
    public async Task CreateCycle_ShouldCreateCycle_WhenValidData()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var command = new CreateStrategicCycleCommand
        {
            Name = "Strategic Cycle 2025-2030",
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2030, 12, 31),
            Mission = "Our mission statement",
            Vision = "Our vision statement",
            Values = new[] { "Innovation", "Excellence", "Integrity" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/strategic-planning/cycles", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var cycleId = await response.Content.ReadFromJsonAsync<int>();
        cycleId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task UpdateCycle_ShouldUpdateCycle_WhenValidData()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var cycleId = await CreateTestCycle();

        var command = new UpdateStrategicCycleCommand
        {
            Id = cycleId,
            Name = "Updated Cycle",
            StartDate = new DateTime(2026, 1, 1),
            EndDate = new DateTime(2031, 12, 31),
            Mission = "Updated mission",
            Vision = "Updated vision",
            Values = new[] { "Updated Value 1", "Updated Value 2" }
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/strategic-planning/cycles/{cycleId}", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify the update
        var getResponse = await _client.GetAsync($"/api/strategic-planning/cycles/{cycleId}");
        var updatedCycle = await getResponse.Content.ReadFromJsonAsync<StrategicCycleDTO>();
        updatedCycle.Should().NotBeNull();
        updatedCycle!.Name.Should().Be(command.Name);
        updatedCycle.Mission.Should().Be(command.Mission);
    }

    [Fact]
    public async Task GetPerspectives_ShouldReturnPerspectives_ForCycle()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var cycleId = await CreateTestCycle();

        // Act
        var response = await _client.GetAsync($"/api/strategic-planning/cycles/{cycleId}/perspectives");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<PerspectiveDTO>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetObjectives_ShouldReturnObjectives_ForPerspective()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var perspectiveId = await CreateTestPerspective();

        // Act
        var response = await _client.GetAsync($"/api/strategic-planning/perspectives/{perspectiveId}/objectives");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<ObjectiveDTO>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetIndicators_ShouldReturnIndicators_ForCycle()
    {
        // Arrange
        await AuthenticateAsync("test-token");
        var cycleId = await CreateTestCycle();

        // Act
        var response = await _client.GetAsync($"/api/strategic-planning/cycles/{cycleId}/indicators");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<IndicatorDTO>>();
        result.Should().NotBeNull();
    }

    private async Task<int> CreateTestCycle()
    {
        var command = new CreateStrategicCycleCommand
        {
            Name = "Test Cycle",
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2030, 12, 31),
            Mission = "Test Mission",
            Vision = "Test Vision",
            Values = new[] { "Value 1", "Value 2" }
        };

        var response = await _client.PostAsJsonAsync("/api/strategic-planning/cycles", command);
        return await response.Content.ReadFromJsonAsync<int>();
    }

    private async Task<int> CreateTestPerspective()
    {
        var cycleId = await CreateTestCycle();

        var command = new CreatePerspectiveCommand
        {
            Name = "Test Perspective",
            Description = "Test Description",
            CycleId = cycleId,
            Weight = 1
        };

        var response = await _client.PostAsJsonAsync("/api/strategic-planning/perspectives", command);
        return await response.Content.ReadFromJsonAsync<int>();
    }
} 