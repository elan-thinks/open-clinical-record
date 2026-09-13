using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenClinicalRecord.Api.Configuration;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Models.Enums;
using OpenClinicalRecord.Api.Services;

namespace OpenClinicalRecord.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public const string PostgresPasswordEnvVar = "NOVATECH_PG_PASSWORD";
    public const string JwtKeyEnvVar = "OCR_JWT_KEY";

    public static IServiceCollection AddApplicationDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is missing. " +
                "Set it in appsettings.Development.json or via the ConnectionStrings__DefaultConnection environment variable.");
        }

        connectionString = ApplyPasswordFromEnvironment(connectionString);

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        return services;
    }

    public static IServiceCollection AddApplicationIdentity(this IServiceCollection services)
    {
        services
            .AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedAccount = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        return services;
    }

    public static IServiceCollection AddApplicationJwtAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        var jwt = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

        // Prefer dedicated env var over config file
        var keyFromEnv = Environment.GetEnvironmentVariable(JwtKeyEnvVar);
        if (!string.IsNullOrWhiteSpace(keyFromEnv))
        {
            jwt.Key = keyFromEnv;
        }

        if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < 32)
        {
            throw new InvalidOperationException(
                $"JWT signing key is missing or too short (min 32 chars). " +
                $"Set environment variable {JwtKeyEnvVar} or configuration Jwt:Key.");
        }

        // Re-bind so IOptions picks up env override
        services.PostConfigure<JwtOptions>(opts =>
        {
            if (!string.IsNullOrWhiteSpace(keyFromEnv))
            {
                opts.Key = keyFromEnv;
            }
        });

        services.AddScoped<IJwtTokenService, JwtTokenService>();

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("DoctorOnly", p => p.RequireRole(AppRoles.Doctor));
            options.AddPolicy("NurseOnly", p => p.RequireRole(AppRoles.Nurse));
            options.AddPolicy("ReceptionistOnly", p => p.RequireRole(AppRoles.Receptionist));
            options.AddPolicy("AdminOnly", p => p.RequireRole(AppRoles.Admin));
            options.AddPolicy("ClinicalStaff", p => p.RequireRole(AppRoles.Doctor, AppRoles.Nurse));
        });

        return services;
    }

    internal static string ApplyPasswordFromEnvironment(string connectionString)
    {
        var password = Environment.GetEnvironmentVariable(PostgresPasswordEnvVar);

        if (string.IsNullOrEmpty(password))
        {
            return connectionString;
        }

        var parts = connectionString
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(p => !p.StartsWith("Password=", StringComparison.OrdinalIgnoreCase)
                        && !p.StartsWith("Pwd=", StringComparison.OrdinalIgnoreCase))
            .ToList();

        parts.Add($"Password={password}");
        return string.Join(';', parts);
    }
}
