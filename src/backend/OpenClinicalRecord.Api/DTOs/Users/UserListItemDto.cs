namespace OpenClinicalRecord.Api.DTOs.Users;

public class UserListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
    public DateTimeOffset CreatedAt { get; set; }
}
