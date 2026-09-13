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

        // Apply any pending EF Core migrations (creates AspNet* tables)
        var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();
        if (pending.Count > 0)
        {
            logger?.LogInformation("Applying {Count} pending migration(s): {Migrations}",
                pending.Count, string.Join(", ", pending));
            await db.Database.MigrateAsync();
        }
        else
        {
            // Still call Migrate to ensure history is consistent
            await db.Database.MigrateAsync();
        }

        // Verify Identity tables exist
        var canConnect = await db.Database.CanConnectAsync();
        if (!canConnect)
        {
            throw new InvalidOperationException("Cannot connect to the database after MigrateAsync.");
        }

        try
        {
            // Touch a known Identity table; if missing, migration assembly was incomplete
            await db.Database.ExecuteSqlRawAsync("""SELECT 1 FROM "AspNetRoles" LIMIT 1""");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Identity tables are missing after migration. " +
                "Ensure Data/Migrations contains InitialIdentity and rebuild the project. " +
                "You can also run: dotnet ef database update",
                ex);
        }

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
        await EnsureUserAsync(userManager, "nurse@clinic.local", "Nurse Ayana", AppRoles.Nurse, seedPassword);
        await EnsureUserAsync(userManager, "desk@clinic.local", "Front Desk", AppRoles.Receptionist, seedPassword);

        logger?.LogInformation("Identity roles and seed users are ready.");
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
