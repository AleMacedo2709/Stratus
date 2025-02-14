using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using PlanMP.API.Infrastructure.Cache;
using StackExchange.Redis;
using System.Text.Json;
using Xunit;

namespace PlanMP.API.Tests.Infrastructure.Cache;

public class DistributedCacheServiceTests
{
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<IConnectionMultiplexer> _redisMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<DistributedCacheService>> _loggerMock;
    private readonly DistributedCacheService _service;

    public DistributedCacheServiceTests()
    {
        _cacheMock = new Mock<IDistributedCache>();
        _redisMock = new Mock<IConnectionMultiplexer>();
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<DistributedCacheService>>();

        var database = new Mock<IDatabase>();
        _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
            .Returns(database.Object);

        var configSection = new Mock<IConfigurationSection>();
        configSection.Setup(x => x.Value).Returns("30");
        _configurationMock.Setup(x => x.GetSection("Cache:DefaultExpirationMinutes"))
            .Returns(configSection.Object);

        _service = new DistributedCacheService(
            _cacheMock.Object,
            _redisMock.Object,
            _configurationMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnNull_WhenKeyNotFound()
    {
        // Arrange
        _cacheMock.Setup(x => x.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        // Act
        var result = await _service.GetAsync<TestData>("non-existent-key");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAsync_ShouldReturnDeserializedObject_WhenKeyExists()
    {
        // Arrange
        var testData = new TestData { Id = 1, Name = "Test" };
        var serializedData = JsonSerializer.SerializeToUtf8Bytes(testData);

        _cacheMock.Setup(x => x.GetAsync("test-key", default))
            .ReturnsAsync(serializedData);

        // Act
        var result = await _service.GetAsync<TestData>("test-key");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(testData.Id, result.Id);
        Assert.Equal(testData.Name, result.Name);
    }

    [Fact]
    public async Task SetAsync_ShouldSetValueWithDefaultOptions_WhenExpirationNotProvided()
    {
        // Arrange
        var testData = new TestData { Id = 1, Name = "Test" };

        // Act
        await _service.SetAsync("test-key", testData);

        // Assert
        _cacheMock.Verify(x => x.SetAsync(
            It.Is<string>(k => k == "test-key"),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow.HasValue),
            default));
    }

    [Fact]
    public async Task SetAsync_ShouldSetValueWithCustomExpiration_WhenExpirationProvided()
    {
        // Arrange
        var testData = new TestData { Id = 1, Name = "Test" };
        var expiration = TimeSpan.FromMinutes(15);

        // Act
        await _service.SetAsync("test-key", testData, expiration);

        // Assert
        _cacheMock.Verify(x => x.SetAsync(
            It.Is<string>(k => k == "test-key"),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => 
                o.AbsoluteExpirationRelativeToNow == expiration),
            default));
    }

    [Fact]
    public async Task RemoveAsync_ShouldCallRemoveOnCache()
    {
        // Arrange
        var key = "test-key";

        // Act
        await _service.RemoveAsync(key);

        // Assert
        _cacheMock.Verify(x => x.RemoveAsync(key, default), Times.Once);
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnTrue_WhenKeyExists()
    {
        // Arrange
        _cacheMock.Setup(x => x.GetAsync("test-key", default))
            .ReturnsAsync(new byte[] { 1 });

        // Act
        var result = await _service.ExistsAsync("test-key");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task GetOrSetAsync_ShouldReturnExistingValue_WhenKeyExists()
    {
        // Arrange
        var testData = new TestData { Id = 1, Name = "Test" };
        var serializedData = JsonSerializer.SerializeToUtf8Bytes(testData);

        _cacheMock.Setup(x => x.GetAsync("test-key", default))
            .ReturnsAsync(serializedData);

        // Act
        var result = await _service.GetOrSetAsync("test-key", 
            () => Task.FromResult(new TestData { Id = 2, Name = "New Test" }));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(testData.Id, result.Id);
        Assert.Equal(testData.Name, result.Name);
    }

    [Fact]
    public async Task TryLockAsync_ShouldReturnTrue_WhenLockAcquired()
    {
        // Arrange
        var database = new Mock<IDatabase>();
        database.Setup(x => x.StringSetAsync(
            It.IsAny<RedisKey>(),
            It.IsAny<RedisValue>(),
            It.IsAny<TimeSpan>(),
            It.IsAny<When>(),
            It.IsAny<CommandFlags>()))
            .ReturnsAsync(true);

        _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
            .Returns(database.Object);

        // Act
        var result = await _service.TryLockAsync("test-lock", TimeSpan.FromSeconds(30));

        // Assert
        Assert.True(result);
    }

    private class TestData
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
} 