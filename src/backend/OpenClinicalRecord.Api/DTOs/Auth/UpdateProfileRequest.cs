using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Auth;

public class UpdateProfileRequest
{
    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;
}
