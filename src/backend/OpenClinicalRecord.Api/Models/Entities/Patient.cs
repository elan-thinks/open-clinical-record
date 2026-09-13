namespace OpenClinicalRecord.Api.Models.Entities;

/// <summary>
/// Registered patient (demographics only for this milestone).
/// </summary>
public class Patient
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string MedicalRecordNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    public string? Sex { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAt { get; set; }
}
