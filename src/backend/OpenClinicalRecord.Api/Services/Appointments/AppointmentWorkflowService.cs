using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Appointments;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Appointments;

public interface IAppointmentWorkflowService
{
    Task<IReadOnlyList<AppointmentDto>> ListAsync(DateOnly? date, string? status, CancellationToken ct);
    Task<ServiceResult<AppointmentDto>> GetAsync(Guid id, CancellationToken ct);
    Task<ServiceResult<IReadOnlyList<AppointmentEventDto>>> ListEventsAsync(Guid id, CancellationToken ct);
    Task<ServiceResult<AppointmentDto>> CreateAsync(CreateAppointmentRequest request, ActorContext actor, CancellationToken ct);
    Task<ServiceResult<AppointmentDto>> UpdateStatusAsync(Guid id, UpdateAppointmentStatusRequest request, ActorContext actor, CancellationToken ct);
    Task<ServiceResult<AppointmentDto>> RescheduleAsync(Guid id, RescheduleAppointmentRequest request, ActorContext actor, CancellationToken ct);
}

public sealed class AppointmentWorkflowService : IAppointmentWorkflowService
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

    public AppointmentWorkflowService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<AppointmentDto>> ListAsync(DateOnly? date, string? status, CancellationToken ct)
    {
        // Week 7: project in SQL — avoid materializing full Appointment + Patient graphs for list views
        var query = _db.Appointments.AsNoTracking().AsQueryable();

        if (date.HasValue)
            query = query.Where(a => a.AppointmentDate == date.Value);

        if (!string.IsNullOrWhiteSpace(status) && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
            query = query.Where(a => a.Status == status);

        return await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.StartTime)
            .Take(200)
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
    }

    public async Task<ServiceResult<AppointmentDto>> GetAsync(Guid id, CancellationToken ct)
    {
        var a = await _db.Appointments.AsNoTracking()
            .Include(x => x.Patient)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a is null)
            return ServiceResult<AppointmentDto>.Fail("Appointment not found.", ServiceErrorKind.NotFound);
        return ServiceResult<AppointmentDto>.Ok(Map(a));
    }

    public async Task<ServiceResult<IReadOnlyList<AppointmentEventDto>>> ListEventsAsync(Guid id, CancellationToken ct)
    {
        var exists = await _db.Appointments.AsNoTracking().AnyAsync(a => a.Id == id, ct);
        if (!exists)
            return ServiceResult<IReadOnlyList<AppointmentEventDto>>.Fail("Appointment not found.", ServiceErrorKind.NotFound);

        try
        {
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
                .ToListAsync(ct);

            return ServiceResult<IReadOnlyList<AppointmentEventDto>>.Ok(events);
        }
        catch (Exception)
        {
            return ServiceResult<IReadOnlyList<AppointmentEventDto>>.Fail(
                "Could not load appointment history.",
                ServiceErrorKind.Internal);
        }
    }

    public async Task<ServiceResult<AppointmentDto>> CreateAsync(
        CreateAppointmentRequest request,
        ActorContext actor,
        CancellationToken ct)
    {
        if (request.PatientId == Guid.Empty)
            return ServiceResult<AppointmentDto>.Fail("Patient is required.", ServiceErrorKind.Validation);

        var patient = await _db.Patients.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PatientId, ct);
        if (patient is null)
            return ServiceResult<AppointmentDto>.Fail("Patient not found. Register the patient first.", ServiceErrorKind.Validation);

        if (string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
            return ServiceResult<AppointmentDto>.Fail(
                "Cannot book appointments for a deceased patient.", ServiceErrorKind.Validation);

        var duration = request.DurationMinutes <= 0 ? 30 : request.DurationMinutes;
        if (duration > 240)
            return ServiceResult<AppointmentDto>.Fail("Duration cannot exceed 4 hours.", ServiceErrorKind.Validation);

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
                .ToListAsync(ct);

            foreach (var existing in sameDay)
            {
                var eStart = existing.StartTime.Hour * 60 + existing.StartTime.Minute;
                var eEnd = eStart + existing.DurationMinutes;
                var nStart = start.Hour * 60 + start.Minute;
                if (nStart < eEnd && endMinutes > eStart)
                {
                    return ServiceResult<AppointmentDto>.Fail(
                        $"Time conflict with existing appointment at {existing.StartTime:HH\\:mm} ({existing.DurationMinutes} min) for {provider}.",
                        ServiceErrorKind.Conflict);
                }
            }
        }

        var providerUserId = string.IsNullOrWhiteSpace(actor.UserId) ? null : actor.UserId.Trim();
        var providerName = string.IsNullOrWhiteSpace(request.ProviderName)
            ? (string.IsNullOrWhiteSpace(actor.DisplayName) ? "Staff" : actor.DisplayName.Trim())
            : request.ProviderName.Trim();

        var appt = new Appointment
        {
            Id = Guid.NewGuid(),
            PatientId = request.PatientId,
            AppointmentDate = request.AppointmentDate,
            StartTime = request.StartTime,
            DurationMinutes = duration,
            AppointmentType = string.IsNullOrWhiteSpace(request.AppointmentType)
                ? "Consultation"
                : request.AppointmentType.Trim(),
            Status = "Scheduled",
            ProviderUserId = providerUserId,
            ProviderName = providerName,
            Reason = NullIfEmpty(request.Reason),
            Notes = NullIfEmpty(request.Notes),
            CreatedAt = DateTimeOffset.UtcNow
        };

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            _db.Appointments.Add(appt);
            _db.AppointmentEvents.Add(new AppointmentEvent
            {
                Id = Guid.NewGuid(),
                AppointmentId = appt.Id,
                FromStatus = "None",
                ToStatus = "Scheduled",
                Reason = "Created",
                ActorUserId = providerUserId,
                ActorName = providerName,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch (Exception)
        {
            await tx.RollbackAsync(ct);
            return ServiceResult<AppointmentDto>.Fail(
                "Could not save appointment.",
                ServiceErrorKind.Internal);
        }

        return ServiceResult<AppointmentDto>.Ok(Map(appt, patient));
    }

    public async Task<ServiceResult<AppointmentDto>> UpdateStatusAsync(
        Guid id,
        UpdateAppointmentStatusRequest request,
        ActorContext actor,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Status) || !AllowedStatus.Contains(request.Status.Trim()))
            return ServiceResult<AppointmentDto>.Fail("Invalid status.", ServiceErrorKind.Validation);

        var toStatus = NormalizeStatus(request.Status);

        var appt = await _db.Appointments.Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        if (appt is null)
            return ServiceResult<AppointmentDto>.Fail("Appointment not found.", ServiceErrorKind.NotFound);

        var fromStatus = appt.Status;
        if (string.Equals(fromStatus, toStatus, StringComparison.OrdinalIgnoreCase))
            return ServiceResult<AppointmentDto>.Ok(Map(appt));

        if (!IsTransitionAllowed(fromStatus, toStatus))
        {
            return ServiceResult<AppointmentDto>.Fail(
                $"Transition from '{fromStatus}' to '{toStatus}' is not allowed.",
                ServiceErrorKind.Validation);
        }

        if (string.Equals(toStatus, "Cancelled", StringComparison.OrdinalIgnoreCase)
            && string.IsNullOrWhiteSpace(request.Reason))
        {
            return ServiceResult<AppointmentDto>.Fail(
                "A reason is required when cancelling an appointment.",
                ServiceErrorKind.Validation);
        }

        appt.Status = toStatus;
        appt.UpdatedAt = DateTimeOffset.UtcNow;

        if (string.Equals(toStatus, "CheckedIn", StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _db.ClinicalVisits.AnyAsync(v => v.AppointmentId == appt.Id, ct);
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

        _db.AppointmentEvents.Add(new AppointmentEvent
        {
            Id = Guid.NewGuid(),
            AppointmentId = appt.Id,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            Reason = NullIfEmpty(request.Reason),
            ActorUserId = string.IsNullOrWhiteSpace(actor.UserId) ? null : actor.UserId,
            ActorName = actor.DisplayName,
            CreatedAt = DateTimeOffset.UtcNow
        });

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception)
        {
            return ServiceResult<AppointmentDto>.Fail(
                "Could not update appointment.",
                ServiceErrorKind.Internal);
        }

        return ServiceResult<AppointmentDto>.Ok(Map(appt));
    }

    public async Task<ServiceResult<AppointmentDto>> RescheduleAsync(
        Guid id,
        RescheduleAppointmentRequest request,
        ActorContext actor,
        CancellationToken ct)
    {
        var appt = await _db.Appointments.Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        if (appt is null)
            return ServiceResult<AppointmentDto>.Fail("Appointment not found.", ServiceErrorKind.NotFound);

        if (string.Equals(appt.Status, "Completed", StringComparison.OrdinalIgnoreCase)
            || string.Equals(appt.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase)
            || string.Equals(appt.Status, "InProgress", StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<AppointmentDto>.Fail(
                $"Cannot reschedule an appointment in status '{appt.Status}'.",
                ServiceErrorKind.Validation);
        }

        if (appt.Patient is not null
            && string.Equals(appt.Patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<AppointmentDto>.Fail(
                "Cannot reschedule appointments for a deceased patient.",
                ServiceErrorKind.Validation);
        }

        var duration = request.DurationMinutes <= 0 ? appt.DurationMinutes : request.DurationMinutes;
        if (duration <= 0) duration = 30;

        var provider = string.IsNullOrWhiteSpace(request.ProviderName)
            ? appt.ProviderName
            : request.ProviderName.Trim();

        if (!string.IsNullOrWhiteSpace(provider))
        {
            var endMinutes = request.StartTime.Hour * 60 + request.StartTime.Minute + duration;
            var sameDay = await _db.Appointments.AsNoTracking()
                .Where(a => a.Id != id
                            && a.AppointmentDate == request.AppointmentDate
                            && a.ProviderName == provider
                            && a.Status != "Cancelled"
                            && a.Status != "NoShow"
                            && a.Status != "Completed")
                .ToListAsync(ct);

            foreach (var existing in sameDay)
            {
                var eStart = existing.StartTime.Hour * 60 + existing.StartTime.Minute;
                var eEnd = eStart + existing.DurationMinutes;
                var nStart = request.StartTime.Hour * 60 + request.StartTime.Minute;
                if (nStart < eEnd && endMinutes > eStart)
                {
                    return ServiceResult<AppointmentDto>.Fail(
                        $"Time conflict with existing appointment at {existing.StartTime:HH\\:mm} for {provider}.",
                        ServiceErrorKind.Conflict);
                }
            }
        }

        var oldSummary =
            $"{appt.AppointmentDate:yyyy-MM-dd} {appt.StartTime:HH\\:mm} ({appt.DurationMinutes} min)";
        var newSummary =
            $"{request.AppointmentDate:yyyy-MM-dd} {request.StartTime:HH\\:mm} ({duration} min)";

        var fromStatus = appt.Status;
        appt.AppointmentDate = request.AppointmentDate;
        appt.StartTime = request.StartTime;
        appt.DurationMinutes = duration;
        if (!string.IsNullOrWhiteSpace(provider)
            ) appt.ProviderName = provider;
        if (string.Equals(fromStatus, "Cancelled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(fromStatus, "NoShow", StringComparison.OrdinalIgnoreCase))
        {
            appt.Status = "Scheduled";
        }

        appt.UpdatedAt = DateTimeOffset.UtcNow;

        _db.AppointmentEvents.Add(new AppointmentEvent
        {
            Id = Guid.NewGuid(),
            AppointmentId = appt.Id,
            FromStatus = fromStatus,
            ToStatus = appt.Status,
            Reason = string.IsNullOrWhiteSpace(request.Reason)
                ? $"Rescheduled: {oldSummary} -> {newSummary}"
                : $"Rescheduled: {oldSummary} -> {newSummary}. {request.Reason.Trim()}",
            ActorUserId = string.IsNullOrWhiteSpace(actor.UserId) ? null : actor.UserId,
            ActorName = actor.DisplayName,
            CreatedAt = DateTimeOffset.UtcNow
        });

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception)
        {
            return ServiceResult<AppointmentDto>.Fail(
                "Could not reschedule appointment.",
                ServiceErrorKind.Internal);
        }

        return ServiceResult<AppointmentDto>.Ok(Map(appt));
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

    private static string? NullIfEmpty(string? v) => string.IsNullOrWhiteSpace(v) ? null : v.Trim();

    private static AppointmentDto Map(Appointment a, Patient? patient = null)
    {
        var p = patient ?? a.Patient;
        return new AppointmentDto
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = p is null ? "" : $"{p.FirstName} {p.LastName}",
            MedicalRecordNumber = p?.MedicalRecordNumber ?? "",
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
}
