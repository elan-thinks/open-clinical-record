using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Appointments;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private static readonly HashSet<string> AllowedStatus = new(StringComparer.OrdinalIgnoreCase)
    {
        "Scheduled", "Waiting", "CheckedIn", "InProgress", "Completed", "Cancelled", "NoShow"
    };

    private static readonly Dictionary<string, HashSet<string>> Transitions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Scheduled"] = new(StringComparer.OrdinalIgnoreCase)
                { "Waiting", "CheckedIn", "Cancelled", "NoShow" },
            ["Waiting"] = new(StringComparer.OrdinalIgnoreCase)
                { "CheckedIn", "Cancelled", "NoShow", "Scheduled" },
            ["CheckedIn"] = new(StringComparer.OrdinalIgnoreCase)
                { "InProgress", "Waiting", "Completed", "Cancelled" },
            ["InProgress"] = new(StringComparer.OrdinalIgnoreCase)
                { "Completed", "CheckedIn" },
            ["Cancelled"] = new(StringComparer.OrdinalIgnoreCase)
                { "Scheduled" },
            ["NoShow"] = new(StringComparer.OrdinalIgnoreCase)
                { "Scheduled" },
            ["Completed"] = new(StringComparer.OrdinalIgnoreCase),
        };

    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] DateOnly? date,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = _db.Appointments.AsNoTracking()
            .Include(a => a.Patient)
            .AsQueryable();

        if (date.HasValue)
        {
            query = query.Where(a => a.AppointmentDate == date.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Status == status);
        }

        var items = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.StartTime)
            .Take(200)
            .Select(a => Map(a))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var a = await _db.Appointments.AsNoTracking()
            .Include(x => x.Patient)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (a is null) return NotFound(new { message = "Appointment not found." });
        return Ok(Map(a));
    }

    [HttpGet("{id:guid}/events")]
    public async Task<IActionResult> ListEvents(Guid id, CancellationToken cancellationToken)
    {
        var exists = await _db.Appointments.AsNoTracking().AnyAsync(a => a.Id == id, cancellationToken);
        if (!exists) return NotFound(new { message = "Appointment not found." });

        var events = await _db.AppointmentEvents.AsNoTracking()
            .Where(e => e.AppointmentId == id)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new AppointmentEventDto
            {
                Id = e.Id,
                AppointmentId = e.AppointmentId,
                FromStatus = e.FromStatus,
                ToStatus = e.ToStatus,
                Reason = e.Reason,
                ActorName = e.ActorName,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(events);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var patient = await _db.Patients.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);
        if (patient is null) return BadRequest(new { message = "Patient not found." });

        if (string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Cannot book appointments for a deceased patient." });
        }

        var duration = request.DurationMinutes <= 0 ? 30 : request.DurationMinutes;
        var start = request.StartTime;
        var endMinutes = start.Hour * 60 + start.Minute + duration;

        if (!string.IsNullOrWhiteSpace(request.ProviderName))
        {
            var provider = request.ProviderName.Trim();
            var sameDay = await _db.Appointments.AsNoTracking()
                .Where(a => a.AppointmentDate == request.AppointmentDate
                            && a.ProviderName == provider
                            && a.Status != "Cancelled"
                            && a.Status != "NoShow"
                            && a.Status != "Completed")
                .ToListAsync(cancellationToken);

            foreach (var existing in sameDay)
            {
                var eStart = existing.StartTime.Hour * 60 + existing.StartTime.Minute;
                var eEnd = eStart + existing.DurationMinutes;
                var nStart = start.Hour * 60 + start.Minute;
                if (nStart < eEnd && endMinutes > eStart)
                {
                    return Conflict(new
                    {
                        message =
                            $"Time conflict with existing appointment at {existing.StartTime:HH\\:mm} ({existing.DurationMinutes} min) for {provider}."
                    });
                }
            }
        }

        var (userId, name) = GetCurrentUser();
        var appt = new Appointment
        {
            PatientId = request.PatientId,
            AppointmentDate = request.AppointmentDate,
            StartTime = request.StartTime,
            DurationMinutes = duration,
            AppointmentType = string.IsNullOrWhiteSpace(request.AppointmentType)
                ? "Consultation"
                : request.AppointmentType.Trim(),
            Status = "Scheduled",
            ProviderUserId = userId,
            ProviderName = string.IsNullOrWhiteSpace(request.ProviderName) ? name : request.ProviderName.Trim(),
            Reason = NullIfEmpty(request.Reason),
            Notes = NullIfEmpty(request.Notes),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync(cancellationToken);

        _db.AppointmentEvents.Add(new AppointmentEvent
        {
            AppointmentId = appt.Id,
            FromStatus = "",
            ToStatus = "Scheduled",
            Reason = "Created",
            ActorUserId = userId,
            ActorName = name,
            CreatedAt = DateTimeOffset.UtcNow
        });
        await _db.SaveChangesAsync(cancellationToken);

        appt.Patient = patient;
        return CreatedAtAction(nameof(Get), new { id = appt.Id }, Map(appt));
    }

    /// <summary>
    /// Routine appointment lifecycle (check-in, waiting, complete, cancel, no-show).
    /// Admin is intentionally excluded — operational role, not clinical/front-desk workflow.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Receptionist,Doctor,Nurse")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateAppointmentStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Status) || !AllowedStatus.Contains(request.Status.Trim()))
        {
            return BadRequest(new { message = "Invalid status." });
        }

        var toStatus = NormalizeStatus(request.Status);

        var appt = await _db.Appointments.Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (appt is null) return NotFound(new { message = "Appointment not found." });

        var fromStatus = appt.Status;
        if (string.Equals(fromStatus, toStatus, StringComparison.OrdinalIgnoreCase))
        {
            return Ok(Map(appt));
        }

        if (!IsTransitionAllowed(fromStatus, toStatus))
        {
            return BadRequest(new
            {
                message = $"Transition from '{fromStatus}' to '{toStatus}' is not allowed.",
                from = fromStatus,
                to = toStatus
            });
        }

        if (string.Equals(toStatus, "Cancelled", StringComparison.OrdinalIgnoreCase)
            && string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new { message = "A reason is required when cancelling an appointment." });
        }

        var (userId, name) = GetCurrentUser();
        appt.Status = toStatus;
        appt.UpdatedAt = DateTimeOffset.UtcNow;

        _db.AppointmentEvents.Add(new AppointmentEvent
        {
            AppointmentId = appt.Id,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            Reason = NullIfEmpty(request.Reason),
            ActorUserId = userId,
            ActorName = name,
            CreatedAt = DateTimeOffset.UtcNow
        });

        // Check-in opens a NEW clinical visit (never overwrites prior encounters).
        if (string.Equals(toStatus, "CheckedIn", StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _db.ClinicalVisits
                .AnyAsync(v => v.AppointmentId == appt.Id, cancellationToken);
            if (!existing)
            {
                _db.ClinicalVisits.Add(new ClinicalVisit
                {
                    PatientId = appt.PatientId,
                    AppointmentId = appt.Id,
                    VisitDate = DateTimeOffset.UtcNow,
                    VisitType = string.IsNullOrWhiteSpace(appt.AppointmentType)
                        ? "Consultation"
                        : appt.AppointmentType,
                    Status = "Draft",
                    ChiefComplaint = NullIfEmpty(appt.Reason),
                    ClinicianName = NullIfEmpty(appt.ProviderName),
                    Location = "Outpatient",
                    CheckInAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(Map(appt));
    }

    private static bool IsTransitionAllowed(string from, string to)
    {
        if (!Transitions.TryGetValue(from, out var allowed)) return false;
        return allowed.Contains(to);
    }

    private static string NormalizeStatus(string status)
    {
        foreach (var s in AllowedStatus)
        {
            if (string.Equals(s, status.Trim(), StringComparison.OrdinalIgnoreCase)) return s;
        }
        return "Scheduled";
    }

    private (string? userId, string fullName) GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = User.FindFirstValue("fullName")
                   ?? User.FindFirstValue(ClaimTypes.Name)
                   ?? User.Identity?.Name
                   ?? "Staff";
        return (userId, name);
    }

    private static string? NullIfEmpty(string? v) => string.IsNullOrWhiteSpace(v) ? null : v.Trim();

    private static AppointmentDto Map(Appointment a) => new()
    {
        Id = a.Id,
        PatientId = a.PatientId,
        PatientName = a.Patient is null ? "" : $"{a.Patient.FirstName} {a.Patient.LastName}",
        MedicalRecordNumber = a.Patient?.MedicalRecordNumber ?? "",
        AppointmentDate = a.AppointmentDate,
        StartTime = a.StartTime,
        DurationMinutes = a.DurationMinutes,
        AppointmentType = a.AppointmentType,
        Status = a.Status,
        ProviderName = a.ProviderName,
        Reason = a.Reason,
        Notes = a.Notes,
        CreatedAt = a.CreatedAt
    };
}
