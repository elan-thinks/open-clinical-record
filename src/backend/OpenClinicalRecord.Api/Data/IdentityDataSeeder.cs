using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
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

        // Demo patients only in Development, or when OCR_SEED_DEMO_DATA=true (never implied in Production).
        var env = sp.GetRequiredService<IHostEnvironment>();
        var seedDemoFlag = Environment.GetEnvironmentVariable("OCR_SEED_DEMO_DATA");
        var allowDemo =
            env.IsDevelopment()
            || string.Equals(seedDemoFlag, "true", StringComparison.OrdinalIgnoreCase)
            || string.Equals(seedDemoFlag, "1", StringComparison.OrdinalIgnoreCase);

        if (allowDemo)
        {
            await EnsureDemoPatientsAsync(db, logger);
        }
        else
        {
            logger?.LogInformation(
                "Skipping demo patient seed (not Development and OCR_SEED_DEMO_DATA is not true).");
        }
    }

    /// <summary>
    /// Seeds up to 20 demo patients when the Patients table has fewer than 20 rows.
    /// Safe to re-run: does nothing once the count is already >= 20.
    /// Only called when Development or OCR_SEED_DEMO_DATA=true.
    /// </summary>
    private static async Task EnsureDemoPatientsAsync(AppDbContext db, ILogger? logger)
    {
        try
        {
            var existing = await db.Patients.CountAsync();
            if (existing >= 20)
            {
                logger?.LogInformation("Demo patients already present ({Count}). Skipping patient seed.", existing);
                return;
            }

            var demos = new (string First, string Last, string Sex, int Year, int Month, int Day, string Phone, string? City, string? Notes)[]
            {
                ("Marta", "Bekele", "Female", 1984, 4, 14, "+251 911 234 567", "Addis Ababa", "Regular follow-up for hypertension"),
                ("Dawit", "Tesfaye", "Male", 1978, 11, 3, "+251 912 345 678", "Addis Ababa", null),
                ("Selam", "Abebe", "Female", 1992, 7, 22, "+251 913 456 789", "Bahir Dar", "Prefers Amharic"),
                ("Yonas", "Hailu", "Male", 2001, 1, 9, "+251 914 567 890", "Hawassa", null),
                ("Hiwot", "Girma", "Female", 1965, 9, 30, "+251 915 678 901", "Addis Ababa", "Diabetes type 2"),
                ("Abebe", "Kebede", "Male", 1955, 2, 18, "+251 916 789 012", "Dire Dawa", null),
                ("Tigist", "Assefa", "Female", 1988, 6, 5, "+251 917 890 123", "Mekelle", "Pregnant — antenatal"),
                ("Bereket", "Mulugeta", "Male", 1995, 12, 12, "+251 918 901 234", "Addis Ababa", null),
                ("Meron", "Tadesse", "Female", 1972, 3, 27, "+251 919 012 345", "Gondar", "Asthma"),
                ("Fikru", "Worku", "Male", 1980, 8, 8, "+251 910 123 456", "Adama", null),
                ("Rahel", "Demissie", "Female", 1999, 5, 15, "+251 911 222 333", "Addis Ababa", null),
                ("Solomon", "Getachew", "Male", 1960, 10, 1, "+251 912 333 444", "Jimma", "Chronic kidney disease"),
                ("Bethlehem", "Alemu", "Female", 2005, 4, 20, "+251 913 444 555", "Addis Ababa", "Pediatric transfer"),
                ("Elias", "Negash", "Male", 1990, 7, 7, "+251 914 555 666", "Bahir Dar", null),
                ("Kidist", "Habte", "Female", 1983, 1, 25, "+251 915 666 777", "Addis Ababa", "CBHI member"),
                ("Mesfin", "Berhanu", "Male", 1975, 9, 14, "+251 916 777 888", "Hawassa", null),
                ("Sara", "Yilma", "Female", 1997, 11, 11, "+251 917 888 999", "Addis Ababa", null),
                ("Getnet", "Asfaw", "Male", 1950, 6, 2, "+251 918 999 000", "Dire Dawa", "Inactive — moved abroad"),
                ("Liya", "Mekonnen", "Female", 2008, 3, 3, "+251 919 000 111", "Addis Ababa", null),
                ("Daniel", "Zewde", "Male", 1986, 12, 28, "+251 910 111 222", "Mekelle", "Seasonal allergies"),
            };

            var toAdd = 20 - existing;
            var startIndex = existing;
            var now = DateTimeOffset.UtcNow;

            for (var i = 0; i < toAdd && i < demos.Length; i++)
            {
                var d = demos[i];
                var isInactive = string.Equals(d.First, "Getnet", StringComparison.OrdinalIgnoreCase);
                var patient = new Patient
                {
                    Id = Guid.NewGuid(),
                    MedicalRecordNumber = $"OCR-{(startIndex + i + 1):D6}",
                    FirstName = d.First,
                    LastName = d.Last,
                    DateOfBirth = new DateOnly(d.Year, d.Month, d.Day),
                    Sex = d.Sex,
                    Status = isInactive ? "Inactive" : "Active",
                    IsActive = !isInactive,
                    Phone = d.Phone,
                    City = d.City ?? "Addis Ababa",
                    PreferredLanguage = "Amharic",
                    Notes = d.Notes,
                    CreatedAt = now.AddDays(-(toAdd - i))
                };
                db.Patients.Add(patient);
            }

            await db.SaveChangesAsync();
            logger?.LogInformation("Seeded {Count} demo patient(s) (total target 20).", toAdd);
        }
        catch (Exception ex)
        {
            logger?.LogWarning(ex, "Could not seed demo patients. Register them manually if needed.");
        }
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
