using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Patients;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Patients;

public interface IPatientService
{
    Task<IReadOnlyList<PatientDto>> ListAsync(string? q, string? status, CancellationToken ct);
    Task<ServiceResult<PatientDto>> GetAsync(Guid id, CancellationToken ct);
    Task<ServiceResult<PatientDto>> CreateAsync(CreatePatientRequest request, CancellationToken ct);
    Task<ServiceResult<PatientDto>> UpdateAsync(Guid id, UpdatePatientRequest request, CancellationToken ct);
    Task<ServiceResult<PatientDto>> MarkDeceasedAsync(Guid id, MarkDeceasedRequest? request, ActorContext actor, CancellationToken ct);
    Task<ServiceResult<PatientDto>> ClearDeceasedAsync(Guid id, ActorContext actor, CancellationToken ct);
    Task<ServiceResult<DeathRecordDto>> GetDeathRecordAsync(Guid id, CancellationToken ct);
}

public sealed class PatientService : IPatientService
{
    private static readonly HashSet<string> AllowedSex = new(StringComparer.OrdinalIgnoreCase)
    {
        "Female", "Male", "Other", "Unknown"
    };

    private static readonly HashSet<string> AllowedStatus = new(StringComparer.OrdinalIgnoreCase)
    {
        "Active", "Inactive", "Deceased"
    };

    private readonly AppDbContext _db;

    public PatientService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<PatientDto>> ListAsync(string? q, string? status, CancellationToken ct)
    {
        var query = _db.Patients.AsNoTracking().AsQueryable();
        var statusKey = (status ?? "active").Trim().ToLowerInvariant();
        query = statusKey switch
        {
            "inactive" => query.Where(p => p.Status == "Inactive" || (!p.IsActive && p.Status != "Deceased")),
            "deceased" => query.Where(p => p.Status == "Deceased"),
            "all" => query,
            _ => query.Where(p => p.IsActive && p.Status != "Deceased")
        };

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLowerInvariant();
            query = query.Where(p =>
                p.MedicalRecordNumber.ToLower().Contains(term) ||
                p.FirstName.ToLower().Contains(term) ||
                p.LastName.ToLower().Contains(term) ||
                (p.Phone != null && p.Phone.ToLower().Contains(term)) ||
                (p.Email != null && p.Email.ToLower().Contains(term)));
        }

