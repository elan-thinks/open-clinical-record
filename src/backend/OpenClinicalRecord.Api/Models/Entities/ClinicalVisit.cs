namespace OpenClinicalRecord.Api.Models.Entities;

public class ClinicalVisit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public DateTimeOffset VisitDate { get; set; } = DateTimeOffset.UtcNow;
    public string VisitType { get; set; } = "Consultation";
    public string Status { get; set; } = "InProgress";
    public string? ChiefComplaint { get; set; }
    public string? Plan { get; set; }
    public string? Instructions { get; set; }
    public string? ClinicianUserId { get; set; }
    public string? ClinicianName { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }

    public VitalSigns? VitalSigns { get; set; }
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<ClinicalNote> Notes { get; set; } = new List<ClinicalNote>();
}
