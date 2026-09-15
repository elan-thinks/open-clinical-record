using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OpenClinicalRecord.Api.Data;

namespace OpenClinicalRecord.Api.Tests;

/// <summary>
/// Test host: in-memory EF, fixed JWT key, Development seeding (roles + users).
/// </summary>
public class OcrWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string JwtKey = "TEST_ONLY_OpenClinicalRecord_Jwt_Signing_Key_32!";
    public const string SeedPassword = "Dev@12345";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        Environment.SetEnvironmentVariable("OCR_JWT_KEY", JwtKey);
        Environment.SetEnvironmentVariable("OCR_SEED_PASSWORD", SeedPassword);

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = JwtKey,
                ["Jwt:Issuer"] = "OpenClinicalRecord",
                ["Jwt:Audience"] = "OpenClinicalRecord",
                ["Jwt:ExpirationMinutes"] = "60",
                ["ConnectionStrings:DefaultConnection"] =
                    "Host=localhost;Port=5432;Database=ocr_test_unused;Username=postgres"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(AppDbContext));

            var optionsDescriptors = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
                .ToList();
            foreach (var d in optionsDescriptors)
            {
                services.Remove(d);
            }

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("ocr-auth-tests"));
        });
    }
}
