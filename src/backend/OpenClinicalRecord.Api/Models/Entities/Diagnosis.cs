namespace OpenClinicalRecord.Api.Models.Entities;

public class Diagnosis
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VisitId { get; set; }
    public ClinicalVisit Visit { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public string? Code { get; set; }
    public string Description { get; set; } = string.Empty;
}
