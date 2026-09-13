using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;

namespace OpenClinicalRecord.Api.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Env var that supplies the PostgreSQL password without putting it in source files.
    /// </summary>
    public const string PostgresPasswordEnvVar = "NOVATECH_PG_PASSWORD";

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

    /// <summary>
    /// If NOVATECH_PG_PASSWORD is set, use it as the connection Password
    /// (replacing any Password= already in the string).
    /// </summary>
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
