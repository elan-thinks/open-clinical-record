using System.ComponentModel.DataAnnotations;

namespace OpenClinicalRecord.Api.DTOs.Appointments;

public class AppointmentDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string MedicalRecordNumber { get; set; } = string.Empty;
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public string AppointmentType { get; set; } = "Consultation";
    public string Status { get; set; } = "Scheduled";
    public string? ProviderName { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateAppointmentRequest
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public DateOnly AppointmentDate { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    public int DurationMinutes { get; set; } = 30;

    [MaxLength(40)]
    public string AppointmentType { get; set; } = "Consultation";

    [MaxLength(200)]
    public string? ProviderName { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusRequest
{
    [Required, MaxLength(32)]
    public string Status { get; set; } = string.Empty;

    /// <summary>Required when transitioning to Cancelled; optional otherwise.</summary>
    [MaxLength(500)]
    public string? Reason { get; set; }
}

public class RescheduleAppointmentRequest
{
    [Required]
    public DateOnly AppointmentDate { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    public int DurationMinutes { get; set; } = 30;

    [MaxLength(200)]
    public string? ProviderName { get; set; }

    /// <summary>Optional note explaining why the slot changed.</summary>
    [MaxLength(500)]
    public string? Reason { get; set; }
}

public class AppointmentEventDto
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? ActorName { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class DashboardStatsDto
{
    public int AppointmentsToday { get; set; }
    /// <summary>Today's appointments still Scheduled (not yet waiting/checked in).</summary>
    public int ScheduledCount { get; set; }
    /// <summary>Today's appointments with status Waiting only.</summary>
    public int WaitingCount { get; set; }
    /// <summary>Today's appointments with status CheckedIn only.</summary>
    public int CheckedInCount { get; set; }
    /// <summary>Today's appointments with status InProgress only.</summary>
    public int InProgressCount { get; set; }
    public int ActivePatients { get; set; }
    public int VisitsThisWeek { get; set; }
    /// <summary>Distinct patients with at least one recorded allergy (not open alerts).</summary>
    public int PatientsWithAllergies { get; set; }
    public List<AppointmentDto> TodaysSchedule { get; set; } = new();
}
