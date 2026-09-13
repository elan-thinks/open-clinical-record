using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Patients;

public class CreatePatientRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    [MaxLength(32)]
    public string? Sex { get; set; }

    [MaxLength(40)]
    public string? Phone { get; set; }

    [EmailAddress]
    [MaxLength(256)]
    public string? Email { get; set; }
}
