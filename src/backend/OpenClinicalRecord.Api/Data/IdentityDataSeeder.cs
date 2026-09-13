using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Models.Enums;

namespace OpenClinicalRecord.Api.Data;

public static class IdentityDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;

        var db = sp.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var role in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Dev-only seed users (password from env OCR_SEED_PASSWORD or default Dev@12345)
        var seedPassword = Environment.GetEnvironmentVariable("OCR_SEED_PASSWORD") ?? "Dev@12345";

        await EnsureUserAsync(userManager, "admin@clinic.local", "System Administrator", AppRoles.Admin, seedPassword);
        await EnsureUserAsync(userManager, "doctor@clinic.local", "Dr. Samuel Clinician", AppRoles.Doctor, seedPassword);
        await EnsureUserAsync(userManager, "nurse@clinic.local", "Nurse Ayana", AppRoles.Nurse, seedPassword);
        await EnsureUserAsync(userManager, "desk@clinic.local", "Front Desk", AppRoles.Receptionist, seedPassword);
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
