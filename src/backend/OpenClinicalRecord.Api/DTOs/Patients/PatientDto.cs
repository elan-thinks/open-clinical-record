namespace OpenClinicalRecord.Api.DTOs.Patients;

public class PatientDto
{
    public Guid Id { get; set; }
    public string MedicalRecordNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string? Sex { get; set; }
    public string Status { get; set; } = "Active";
    public string? NationalId { get; set; }
    public string? Phone { get; set; }
    public string? SecondaryPhone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? InsuranceScheme { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class MarkDeceasedRequest
{
    public DateOnly? DateOfDeath { get; set; }
    public string? Note { get; set; }
}

public class DeathRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public DateOnly? DateOfDeath { get; set; }
    public string? Note { get; set; }
    public string? RecordedByName { get; set; }
    public DateTimeOffset RecordedAt { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? ClearedAt { get; set; }
    public string? ClearedByName { get; set; }
}
