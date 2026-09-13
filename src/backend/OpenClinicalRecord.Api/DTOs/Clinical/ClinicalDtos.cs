using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Clinical;

public class AllergyDto
{
    public Guid Id { get; set; }
    public string Substance { get; set; } = string.Empty;
    public string? Reaction { get; set; }
    public string Severity { get; set; } = "Unknown";
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateAllergyRequest
{
    [Required, MaxLength(200)]
    public string Substance { get; set; } = string.Empty;
    [MaxLength(200)]
    public string? Reaction { get; set; }
    [MaxLength(32)]
    public string Severity { get; set; } = "Unknown";
}

public class HistoryItemDto
{
    public Guid Id { get; set; }
    public string Category { get; set; } = "Condition";
    public string Description { get; set; } = string.Empty;
    public DateOnly? OnsetDate { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateHistoryItemRequest
{
    [MaxLength(32)]
    public string Category { get; set; } = "Condition";
    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    public DateOnly? OnsetDate { get; set; }
}

public class VitalSignsDto
{
    public Guid Id { get; set; }
    public string? BloodPressure { get; set; }
    public int? Pulse { get; set; }
    public decimal? TemperatureC { get; set; }
    public int? Spo2 { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public string? RecordedByName { get; set; }
    public DateTimeOffset RecordedAt { get; set; }
}

public class DiagnosisDto
{
    public Guid Id { get; set; }
    public bool IsPrimary { get; set; }
    public string? Code { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class ClinicalNoteDto
{
    public Guid Id { get; set; }
    public string NoteType { get; set; } = "Progress";
    public string Content { get; set; } = string.Empty;
    public string? AuthorName { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class VisitDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public DateTimeOffset VisitDate { get; set; }
    public string VisitType { get; set; } = "Consultation";
    public string Status { get; set; } = "InProgress";
    public string? ChiefComplaint { get; set; }
    public string? Plan { get; set; }
    public string? Instructions { get; set; }
    public string? ClinicianName { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public VitalSignsDto? VitalSigns { get; set; }
    public List<DiagnosisDto> Diagnoses { get; set; } = new();
    public List<ClinicalNoteDto> Notes { get; set; } = new();
}

public class CreateVisitRequest
{
    [MaxLength(40)]
    public string VisitType { get; set; } = "Consultation";
    [MaxLength(500)]
    public string? ChiefComplaint { get; set; }
    [MaxLength(20)]
    public string? BloodPressure { get; set; }
    public int? Pulse { get; set; }
    public decimal? TemperatureC { get; set; }
    public int? Spo2 { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    [MaxLength(32)]
    public string? PrimaryDiagnosisCode { get; set; }
    [MaxLength(500)]
    public string? PrimaryDiagnosis { get; set; }
    [MaxLength(32)]
    public string? SecondaryDiagnosisCode { get; set; }
    [MaxLength(500)]
    public string? SecondaryDiagnosis { get; set; }
    [MaxLength(4000)]
    public string? ClinicalNote { get; set; }
    [MaxLength(1000)]
    public string? Plan { get; set; }
    [MaxLength(500)]
    public string? Instructions { get; set; }
    [MaxLength(32)]
    public string Status { get; set; } = "Completed";
}

public class PatientChartDto
{
    public Guid PatientId { get; set; }
    public string MedicalRecordNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string? Sex { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = "Active";
    public List<AllergyDto> Allergies { get; set; } = new();
    public List<HistoryItemDto> MedicalHistory { get; set; } = new();
    public List<VisitDto> Visits { get; set; } = new();
}
