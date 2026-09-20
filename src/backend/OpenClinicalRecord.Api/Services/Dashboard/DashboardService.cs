using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Appointments;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct);
}

public sealed class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db) => _db = db;

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct)
    {
        var today = ClinicTime.Today;
        // Week starts Monday in clinic local calendar
        var weekStart = today.AddDays(-((int)today.DayOfWeek + 6) % 7);

        var todays = await _db.Appointments.AsNoTracking()
            .Include(a => a.Patient)
            .Where(a => a.AppointmentDate == today)
            .OrderBy(a => a.StartTime)
            .ToListAsync(ct);

        var activePatients = await _db.Patients.AsNoTracking()
            .CountAsync(p => p.IsActive && p.Status != "Deceased", ct);
        var visitsWeek = await _db.ClinicalVisits.AsNoTracking()
            .CountAsync(v => ClinicTime.ToClinicDate(v.VisitDate) >= weekStart, ct);
        var patientsWithAllergies = await _db.PatientAllergies.AsNoTracking()
            .Select(a => a.PatientId).Distinct().CountAsync(ct);

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

        return new DashboardStatsDto
        {
            AppointmentsToday = todays.Count,
            ScheduledCount = todays.Count(a => a.Status == "Scheduled"),
            WaitingCount = todays.Count(a => a.Status == "Waiting"),
            CheckedInCount = todays.Count(a => a.Status == "CheckedIn"),
            InProgressCount = todays.Count(a => a.Status == "InProgress"),
            ActivePatients = activePatients,
            VisitsThisWeek = visitsWeek,
            PatientsWithAllergies = patientsWithAllergies,
            TodaysSchedule = schedule
        };
    }
}
