namespace OpenClinicalRecord.Api.Models.Entities;

/// <summary>
/// Append-only security/clinical accountability log.
/// Never update or delete rows from application code.
/// </summary>
public class AuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Machine action code, e.g. Auth.Login, Patient.Create, Appointment.StatusChange.</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Entity category: Patient, Appointment, Visit, User, Auth, etc.</summary>
    public string EntityType { get; set; } = string.Empty;

    public Guid? EntityId { get; set; }

    public string? ActorUserId { get; set; }
    public string? ActorName { get; set; }

    /// <summary>Short human-readable summary — not full clinical payload.</summary>
    public string? Summary { get; set; }

    /// <summary>Optional request correlation id for tracing.</summary>
    public string? CorrelationId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
