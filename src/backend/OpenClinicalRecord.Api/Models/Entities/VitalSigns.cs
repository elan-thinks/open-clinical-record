namespace OpenClinicalRecord.Api.Models.Entities;

public class VitalSigns
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VisitId { get; set; }
    public ClinicalVisit Visit { get; set; } = null!;
    public string? BloodPressure { get; set; }
    public int? Pulse { get; set; }
    public decimal? TemperatureC { get; set; }
    public int? RespiratoryRate { get; set; }
    public int? Spo2 { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public string? RecordedByUserId { get; set; }
    public string? RecordedByName { get; set; }
    public DateTimeOffset RecordedAt { get; set; } = DateTimeOffset.UtcNow;
}
