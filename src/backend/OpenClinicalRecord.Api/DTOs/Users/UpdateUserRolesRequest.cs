using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Users;

public class UpdateUserRolesRequest
{
    [Required]
    [MinLength(1)]
    public List<string> Roles { get; set; } = new();
}
