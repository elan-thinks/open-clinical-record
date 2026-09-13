using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Data;

/// <summary>
/// Application database context including ASP.NET Core Identity tables.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Patient> Patients => Set<Patient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            entity.Property(u => u.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.ToTable("Patients");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.MedicalRecordNumber).HasMaxLength(32).IsRequired();
            entity.HasIndex(p => p.MedicalRecordNumber).IsUnique();
            entity.Property(p => p.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(p => p.LastName).HasMaxLength(100).IsRequired();
            entity.Property(p => p.Sex).HasMaxLength(32);
            entity.Property(p => p.Status).HasMaxLength(32).IsRequired().HasDefaultValue("Active");
            entity.Property(p => p.NationalId).HasMaxLength(64);
            entity.Property(p => p.Phone).HasMaxLength(40);
            entity.Property(p => p.SecondaryPhone).HasMaxLength(40);
            entity.Property(p => p.Email).HasMaxLength(256);
            entity.Property(p => p.Address).HasMaxLength(256);
            entity.Property(p => p.City).HasMaxLength(100);
            entity.Property(p => p.EmergencyContactName).HasMaxLength(120);
            entity.Property(p => p.PreferredLanguage).HasMaxLength(64);
            entity.Property(p => p.InsuranceScheme).HasMaxLength(120);
            entity.Property(p => p.Notes).HasMaxLength(500);
            entity.Property(p => p.IsActive).HasDefaultValue(true);
            entity.HasIndex(p => new { p.LastName, p.FirstName });
        });
    }
}
