namespace OpenClinicalRecord.Api.Models.Entities;

public class ClinicalNote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VisitId { get; set; }
    public ClinicalVisit Visit { get; set; } = null!;
    public string NoteType { get; set; } = "Progress";
    public string Content { get; set; } = string.Empty;
    public string? AuthorUserId { get; set; }
    public string? AuthorName { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
