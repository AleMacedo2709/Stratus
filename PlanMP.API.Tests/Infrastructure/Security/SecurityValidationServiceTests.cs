using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using PlanMP.API.Infrastructure.Security;
using System.Security.Claims;
using Xunit;

namespace PlanMP.API.Tests.Infrastructure.Security;

public class SecurityValidationServiceTests
{
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<ILogger<SecurityValidationService>> _loggerMock;
    private readonly Mock<IEncryptionService> _encryptionServiceMock;
    private readonly SecurityValidationService _service;

    public SecurityValidationServiceTests()
    {
        _configurationMock = new Mock<IConfiguration>();
        _cacheMock = new Mock<IDistributedCache>();
        _loggerMock = new Mock<ILogger<SecurityValidationService>>();
        _encryptionServiceMock = new Mock<IEncryptionService>();

        // Setup configuration
        var configSection = new Mock<IConfigurationSection>();
        configSection.Setup(x => x.Value).Returns("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
        _configurationMock.Setup(x => x.GetSection("Security:PasswordPattern")).Returns(configSection.Object);

        _service = new SecurityValidationService(
            _configurationMock.Object,
            _cacheMock.Object,
            _loggerMock.Object,
            _encryptionServiceMock.Object
        );
    }

    [Theory]
    [InlineData("Weak", false)]
    [InlineData("StrongP@ssw0rd", true)]
    public async Task ValidatePassword_ShouldReturnExpectedResult(string password, bool expected)
    {
        // Act
        var result = await _service.ValidatePassword(password);

        // Assert
        Assert.Equal(expected, result);
    }

    [Fact]
    public async Task ValidateAccessToken_ShouldReturnFalse_WhenTokenIsBlacklisted()
    {
        // Arrange
        var token = "test-token";
        _cacheMock.Setup(x => x.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync(System.Text.Encoding.UTF8.GetBytes("true"));

        // Act
        var result = await _service.ValidateAccessToken(token);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ValidateUserAccess_ShouldReturnTrue_WhenUserHasRequiredPermissions()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim("Permission", "Tasks.Edit")
        };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        // Act
        var result = await _service.ValidateUserAccess(principal, "Tasks", "Edit");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task ValidateRequestOrigin_ShouldReturnTrue_ForAllowedOrigin()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Headers["Origin"] = "https://allowed-domain.com";

        var configSection = new Mock<IConfigurationSection>();
        configSection.Setup(x => x.Get<string[]>())
            .Returns(new[] { "https://allowed-domain.com" });
        _configurationMock.Setup(x => x.GetSection("Security:AllowedOrigins"))
            .Returns(configSection.Object);

        // Act
        var result = await _service.ValidateRequestOrigin(context);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task CheckRateLimit_ShouldReturnFalse_WhenLimitExceeded()
    {
        // Arrange
        var key = "test-key";
        var limit = 5;
        var window = TimeSpan.FromMinutes(1);

        _cacheMock.Setup(x => x.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync(System.Text.Encoding.UTF8.GetBytes("6"));

        // Act
        var result = await _service.CheckRateLimit(key, limit, window);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("<script>alert('xss')</script>", "^[a-zA-Z0-9]+$", false)]
    [InlineData("ValidInput123", "^[a-zA-Z0-9]+$", true)]
    public async Task ValidateInputData_ShouldReturnExpectedResult(string input, string pattern, bool expected)
    {
        // Act
        var result = await _service.ValidateInputData(input, pattern);

        // Assert
        Assert.Equal(expected, result);
    }
} 