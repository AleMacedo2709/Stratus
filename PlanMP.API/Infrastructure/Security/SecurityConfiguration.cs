using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace PlanMP.API.Infrastructure.Security;

public static class SecurityConfiguration
{
    public static IServiceCollection AddSecurityServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configuração do JWT
        var jwtSettings = configuration.GetSection("JwtSettings");
        var keyVaultCertThumbprint = configuration["AzureKeyVault:JwtSigningCertThumbprint"];
        
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            // Obter certificado do Azure Key Vault
            var cert = GetCertificateFromKeyVault(keyVaultCertThumbprint);
            
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new X509SecurityKey(cert),
                ClockSkew = TimeSpan.Zero,
                RequireExpirationTime = true
            };
        });

        // Proteção de Dados
        services.AddDataProtection()
            .PersistKeysToAzureKeyVault(configuration["AzureKeyVault:Url"], configuration["AzureKeyVault:ClientId"], configuration["AzureKeyVault:ClientSecret"])
            .ProtectKeysWithCertificate(cert)
            .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

        // Políticas de Autorização
        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .RequireClaim("scope", "api.access")
                .Build();

            // Política para dados sensíveis
            options.AddPolicy("SensitiveData", policy =>
                policy.RequireRole("DataOfficer")
                     .RequireClaim("security_clearance", "high")
                     .RequireAuthenticatedUser());

            // Política para auditoria
            options.AddPolicy("AuditAccess", policy =>
                policy.RequireRole("Auditor")
                     .RequireClaim("audit_permission", "true")
                     .RequireAuthenticatedUser());
        });

        // CORS com políticas estritas
        services.AddCors(options =>
        {
            options.AddPolicy("ProductionCorsPolicy", builder =>
            {
                builder
                    .WithOrigins(configuration.GetSection("AllowedOrigins").Get<string[]>())
                    .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .WithHeaders("Authorization", "Content-Type")
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowCredentials()
                    .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
            });
        });

        // Rate Limiting
        services.AddRateLimiting(configuration);

        // Anti-forgery
        services.AddAntiforgery(options =>
        {
            options.Cookie.Name = "X-CSRF-TOKEN";
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.HeaderName = "X-CSRF-TOKEN";
        });

        return services;
    }

    private static X509Certificate2 GetCertificateFromKeyVault(string thumbprint)
    {
        using var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
        store.Open(OpenFlags.ReadOnly);
        var cert = store.Certificates
            .Find(X509FindType.FindByThumbprint, thumbprint, false)
            .OfType<X509Certificate2>()
            .FirstOrDefault();
        
        if (cert == null)
            throw new InvalidOperationException("Certificate not found in store");
            
        return cert;
    }
} 