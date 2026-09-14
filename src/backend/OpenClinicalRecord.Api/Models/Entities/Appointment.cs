namespace OpenClinicalRecord.Api.Models.Entities;

public class Appointment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public string AppointmentType { get; set; } = "Consultation";
    public string Status { get; set; } = "Scheduled";
    public string? ProviderUserId { get; set; }
    public string? ProviderName { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }
}
