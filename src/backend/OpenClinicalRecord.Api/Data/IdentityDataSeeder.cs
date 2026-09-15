using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Models.Enums;

namespace OpenClinicalRecord.Api.Data;

public static class IdentityDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services, ILogger? logger = null)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<AppDbContext>();

        await EnsureSchemaAsync(db, logger);

        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var role in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        var seedPassword = Environment.GetEnvironmentVariable("OCR_SEED_PASSWORD") ?? "Dev@12345";

        await EnsureUserAsync(userManager, "admin@clinic.local", "System Administrator", AppRoles.Admin, seedPassword);
        await EnsureUserAsync(userManager, "doctor@clinic.local", "Dr. Samuel Clinician", AppRoles.Doctor, seedPassword);
        await EnsureUserAsync(userManager, "nurse@clinic.local", "Hana Mekonnen", AppRoles.Nurse, seedPassword);
        await EnsureUserAsync(userManager, "desk@clinic.local", "Reception Desk", AppRoles.Receptionist, seedPassword);

        logger?.LogInformation("Identity roles and seed users are ready.");
    }

    private static async Task EnsureSchemaAsync(AppDbContext db, ILogger? logger)
    {
        // In-memory / non-relational providers (integration tests): model-only create.
        if (!db.Database.IsRelational())
        {
            await db.Database.EnsureCreatedAsync();
            logger?.LogInformation("Non-relational database: EnsureCreated completed.");
            return;
        }

        var definedMigrations = db.Database.GetMigrations().ToList();
        var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();

        if (definedMigrations.Count > 0)
        {
            if (pending.Count > 0)
            {
                logger?.LogInformation(
                    "Applying {Count} pending migration(s): {Migrations}",
                    pending.Count,
                    string.Join(", ", pending));
            }

            await db.Database.MigrateAsync();
        }
        else
        {
            logger?.LogWarning(
                "No EF migrations found in the assembly. Using EnsureCreated for Identity schema. " +
                "Add/pull Data/Migrations and use Migrate for production-style updates.");

            await db.Database.EnsureCreatedAsync();
        }

        try
        {
            await db.Database.ExecuteSqlRawAsync("""SELECT 1 FROM "AspNetRoles" LIMIT 1""");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Identity tables are still missing. " +
                "Try: drop the database (or DROP TABLE \"__EFMigrationsHistory\"), " +
                "ensure Data/Migrations is present, then run: dotnet ef database update",
                ex);
        }
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string fullName,
        string role,
        string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = fullName,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to seed user {email}: {errors}");
            }
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }
}
