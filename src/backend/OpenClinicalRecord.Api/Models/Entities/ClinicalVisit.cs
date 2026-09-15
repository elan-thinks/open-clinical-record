namespace OpenClinicalRecord.Api.Models.Entities;

/// <summary>
/// A facility visit for a patient (OpenMRS/FHIR-inspired).
/// Patient is registered once; each attendance is a new Visit.
/// Clinical content (vitals, diagnoses, notes) is attached to the visit and is never overwritten
/// by a later visit.
/// </summary>
public class ClinicalVisit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    /// <summary>Optional link from appointment check-in → this visit.</summary>
    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public DateTimeOffset VisitDate { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>Consultation | Follow-up | Emergency | Vitals | Walk-in | Other</summary>
    public string VisitType { get; set; } = "Consultation";

    /// <summary>Draft | Final | Cancelled</summary>
    public string Status { get; set; } = "Draft";

    /// <summary>Optional grouping label (e.g. "Hypertension management") without a full Episode entity.</summary>
    public string? EpisodeLabel { get; set; }

    public string? Location { get; set; }
    public string? Department { get; set; }

    public string? ChiefComplaint { get; set; }
    public string? Plan { get; set; }
    public string? Instructions { get; set; }

    public string? ClinicianUserId { get; set; }
    public string? ClinicianName { get; set; }

    public DateTimeOffset? CheckInAt { get; set; }
    public DateTimeOffset? CheckOutAt { get; set; }

    public DateTimeOffset? FinalizedAt { get; set; }
    public string? FinalizedByUserId { get; set; }
    public string? FinalizedByName { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }

    /// <summary>Encounter content for this visit (1:1 vitals set in v1).</summary>
    public VitalSigns? VitalSigns { get; set; }
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<ClinicalNote> Notes { get; set; } = new List<ClinicalNote>();
}
