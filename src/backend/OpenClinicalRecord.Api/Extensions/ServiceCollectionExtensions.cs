using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;

namespace OpenClinicalRecord.Api.Extensions;

public static class ServiceCollectionExtensions
{
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

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        return services;
    }
}
