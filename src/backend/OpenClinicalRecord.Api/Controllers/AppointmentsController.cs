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

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist,Doctor,Nurse")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var patient = await _db.Patients.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PatientId, cancellationToken);
        if (patient is null) return BadRequest(new { message = "Patient not found." });

        var (userId, name) = GetCurrentUser();
        var appt = new Appointment
        {
            PatientId = request.PatientId,
            AppointmentDate = request.AppointmentDate,
            StartTime = request.StartTime,
            DurationMinutes = request.DurationMinutes <= 0 ? 30 : request.DurationMinutes,
            AppointmentType = string.IsNullOrWhiteSpace(request.AppointmentType) ? "Consultation" : request.AppointmentType.Trim(),
            Status = "Scheduled",
            ProviderUserId = userId,
            ProviderName = string.IsNullOrWhiteSpace(request.ProviderName) ? name : request.ProviderName.Trim(),
            Reason = NullIfEmpty(request.Reason),
            Notes = NullIfEmpty(request.Notes),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync(cancellationToken);

        appt.Patient = patient;
        return CreatedAtAction(nameof(Get), new { id = appt.Id }, Map(appt));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Receptionist,Doctor,Nurse")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAppointmentStatusRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Status) || !AllowedStatus.Contains(request.Status.Trim()))
        {
            return BadRequest(new { message = "Invalid status." });
        }

        var appt = await _db.Appointments.Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (appt is null) return NotFound(new { message = "Appointment not found." });

        appt.Status = NormalizeStatus(request.Status);
        appt.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(Map(appt));
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
