using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using Serilog;
using FluentValidation.AspNetCore;
using System.Text.Json.Serialization;
using PlanMP.API.Infrastructure;
using PlanMP.API.Infrastructure.Persistence;
using PlanMP.API.Infrastructure.Identity;
using PlanMP.API.Application.Common.Interfaces;
using PlanMP.API.Application.Common.Behaviors;
using StackExchange.Redis;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.MSSqlServer(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection"),
        tableName: "Logs",
        autoCreateSqlTable: true)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
var services = builder.Services;

// Add DbContext
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

// Add Identity services
services.AddIdentityServices(builder.Configuration);

// Add Azure AD Authentication
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"))
    .EnableTokenAcquisition();

// Add Authorization
services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .RequireClaim("scope", "access_as_user")
        .Build();
});

// Add CORS
services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add MediatR
services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
});

// Add AutoMapper
services.AddAutoMapper(typeof(Program).Assembly);

// Add FluentValidation
services.AddFluentValidationAutoValidation();
services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// Add Controllers
services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Add API versioning
services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// Add Swagger/OpenAPI
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PlanMP API",
        Version = "v1",
        Description = "API for PlanMP Strategic Planning System",
        Contact = new OpenApiContact
        {
            Name = "Support",
            Email = "support@plan-mp.org.br"
        }
    });

    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri(builder.Configuration["AzureAd:AuthorizationUrl"] ?? string.Empty),
                TokenUrl = new Uri(builder.Configuration["AzureAd:TokenUrl"] ?? string.Empty),
                Scopes = new Dictionary<string, string>
                {
                    { "api://[client-id]/access_as_user", "Access as user" }
                }
            }
        }
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
            },
            new[] { "api://[client-id]/access_as_user" }
        }
    });
});

// Add Health Checks
services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddAzureAD(options =>
    {
        options.ClientId = builder.Configuration["AzureAd:ClientId"];
        options.ClientSecret = builder.Configuration["AzureAd:ClientSecret"];
        options.TenantId = builder.Configuration["AzureAd:TenantId"];
    });

// Register health check service
services.AddHttpClient("HealthCheck");
services.AddScoped<IHealthCheckService, HealthCheckService>();

// Register security services
services.AddScoped<ISecurityValidationService, SecurityValidationService>();
services.AddScoped<IStrategicCalculationService, StrategicCalculationService>();

// Configure Redis
var redisConnection = builder.Configuration.GetConnectionString("Redis");
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnection;
    options.InstanceName = "PlanMP:";
});

services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(redisConnection));

services.AddScoped<IDistributedCacheService, DistributedCacheService>();

// Configure rate limiting
services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Configure health checks
services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("Database")
    .AddRedis(redisConnection, "Redis")
    .AddUrlGroup(new Uri(builder.Configuration["ExternalServices:AuthService"]), "Auth Service")
    .AddUrlGroup(new Uri(builder.Configuration["ExternalServices:StorageService"]), "Storage Service");

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PlanMP API v1");
        c.OAuthClientId(builder.Configuration["AzureAd:ClientId"]);
        c.OAuthScopes("api://[client-id]/access_as_user");
        c.OAuthUsePkce();
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseSerilogRequestLogging();

app.UseCors("DefaultPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Apply any pending migrations
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
}

app.Run(); 