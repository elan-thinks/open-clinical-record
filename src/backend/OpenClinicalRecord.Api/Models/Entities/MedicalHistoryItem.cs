namespace OpenClinicalRecord.Api.Models.Entities;

public class MedicalHistoryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string Category { get; set; } = "Condition";
    public string Description { get; set; } = string.Empty;
    public DateOnly? OnsetDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