        return await query
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .Take(100)
            .Select(p => ToDto(p))
            .ToListAsync(ct);
    }

    public async Task<ServiceResult<PatientDto>> GetAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Patients.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null)
            return ServiceResult<PatientDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);
        return ServiceResult<PatientDto>.Ok(ToDto(p));
    }

    public async Task<ServiceResult<PatientDto>> CreateAsync(CreatePatientRequest request, CancellationToken ct)
    {
        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex, request.Status);
        if (validationError is not null)
            return ServiceResult<PatientDto>.Fail(validationError, ServiceErrorKind.Validation);

        var status = NormalizeStatus(request.Status);
        if (string.Equals(status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<PatientDto>.Fail(
                "Cannot register a patient as Deceased. Register as Active/Inactive, then use POST /api/patients/{id}/deceased if needed.",
                ServiceErrorKind.Validation);
        }

        var mrn = await NextMrnAsync(ct);
        var patient = new Patient
        {
            MedicalRecordNumber = mrn,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Sex = NormalizeSex(request.Sex),
            Status = status,
            NationalId = NullIfEmpty(request.NationalId),
            Phone = request.Phone!.Trim(),
            SecondaryPhone = NullIfEmpty(request.SecondaryPhone),
            Email = NullIfEmpty(request.Email),
            Address = NullIfEmpty(request.Address),
            City = NullIfEmpty(request.City) ?? "Addis Ababa",
            EmergencyContactName = NullIfEmpty(request.EmergencyContactName),
            PreferredLanguage = NullIfEmpty(request.PreferredLanguage),
            InsuranceScheme = NullIfEmpty(request.InsuranceScheme),
            Notes = NullIfEmpty(request.Notes),
            IsActive = status == "Active",
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Patients.Add(patient);
        await _db.SaveChangesAsync(ct);
        return ServiceResult<PatientDto>.Ok(ToDto(patient));
    }

    public async Task<ServiceResult<PatientDto>> UpdateAsync(Guid id, UpdatePatientRequest request, CancellationToken ct)
    {
        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex, request.Status);
        if (validationError is not null)
            return ServiceResult<PatientDto>.Fail(validationError, ServiceErrorKind.Validation);

        var patient = await _db.Patients.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (patient is null)
            return ServiceResult<PatientDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);

        var status = NormalizeStatus(request.Status);

        if (string.Equals(status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResult<PatientDto>.Fail(
                    "Cannot set status to Deceased via patient update. Use POST /api/patients/{id}/deceased so a death record is created and future appointments are cancelled.",
                    ServiceErrorKind.Validation);
            }
        }
        else if (string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase)
                 && !string.Equals(status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<PatientDto>.Fail(
                "Cannot clear deceased status via patient update. Use POST /api/patients/{id}/deceased/clear.",
                ServiceErrorKind.Validation);
        }

        patient.FirstName = request.FirstName.Trim();
        patient.LastName = request.LastName.Trim();
        patient.DateOfBirth = request.DateOfBirth;
        patient.Sex = NormalizeSex(request.Sex);
        if (!string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            patient.Status = status;
            patient.IsActive = status == "Active";
        }

        patient.NationalId = NullIfEmpty(request.NationalId);
        patient.Phone = request.Phone!.Trim();
        patient.SecondaryPhone = NullIfEmpty(request.SecondaryPhone);
        patient.Email = NullIfEmpty(request.Email);
        patient.Address = NullIfEmpty(request.Address);
        patient.City = NullIfEmpty(request.City);
        patient.EmergencyContactName = NullIfEmpty(request.EmergencyContactName);
        patient.PreferredLanguage = NullIfEmpty(request.PreferredLanguage);
        patient.InsuranceScheme = NullIfEmpty(request.InsuranceScheme);
        patient.Notes = NullIfEmpty(request.Notes);
        patient.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ServiceResult<PatientDto>.Ok(ToDto(patient));
    }

    public async Task<ServiceResult<PatientDto>> MarkDeceasedAsync(
        Guid id,
        MarkDeceasedRequest? request,
        ActorContext actor,
        CancellationToken ct)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (patient is null)
            return ServiceResult<PatientDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);

        if (string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
            return ServiceResult<PatientDto>.Ok(ToDto(patient));

        try
        {
            var prior = await _db.PatientDeathRecords
                .Where(r => r.PatientId == id && r.IsActive)
                .ToListAsync(ct);
            foreach (var r in prior)
            {
                r.IsActive = false;
                r.ClearedAt = DateTimeOffset.UtcNow;
                r.ClearedByUserId = actor.UserId;
                r.ClearedByName = actor.DisplayName;
            }

            _db.PatientDeathRecords.Add(new PatientDeathRecord
            {
                Id = Guid.NewGuid(),
                PatientId = id,
                DateOfDeath = request?.DateOfDeath,
                Note = string.IsNullOrWhiteSpace(request?.Note) ? null : request!.Note.Trim(),
                RecordedByUserId = actor.UserId,
                RecordedByName = actor.DisplayName,
                RecordedAt = DateTimeOffset.UtcNow,
                IsActive = true
            });
        }
        catch (Exception ex) when (IsMissingRelation(ex))
        {
            return ServiceResult<PatientDto>.Fail(
                "Death-record table is missing. Restart the API so schema can be created, or run: dotnet ef database update",
                ServiceErrorKind.Internal);
        }

        patient.Status = "Deceased";
        patient.IsActive = false;
        patient.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var future = await _db.Appointments
                .Where(a => a.PatientId == id
                            && a.AppointmentDate >= today
                            && (a.Status == "Scheduled" || a.Status == "Waiting" || a.Status == "CheckedIn"))
                .ToListAsync(ct);
            foreach (var a in future)
            {
                var from = a.Status;
                a.Status = "Cancelled";
                a.UpdatedAt = DateTimeOffset.UtcNow;
                try
                {
                    _db.AppointmentEvents.Add(new AppointmentEvent
                    {
                        Id = Guid.NewGuid(),
                        AppointmentId = a.Id,
                        FromStatus = from,
                        ToStatus = "Cancelled",
                        Reason = "Patient marked deceased",
                        ActorUserId = actor.UserId,
                        ActorName = actor.DisplayName,
                        CreatedAt = DateTimeOffset.UtcNow
                    });
                }
                catch
                {
                    /* optional history */
                }
            }
        }
        catch
        {
            /* appointments optional if table lag */
        }

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception)
        {
            return ServiceResult<PatientDto>.Fail(
                "Could not mark patient deceased.",
                ServiceErrorKind.Internal);
        }

        return ServiceResult<PatientDto>.Ok(ToDto(patient));
    }

    public async Task<ServiceResult<PatientDto>> ClearDeceasedAsync(Guid id, ActorContext actor, CancellationToken ct)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (patient is null)
            return ServiceResult<PatientDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);

        try
        {
            var active = await _db.PatientDeathRecords
                .Where(r => r.PatientId == id && r.IsActive)
                .ToListAsync(ct);
            foreach (var r in active)
            {
                r.IsActive = false;
                r.ClearedAt = DateTimeOffset.UtcNow;
                r.ClearedByUserId = actor.UserId;
                r.ClearedByName = actor.DisplayName;
            }
        }
        catch (Exception ex) when (IsMissingRelation(ex))
        {
            // Table missing — still allow status clear.
        }

        patient.Status = "Active";
        patient.IsActive = true;
        patient.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception)
        {
            return ServiceResult<PatientDto>.Fail(
                "Could not clear deceased status.",
                ServiceErrorKind.Internal);
        }

        return ServiceResult<PatientDto>.Ok(ToDto(patient));
    }

    public async Task<ServiceResult<DeathRecordDto>> GetDeathRecordAsync(Guid id, CancellationToken ct)
    {
        var exists = await _db.Patients.AsNoTracking().AnyAsync(p => p.Id == id, ct);
        if (!exists)
            return ServiceResult<DeathRecordDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);

        try
        {
            var record = await _db.PatientDeathRecords.AsNoTracking()
                .Where(r => r.PatientId == id)
                .OrderByDescending(r => r.RecordedAt)
                .Select(r => new DeathRecordDto
                {
                    Id = r.Id,
                    PatientId = r.PatientId,
                    DateOfDeath = r.DateOfDeath,
                    Note = r.Note,
                    RecordedByName = r.RecordedByName,
                    RecordedAt = r.RecordedAt,
                    IsActive = r.IsActive,
                    ClearedAt = r.ClearedAt,
                    ClearedByName = r.ClearedByName
                })
                .FirstOrDefaultAsync(ct);

            if (record is null)
                return ServiceResult<DeathRecordDto>.Fail("No death record.", ServiceErrorKind.NotFound);
            return ServiceResult<DeathRecordDto>.Ok(record);
        }
        catch (Exception ex) when (IsMissingRelation(ex))
        {
            return ServiceResult<DeathRecordDto>.Fail("No death record.", ServiceErrorKind.NotFound);
        }
    }

    private static bool IsMissingRelation(Exception ex)
    {
        var msg = (ex.InnerException?.Message ?? ex.Message) ?? string.Empty;
        return msg.Contains("does not exist", StringComparison.OrdinalIgnoreCase)
               || msg.Contains("42P01", StringComparison.OrdinalIgnoreCase)
               || msg.Contains("PatientDeathRecords", StringComparison.OrdinalIgnoreCase)
                  && msg.Contains("relation", StringComparison.OrdinalIgnoreCase);
    }

    private static string? ValidateDemographics(DateOnly? dob, string? sex, string? status)
    {
        if (!dob.HasValue) return "Date of birth is required.";
        if (dob.Value > DateOnly.FromDateTime(DateTime.UtcNow))
            return "Date of birth cannot be in the future.";
        if (string.IsNullOrWhiteSpace(sex) || !AllowedSex.Contains(sex.Trim()))
            return "Sex must be Female, Male, Other, or Unknown.";
        if (!string.IsNullOrWhiteSpace(status) && !AllowedStatus.Contains(status.Trim()))
            return "Status must be Active, Inactive, or Deceased.";
        return null;
    }

    private static string NormalizeStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return "Active";
        foreach (var a in AllowedStatus)
        {
            if (string.Equals(a, status.Trim(), StringComparison.OrdinalIgnoreCase)) return a;
        }
        return "Active";
    }

    private static string? NormalizeSex(string? sex)
    {
        if (string.IsNullOrWhiteSpace(sex)) return null;
        var t = sex.Trim();
        foreach (var a in AllowedSex)
        {
            if (string.Equals(a, t, StringComparison.OrdinalIgnoreCase)) return a;
        }
        return t;
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static PatientDto ToDto(Patient p) => new()
    {
        Id = p.Id,
        MedicalRecordNumber = p.MedicalRecordNumber,
        FirstName = p.FirstName,
        LastName = p.LastName,
        DateOfBirth = p.DateOfBirth,
        Sex = p.Sex,
        Status = p.Status,
        NationalId = p.NationalId,
        Phone = p.Phone,
        SecondaryPhone = p.SecondaryPhone,
        Email = p.Email,
        Address = p.Address,
        City = p.City,
        EmergencyContactName = p.EmergencyContactName,
        PreferredLanguage = p.PreferredLanguage,
        InsuranceScheme = p.InsuranceScheme,
        Notes = p.Notes,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };

    private async Task<string> NextMrnAsync(CancellationToken ct)
    {
        var count = await _db.Patients.CountAsync(ct);
        return $"OCR-{(count + 1):D6}";
    }
}
