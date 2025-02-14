using Microsoft.AspNetCore.DataProtection;
using System.Security.Cryptography;
using System.Text;

namespace PlanMP.API.Infrastructure.Security;

public interface IEncryptionService
{
    string EncryptSensitiveData(string plainText);
    string DecryptSensitiveData(string cipherText);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
    string GenerateRandomToken();
}

public class EncryptionService : IEncryptionService
{
    private readonly IDataProtectionProvider _dataProtectionProvider;
    private readonly IDataProtector _protector;
    private const int PBKDF2_ITERATIONS = 600000; // Recomendação NIST
    private const int SALT_SIZE = 32;
    private const int HASH_SIZE = 32;

    public EncryptionService(IDataProtectionProvider dataProtectionProvider)
    {
        _dataProtectionProvider = dataProtectionProvider;
        _protector = _dataProtectionProvider.CreateProtector("PlanMP.API.SensitiveData");
    }

    public string EncryptSensitiveData(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            throw new ArgumentNullException(nameof(plainText));

        try
        {
            return _protector.Protect(plainText);
        }
        catch (Exception ex)
        {
            throw new CryptographicException("Erro ao criptografar dados", ex);
        }
    }

    public string DecryptSensitiveData(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            throw new ArgumentNullException(nameof(cipherText));

        try
        {
            return _protector.Unprotect(cipherText);
        }
        catch (Exception ex)
        {
            throw new CryptographicException("Erro ao descriptografar dados", ex);
        }
    }

    public string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password));

        byte[] salt = new byte[SALT_SIZE];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        byte[] hash = GetPbkdf2Hash(password, salt);
        
        var hashBytes = new byte[SALT_SIZE + HASH_SIZE];
        Array.Copy(salt, 0, hashBytes, 0, SALT_SIZE);
        Array.Copy(hash, 0, hashBytes, SALT_SIZE, HASH_SIZE);
        
        return Convert.ToBase64String(hashBytes);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password));
        if (string.IsNullOrEmpty(hashedPassword))
            throw new ArgumentNullException(nameof(hashedPassword));

        byte[] hashBytes = Convert.FromBase64String(hashedPassword);
        
        if (hashBytes.Length != SALT_SIZE + HASH_SIZE)
            return false;

        byte[] salt = new byte[SALT_SIZE];
        Array.Copy(hashBytes, 0, salt, 0, SALT_SIZE);

        byte[] expectedHash = new byte[HASH_SIZE];
        Array.Copy(hashBytes, SALT_SIZE, expectedHash, 0, HASH_SIZE);

        byte[] actualHash = GetPbkdf2Hash(password, salt);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    public string GenerateRandomToken()
    {
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes);
    }

    private byte[] GetPbkdf2Hash(string password, byte[] salt)
    {
        using (var pbkdf2 = new Rfc2898DeriveBytes(
            password,
            salt,
            PBKDF2_ITERATIONS,
            HashAlgorithmName.SHA256))
        {
            return pbkdf2.GetBytes(HASH_SIZE);
        }
    }
} 