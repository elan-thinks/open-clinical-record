namespace OpenClinicalRecord.Api.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "OpenClinicalRecord";
    public string Audience { get; set; } = "OpenClinicalRecord";

    /// <summary>
    /// Signing key. Prefer environment variable Jwt__Key or OCR_JWT_KEY.
    /// Must be at least 32 characters for HS256.
    /// </summary>
    public string Key { get; set; } = string.Empty;

    public int ExpirationMinutes { get; set; } = 480;
}
