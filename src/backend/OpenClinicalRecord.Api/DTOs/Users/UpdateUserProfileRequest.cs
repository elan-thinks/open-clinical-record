using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Users;

public class UpdateUserProfileRequest
{
    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;
}

public class ResetUserPasswordRequest
{
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;
}
