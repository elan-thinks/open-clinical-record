using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Users;

public class CreateUserRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(2)]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<string> Roles { get; set; } = new();
}
