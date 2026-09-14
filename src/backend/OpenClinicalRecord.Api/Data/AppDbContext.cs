using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PatientAllergy> PatientAllergies => Set<PatientAllergy>();
    public DbSet<MedicalHistoryItem> MedicalHistoryItems => Set<MedicalHistoryItem>();
    public DbSet<ClinicalVisit> ClinicalVisits => Set<ClinicalVisit>();
    public DbSet<VitalSigns> VitalSigns => Set<VitalSigns>();
    public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();
    public DbSet<ClinicalNote> ClinicalNotes => Set<ClinicalNote>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

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

        modelBuilder.Entity<PatientAllergy>(entity =>
        {
            entity.ToTable("PatientAllergies");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Substance).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Reaction).HasMaxLength(200);
            entity.Property(x => x.Severity).HasMaxLength(32).IsRequired();
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.PatientId);
        });

        modelBuilder.Entity<MedicalHistoryItem>(entity =>
        {
            entity.ToTable("MedicalHistoryItems");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Category).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500).IsRequired();
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.PatientId);
        });

        modelBuilder.Entity<ClinicalVisit>(entity =>
        {
            entity.ToTable("ClinicalVisits");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.VisitType).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.ChiefComplaint).HasMaxLength(500);
            entity.Property(x => x.Plan).HasMaxLength(1000);
            entity.Property(x => x.Instructions).HasMaxLength(500);
            entity.Property(x => x.ClinicianUserId).HasMaxLength(450);
            entity.Property(x => x.ClinicianName).HasMaxLength(200);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.PatientId);
            entity.HasIndex(x => x.VisitDate);
        });

        modelBuilder.Entity<VitalSigns>(entity =>
        {
            entity.ToTable("VitalSigns");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.BloodPressure).HasMaxLength(20);
            entity.Property(x => x.RespiratoryRate);
            entity.Property(x => x.TemperatureC).HasPrecision(4, 1);
            entity.Property(x => x.WeightKg).HasPrecision(6, 2);
            entity.Property(x => x.HeightCm).HasPrecision(5, 1);
            entity.Property(x => x.RecordedByUserId).HasMaxLength(450);
            entity.Property(x => x.RecordedByName).HasMaxLength(200);
            entity.HasOne(x => x.Visit).WithOne(v => v.VitalSigns).HasForeignKey<VitalSigns>(x => x.VisitId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.VisitId).IsUnique();
        });

        modelBuilder.Entity<Diagnosis>(entity =>
        {
            entity.ToTable("Diagnoses");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).HasMaxLength(32);
            entity.Property(x => x.Description).HasMaxLength(500).IsRequired();
            entity.HasOne(x => x.Visit).WithMany(v => v.Diagnoses).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.VisitId);
        });

        modelBuilder.Entity<ClinicalNote>(entity =>
        {
            entity.ToTable("ClinicalNotes");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.NoteType).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Content).IsRequired();
            entity.Property(x => x.AuthorUserId).HasMaxLength(450);
            entity.Property(x => x.AuthorName).HasMaxLength(200);
            entity.HasOne(x => x.Visit).WithMany(v => v.Notes).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.VisitId);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("Appointments");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.AppointmentType).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.ProviderUserId).HasMaxLength(450);
            entity.Property(x => x.ProviderName).HasMaxLength(200);
            entity.Property(x => x.Reason).HasMaxLength(500);
            entity.Property(x => x.Notes).HasMaxLength(500);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.AppointmentDate);
            entity.HasIndex(x => x.PatientId);
            entity.HasIndex(x => x.Status);
        });
    }
}
