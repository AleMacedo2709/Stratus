using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using PlanMP.API.Application.Auth.Commands;
using PlanMP.API.Application.Auth.DTOs;
using Xunit;

namespace PlanMP.API.Tests.Integration.Controllers;

public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests() : base()
    {
    }

    [Fact]
    public async Task Register_ShouldCreateUser_WhenValidData()
    {
        // Arrange
        var command = new RegisterCommand
        {
            Name = "Test User",
            Email = "test@example.com",
            Password = "Test@123",
            Area = "IT"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<UserDTO>();
        result.Should().NotBeNull();
        result!.Email.Should().Be(command.Email);
        result.Name.Should().Be(command.Name);
        result.Area.Should().Be(command.Area);
    }

    [Fact]
    public async Task Login_ShouldReturnToken_WhenValidCredentials()
    {
        // Arrange
        await Register_ShouldCreateUser_WhenValidData();
        
        var command = new LoginCommand
        {
            Email = "test@example.com",
            Password = "Test@123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDTO>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(command.Email);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenInvalidCredentials()
    {
        // Arrange
        var command = new LoginCommand
        {
            Email = "invalid@example.com",
            Password = "InvalidPassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RefreshToken_ShouldReturnNewToken_WhenValidRefreshToken()
    {
        // Arrange
        await Register_ShouldCreateUser_WhenValidData();
        
        var loginCommand = new LoginCommand
        {
            Email = "test@example.com",
            Password = "Test@123"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginCommand);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDTO>();

        var command = new RefreshTokenCommand
        {
            RefreshToken = loginResult!.RefreshToken
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh-token", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDTO>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.Token.Should().NotBe(loginResult.Token);
    }

    [Fact]
    public async Task Logout_ShouldInvalidateToken()
    {
        // Arrange
        await Register_ShouldCreateUser_WhenValidData();
        
        var loginCommand = new LoginCommand
        {
            Email = "test@example.com",
            Password = "Test@123"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginCommand);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDTO>();

        _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {loginResult!.Token}");

        // Act
        var response = await _client.PostAsync("/api/auth/logout", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify token is invalidated by trying to use it
        var protectedResponse = await _client.GetAsync("/api/users/profile");
        protectedResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
} 