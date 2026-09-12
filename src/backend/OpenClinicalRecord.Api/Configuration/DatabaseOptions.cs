namespace OpenClinicalRecord.Api.Configuration;

/// <summary>
/// Strongly-typed database configuration section.
/// </summary>
public class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";

    /// <summary>
    /// PostgreSQL connection string. Prefer environment variables or user secrets in real deployments.
    /// </summary>
    public string DefaultConnection { get; set; } = string.Empty;
}
