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
    public int? RespiratoryRate { get; set; }
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
    public Guid? AppointmentId { get; set; }
    public DateTimeOffset VisitDate { get; set; }
    public string VisitType { get; set; } = "Consultation";
    public string Status { get; set; } = "Draft";
    public string? EpisodeLabel { get; set; }
    public string? Location { get; set; }
    public string? Department { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? Plan { get; set; }
    public string? Instructions { get; set; }
    public string? ClinicianName { get; set; }
    public DateTimeOffset? CheckInAt { get; set; }
    public DateTimeOffset? CheckOutAt { get; set; }
    public DateTimeOffset? FinalizedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public VitalSignsDto? VitalSigns { get; set; }
    public List<DiagnosisDto> Diagnoses { get; set; } = new();
    public List<ClinicalNoteDto> Notes { get; set; } = new();
}

public class CreateVisitRequest
{
    public Guid? AppointmentId { get; set; }
    [MaxLength(40)]
    public string VisitType { get; set; } = "Consultation";
    [MaxLength(200)]
    public string? EpisodeLabel { get; set; }
    [MaxLength(120)]
    public string? Location { get; set; }
    [MaxLength(120)]
    public string? Department { get; set; }
    [MaxLength(500)]
    public string? ChiefComplaint { get; set; }
    [MaxLength(20)]
    public string? BloodPressure { get; set; }
    public int? Pulse { get; set; }
    public decimal? TemperatureC { get; set; }
    public int? RespiratoryRate { get; set; }
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
    public string Status { get; set; } = "Draft";
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
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string Status { get; set; } = "Active";
    public List<AllergyDto> Allergies { get; set; } = new();
    public List<HistoryItemDto> MedicalHistory { get; set; } = new();
    public List<VisitDto> Visits { get; set; } = new();
}

/// <summary>
/// Document an existing open visit (e.g. Draft from check-in). Does not create a new visit row.
/// </summary>
public class DocumentVisitRequest
{
    [MaxLength(20)]
    public string? BloodPressure { get; set; }
    public int? Pulse { get; set; }
    public decimal? TemperatureC { get; set; }
    public int? RespiratoryRate { get; set; }
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
    [MaxLength(500)]
    public string? ChiefComplaint { get; set; }
    /// <summary>Draft | Final. Finalizing seals the visit for historical display.</summary>
    [MaxLength(32)]
    public string? Status { get; set; }
}
