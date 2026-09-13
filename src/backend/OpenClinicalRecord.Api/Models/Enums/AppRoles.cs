namespace OpenClinicalRecord.Api.Models.Enums;

/// <summary>
/// Application roles used for authorization. Values match JWT role claims.
/// </summary>
public static class AppRoles
{
    public const string Doctor = "Doctor";
    public const string Nurse = "Nurse";
    public const string Receptionist = "Receptionist";
    public const string Admin = "Admin";

    public static readonly string[] All =
    [
        Doctor,
        Nurse,
        Receptionist,
        Admin
    ];
}
