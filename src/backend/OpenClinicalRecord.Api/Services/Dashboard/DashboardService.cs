using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Appointments;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct);
}

/// <summary>
/// Dashboard aggregates. Queries run sequentially on one scoped DbContext
/// (EF Core contexts are not thread-safe — do not parallelize with Task.WhenAll).
/// </summary>
public sealed class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db) => _db = db;

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct)
    {
        var today = ClinicTime.Today;
        // Week starts Monday in clinic local calendar
        var weekStart = today.AddDays(-((int)today.DayOfWeek + 6) % 7);
        // Precompute UTC bound so EF can translate VisitDate >= constant (no ClinicTime.* in LINQ)
        var weekStartUtc = ClinicTime.StartOfClinicDayUtc(weekStart);

        // Project to DTO in SQL — avoid loading full Appointment + Patient graphs
        var schedule = await _db.Appointments.AsNoTracking()
            .Where(a => a.AppointmentDate == today)
            .OrderBy(a => a.StartTime)
            .Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = a.Patient == null
                    ? ""
                    : a.Patient.FirstName + " " + a.Patient.LastName,
                MedicalRecordNumber = a.Patient != null ? a.Patient.MedicalRecordNumber : "",
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                DurationMinutes = a.DurationMinutes,
                AppointmentType = a.AppointmentType,
                Status = a.Status,
                ProviderName = a.ProviderName,
                Reason = a.Reason,
                Notes = a.Notes,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(ct);

        var activePatients = await _db.Patients.AsNoTracking()
            .CountAsync(p => p.IsActive && p.Status != "Deceased", ct);

        var visitsWeek = await _db.ClinicalVisits.AsNoTracking()
            .CountAsync(v => v.VisitDate >= weekStartUtc, ct);

        var patientsWithAllergies = await _db.PatientAllergies.AsNoTracking()
            .Select(a => a.PatientId)
            .Distinct()
            .CountAsync(ct);

        return new DashboardStatsDto
        {
            AppointmentsToday = schedule.Count,
            ScheduledCount = schedule.Count(a => a.Status == "Scheduled"),
            WaitingCount = schedule.Count(a => a.Status == "Waiting"),
            CheckedInCount = schedule.Count(a => a.Status == "CheckedIn"),
            InProgressCount = schedule.Count(a => a.Status == "InProgress"),
            ActivePatients = activePatients,
            VisitsThisWeek = visitsWeek,
            PatientsWithAllergies = patientsWithAllergies,
            TodaysSchedule = schedule
        };
    }
}
