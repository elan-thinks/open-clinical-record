namespace OpenClinicalRecord.Api.Models.Entities;

/// <summary>
/// Provenance for deceased status. Patient is not deleted; history is retained.
/// </summary>
public class PatientDeathRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public DateOnly? DateOfDeath { get; set; }
    public string? Note { get; set; }
    public string? RecordedByUserId { get; set; }
    public string? RecordedByName { get; set; }
    public DateTimeOffset RecordedAt { get; set; } = DateTimeOffset.UtcNow;
    /// <summary>When status was cleared back to Active (soft undo).</summary>
    public DateTimeOffset? ClearedAt { get; set; }
    public string? ClearedByUserId { get; set; }
    public string? ClearedByName { get; set; }
    public bool IsActive { get; set; } = true;
}
