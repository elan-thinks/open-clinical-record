namespace OpenClinicalRecord.Api.Models.Entities;

public class PatientAllergy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string Substance { get; set; } = string.Empty;
    public string? Reaction { get; set; }
    public string Severity { get; set; } = "Unknown";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
