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
                "No EF migrations found in the assembly. Using EnsureCreated for Identity schema.");
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

        // Safety net when local DB is behind hand-written / lagging migrations.
        await EnsureClinicalTablesAsync(db, logger);
    }

    private static async Task EnsureClinicalTablesAsync(AppDbContext db, ILogger? logger)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "Appointments" (
                    "Id" uuid NOT NULL,
                    "PatientId" uuid NOT NULL,
                    "AppointmentDate" date NOT NULL,
                    "StartTime" time without time zone NOT NULL,
                    "DurationMinutes" integer NOT NULL,
                    "AppointmentType" character varying(40) NOT NULL,
                    "Status" character varying(32) NOT NULL,
                    "ProviderUserId" character varying(450) NULL,
                    "ProviderName" character varying(200) NULL,
                    "Reason" character varying(500) NULL,
                    "Notes" character varying(500) NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    CONSTRAINT "PK_Appointments" PRIMARY KEY ("Id")
                );
                """);

            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "AppointmentEvents" (
                    "Id" uuid NOT NULL,
                    "AppointmentId" uuid NOT NULL,
                    "FromStatus" character varying(32) NOT NULL,
                    "ToStatus" character varying(32) NOT NULL,
                    "Reason" character varying(500) NULL,
                    "ActorUserId" character varying(450) NULL,
                    "ActorName" character varying(200) NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    CONSTRAINT "PK_AppointmentEvents" PRIMARY KEY ("Id")
                );
                """);

            // Required for mark-deceased / clear-deceased flows.
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "PatientDeathRecords" (
                    "Id" uuid NOT NULL,
                    "PatientId" uuid NOT NULL,
                    "DateOfDeath" date NULL,
                    "Note" character varying(500) NULL,
                    "RecordedByUserId" character varying(450) NULL,
                    "RecordedByName" character varying(200) NULL,
                    "RecordedAt" timestamp with time zone NOT NULL,
                    "ClearedAt" timestamp with time zone NULL,
                    "ClearedByUserId" character varying(450) NULL,
                    "ClearedByName" character varying(200) NULL,
                    "IsActive" boolean NOT NULL DEFAULT TRUE,
                    CONSTRAINT "PK_PatientDeathRecords" PRIMARY KEY ("Id")
                );
                """);

            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE INDEX IF NOT EXISTS "IX_Appointments_AppointmentDate" ON "Appointments" ("AppointmentDate");
                CREATE INDEX IF NOT EXISTS "IX_Appointments_PatientId" ON "Appointments" ("PatientId");
                CREATE INDEX IF NOT EXISTS "IX_Appointments_Status" ON "Appointments" ("Status");
                CREATE INDEX IF NOT EXISTS "IX_AppointmentEvents_AppointmentId" ON "AppointmentEvents" ("AppointmentId");
                CREATE INDEX IF NOT EXISTS "IX_PatientDeathRecords_PatientId" ON "PatientDeathRecords" ("PatientId");
                """);

            // Unique active death record per patient (Postgres partial unique index).
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS "UX_PatientDeathRecords_ActivePatient"
                ON "PatientDeathRecords" ("PatientId")
                WHERE "IsActive" = TRUE;
                """);

            logger?.LogInformation(
                "Clinical tables verified (Appointments, AppointmentEvents, PatientDeathRecords).");
        }
        catch (Exception ex)
        {
            logger?.LogWarning(ex, "Could not ensure clinical tables. Some features may fail until schema is fixed.");
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
