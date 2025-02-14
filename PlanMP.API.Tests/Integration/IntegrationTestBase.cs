using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PlanMP.API.Application.Auth.Commands;
using PlanMP.API.Application.Auth.DTOs;
using PlanMP.API.Infrastructure.Persistence;
using System.Net.Http.Json;
using Testcontainers.MsSql;
using Testcontainers.Redis;
using Xunit;

namespace PlanMP.API.Tests.Integration;

public class IntegrationTestBase : IAsyncLifetime
{
    protected readonly WebApplicationFactory<Program> _factory;
    protected readonly HttpClient _client;
    private readonly MsSqlContainer _sqlContainer;
    private readonly RedisContainer _redisContainer;
    protected string? _authToken;

    public IntegrationTestBase()
    {
        _sqlContainer = new MsSqlBuilder()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
            .WithPassword("YourStrong@Passw0rd")
            .Build();

        _redisContainer = new RedisBuilder()
            .WithImage("redis:7.0")
            .Build();

        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddJsonFile("appsettings.Testing.json");
                });

                builder.ConfigureServices(async services =>
                {
                    var descriptor = services.SingleOrDefault(d => 
                        d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseSqlServer(_sqlContainer.GetConnectionString());
                    });

                    // Update Redis connection string
                    var configuration = services.BuildServiceProvider()
                        .GetRequiredService<IConfiguration>();
                    
                    var redisConnectionString = _redisContainer.GetConnectionString();
                    
                    services.PostConfigure<IConfiguration>(config =>
                    {
                        config["ConnectionStrings:Redis"] = redisConnectionString;
                    });

                    // Ensure database is created and migrated
                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    await db.Database.MigrateAsync();
                });
            });

        _client = _factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        await _sqlContainer.StartAsync();
        await _redisContainer.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _sqlContainer.DisposeAsync();
        await _redisContainer.DisposeAsync();
        await _factory.DisposeAsync();
    }

    protected async Task AuthenticateClient(string email = "test@example.com", string password = "Test@123")
    {
        // Register a test user if it doesn't exist
        var registerCommand = new RegisterCommand
        {
            Name = "Test User",
            Email = email,
            Password = password,
            Area = "IT"
        };

        await _client.PostAsJsonAsync("/api/auth/register", registerCommand);

        // Login to get the token
        var loginCommand = new LoginCommand
        {
            Email = email,
            Password = password
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginCommand);
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDTO>();

        _authToken = result!.Token;
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authToken);
    }

    protected async Task ResetDatabase()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureDeletedAsync();
        await context.Database.MigrateAsync();
    }
} 