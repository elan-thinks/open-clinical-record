using Microsoft.AspNetCore.Identity;

namespace OpenClinicalRecord.Api.Models.Entities;

/// <summary>
/// Application user stored by ASP.NET Core Identity.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
