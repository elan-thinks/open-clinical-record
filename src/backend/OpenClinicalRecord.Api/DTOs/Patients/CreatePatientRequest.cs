using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Patients;

public class CreatePatientRequest
{
    [Required(ErrorMessage = "First name is required.")]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required.")]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date of birth is required.")]
    public DateOnly? DateOfBirth { get; set; }

    [Required(ErrorMessage = "Sex is required.")]
    [MaxLength(32)]
    public string? Sex { get; set; }

    [MaxLength(32)]
    public string? Status { get; set; }

    [MaxLength(64)]
    public string? NationalId { get; set; }

    [Required(ErrorMessage = "Primary phone is required.")]
    [MaxLength(40)]
    public string? Phone { get; set; }

    [MaxLength(40)]
    public string? SecondaryPhone { get; set; }

    [EmailAddress(ErrorMessage = "Email is not valid.")]
    [MaxLength(256)]
    public string? Email { get; set; }

    [MaxLength(256)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(120)]
    public string? EmergencyContactName { get; set; }

    [MaxLength(64)]
    public string? PreferredLanguage { get; set; }

    [MaxLength(120)]
    public string? InsuranceScheme { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
