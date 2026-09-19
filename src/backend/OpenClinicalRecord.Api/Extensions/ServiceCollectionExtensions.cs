using System.Security.Claims;
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
using OpenClinicalRecord.Api.Services.Appointments;
using OpenClinicalRecord.Api.Services.Audit;
using OpenClinicalRecord.Api.Services.Clinical;
using OpenClinicalRecord.Api.Services.Patients;

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
                // Align Identity role claim name with JWT short "role" claim.
                options.ClaimsIdentity.RoleClaimType = "role";
                options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
                options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Name;
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
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ClockSkew = TimeSpan.FromMinutes(1),
                    RoleClaimType = "role",
                    NameClaimType = ClaimTypes.Name
                };

                // Guarantee role claims are visible to [Authorize(Roles)] / RequireRole policies.
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        if (context.Principal?.Identity is not ClaimsIdentity identity)
                            return Task.CompletedTask;

                        var roleValues = identity.FindAll("role")
                            .Concat(identity.FindAll(ClaimTypes.Role))
                            .Select(c => c.Value)
                            .Where(v => !string.IsNullOrWhiteSpace(v))
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .ToList();

                        foreach (var role in roleValues)
                        {
                            if (!identity.HasClaim("role", role))
                                identity.AddClaim(new Claim("role", role));
                            if (!identity.HasClaim(ClaimTypes.Role, role))
                                identity.AddClaim(new Claim(ClaimTypes.Role, role));
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("DoctorOnly", p => p.RequireRole(AppRoles.Doctor));
            options.AddPolicy("NurseOnly", p => p.RequireRole(AppRoles.Nurse));
            options.AddPolicy("ReceptionistOnly", p => p.RequireRole(AppRoles.Receptionist));
            options.AddPolicy("AdminOnly", p => p.RequireRole(AppRoles.Admin));
            options.AddPolicy("ClinicalStaff", p => p.RequireRole(AppRoles.Doctor, AppRoles.Nurse));

            // Any of the four application roles may create/update appointments.
            options.AddPolicy("StaffCanBook", p => p.RequireAssertion(ctx =>
            {
                if (ctx.User.Identity?.IsAuthenticated != true)
                    return false;

                var roles = ctx.User.FindAll("role")
                    .Concat(ctx.User.FindAll(ClaimTypes.Role))
                    .Select(c => c.Value);

                return roles.Any(r =>
                    string.Equals(r, AppRoles.Admin, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(r, AppRoles.Receptionist, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(r, AppRoles.Doctor, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(r, AppRoles.Nurse, StringComparison.OrdinalIgnoreCase));
            }));
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

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAppointmentWorkflowService, AppointmentWorkflowService>();
        services.AddScoped<IClinicalChartService, ClinicalChartService>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IAuditService, AuditService>();
        return services;
    }
}
