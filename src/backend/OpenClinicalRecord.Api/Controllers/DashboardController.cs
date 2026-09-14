using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Appointments;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats(CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(int)today.DayOfWeek);

        var todays = await _db.Appointments.AsNoTracking()
            .Include(a => a.Patient)
            .Where(a => a.AppointmentDate == today)
            .OrderBy(a => a.StartTime)
            .ToListAsync(cancellationToken);

        var activePatients = await _db.Patients.AsNoTracking().CountAsync(p => p.IsActive, cancellationToken);
        var visitsWeek = await _db.ClinicalVisits.AsNoTracking()
            .CountAsync(v => DateOnly.FromDateTime(v.VisitDate.UtcDateTime) >= weekStart, cancellationToken);
        var allergyPatients = await _db.PatientAllergies.AsNoTracking()
            .Select(a => a.PatientId).Distinct().CountAsync(cancellationToken);

        var schedule = todays.Select(a => new AppointmentDto
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
        }).ToList();

        return Ok(new DashboardStatsDto
        {
            AppointmentsToday = todays.Count,
            WaitingCount = todays.Count(a => a.Status is "Waiting" or "Scheduled"),
            CheckedInCount = todays.Count(a => a.Status is "CheckedIn" or "InProgress"),
            ActivePatients = activePatients,
            VisitsThisWeek = visitsWeek,
            OpenChartAlerts = allergyPatients,
            TodaysSchedule = schedule
        });
    }
}
