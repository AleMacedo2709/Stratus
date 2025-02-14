using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace PlanMP.API.Infrastructure.Cache;

public interface IDistributedCacheService
{
    Task<T?> GetAsync<T>(string key) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class;
    Task RemoveAsync(string key);
    Task<bool> ExistsAsync(string key);
    Task<T?> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null) where T : class;
    Task<bool> TryLockAsync(string key, TimeSpan duration);
    Task ReleaseLockAsync(string key);
}

public class DistributedCacheService : IDistributedCacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<DistributedCacheService> _logger;
    private readonly DistributedCacheEntryOptions _defaultOptions;

    public DistributedCacheService(
        IDistributedCache cache,
        IConnectionMultiplexer redis,
        IConfiguration configuration,
        ILogger<DistributedCacheService> logger)
    {
        _cache = cache;
        _redis = redis;
        _logger = logger;

        // Configurações padrão de cache
        _defaultOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30),
            SlidingExpiration = TimeSpan.FromMinutes(10)
        };
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        try
        {
            var data = await _cache.GetStringAsync(key);
            if (string.IsNullOrEmpty(data))
                return null;

            return JsonSerializer.Deserialize<T>(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting value from cache for key {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class
    {
        try
        {
            var options = new DistributedCacheEntryOptions();

            if (expiration.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiration;
            }
            else
            {
                options.AbsoluteExpirationRelativeToNow = _defaultOptions.AbsoluteExpirationRelativeToNow;
                options.SlidingExpiration = _defaultOptions.SlidingExpiration;
            }

            var data = JsonSerializer.Serialize(value);
            await _cache.SetStringAsync(key, data, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting value in cache for key {Key}", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            await _cache.RemoveAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing value from cache for key {Key}", key);
        }
    }

    public async Task<bool> ExistsAsync(string key)
    {
        try
        {
            var data = await _cache.GetAsync(key);
            return data != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existence in cache for key {Key}", key);
            return false;
        }
    }

    public async Task<T?> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? expiration = null) where T : class
    {
        try
        {
            var value = await GetAsync<T>(key);
            if (value != null)
                return value;

            value = await factory();
            if (value != null)
                await SetAsync(key, value, expiration);

            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in get or set operation for key {Key}", key);
            return null;
        }
    }

    public async Task<bool> TryLockAsync(string key, TimeSpan duration)
    {
        try
        {
            var db = _redis.GetDatabase();
            var lockKey = $"lock:{key}";
            
            return await db.StringSetAsync(
                lockKey,
                "locked",
                duration,
                When.NotExists);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acquiring lock for key {Key}", key);
            return false;
        }
    }

    public async Task ReleaseLockAsync(string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            var lockKey = $"lock:{key}";
            
            await db.KeyDeleteAsync(lockKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing lock for key {Key}", key);
        }
    }

    private string GetCacheKey(string key, params object[] parameters)
    {
        if (parameters == null || parameters.Length == 0)
            return key;

        return $"{key}:{string.Join(":", parameters)}";
    }
} 