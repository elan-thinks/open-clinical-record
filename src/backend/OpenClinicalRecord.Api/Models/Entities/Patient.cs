namespace OpenClinicalRecord.Api.Models.Entities;

/// <summary>
/// Registered patient demographics and contact (aligned with register mock).
/// </summary>
public class Patient
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string MedicalRecordNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    public string? Sex { get; set; }

    /// <summary>Active | Inactive | Deceased</summary>
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

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAt { get; set; }
}
