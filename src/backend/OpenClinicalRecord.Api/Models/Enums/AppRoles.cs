namespace OpenClinicalRecord.Api.Models.Enums;

/// <summary>
/// Four application roles used for authorization. Values match JWT role claims.
/// Doctor, Nurse, Receptionist (clinical/front-desk) and Admin (system administration).
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
