using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Clinical;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Clinical;

public interface IClinicalChartService
{
    Task<ServiceResult<PatientChartDto>> GetChartAsync(Guid patientId, CancellationToken ct);
    Task<ServiceResult<VisitDto>> GetVisitAsync(Guid patientId, Guid visitId, CancellationToken ct);
    Task<ServiceResult<AllergyDto>> AddAllergyAsync(Guid patientId, CreateAllergyRequest request, CancellationToken ct);
    Task<ServiceResult<HistoryItemDto>> AddHistoryAsync(Guid patientId, CreateHistoryItemRequest request, CancellationToken ct);
    Task<ServiceResult<VisitDto>> CreateVisitAsync(Guid patientId, CreateVisitRequest request, ActorContext actor, CancellationToken ct);
    Task<ServiceResult<VisitDto>> DocumentVisitAsync(Guid patientId, Guid visitId, DocumentVisitRequest request, ActorContext actor, CancellationToken ct);
}

public sealed class ClinicalChartService : IClinicalChartService
{
    private readonly AppDbContext _db;

    public ClinicalChartService(AppDbContext db) => _db = db;

    public async Task<ServiceResult<PatientChartDto>> GetChartAsync(Guid patientId, CancellationToken ct)
    {
        var patient = await _db.Patients.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == patientId, ct);
        if (patient is null)
            return ServiceResult<PatientChartDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);

        var allergies = await _db.PatientAllergies.AsNoTracking()
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AllergyDto
            {
                Id = a.Id,
                Substance = a.Substance,
                Reaction = a.Reaction,
                Severity = a.Severity,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(ct);

        var history = await _db.MedicalHistoryItems.AsNoTracking()
            .Where(h => h.PatientId == patientId)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new HistoryItemDto
            {
                Id = h.Id,
                Category = h.Category,
                Description = h.Description,
                OnsetDate = h.OnsetDate,
                IsActive = h.IsActive,
                CreatedAt = h.CreatedAt
            })
            .ToListAsync(ct);

        var visits = await _db.ClinicalVisits.AsNoTracking()
            .Where(v => v.PatientId == patientId)
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .OrderByDescending(v => v.VisitDate)
            .Take(50)
            .ToListAsync(ct);

        return ServiceResult<PatientChartDto>.Ok(new PatientChartDto
        {
            PatientId = patient.Id,
            MedicalRecordNumber = patient.MedicalRecordNumber,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Sex = patient.Sex,
            Phone = patient.Phone,
            Email = patient.Email,
            Address = patient.Address,
            City = patient.City,
            Status = patient.Status,
            Allergies = allergies,
            MedicalHistory = history,
            Visits = visits.Select(MapVisit).ToList()
        });
    }

    public async Task<ServiceResult<VisitDto>> GetVisitAsync(Guid patientId, Guid visitId, CancellationToken ct)
    {
        var visit = await _db.ClinicalVisits.AsNoTracking()
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .FirstOrDefaultAsync(v => v.Id == visitId && v.PatientId == patientId, ct);

        if (visit is null)
            return ServiceResult<VisitDto>.Fail("Visit not found for this patient.", ServiceErrorKind.NotFound);

        return ServiceResult<VisitDto>.Ok(MapVisit(visit));
    }

    public async Task<ServiceResult<AllergyDto>> AddAllergyAsync(
        Guid patientId, CreateAllergyRequest request, CancellationToken ct)
    {
        var patient = await GetPatientAsync(patientId, ct);
        if (patient is null)
            return ServiceResult<AllergyDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);
        if (IsDeceased(patient))
            return ServiceResult<AllergyDto>.Fail(
                "Cannot modify clinical data for a deceased patient.", ServiceErrorKind.Validation);

        var entity = new PatientAllergy
        {
            PatientId = patientId,
            Substance = request.Substance.Trim(),
            Reaction = string.IsNullOrWhiteSpace(request.Reaction) ? null : request.Reaction.Trim(),
            Severity = string.IsNullOrWhiteSpace(request.Severity) ? "Unknown" : request.Severity.Trim()
        };
        _db.PatientAllergies.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ServiceResult<AllergyDto>.Ok(new AllergyDto
        {
            Id = entity.Id,
            Substance = entity.Substance,
            Reaction = entity.Reaction,
            Severity = entity.Severity,
            CreatedAt = entity.CreatedAt
        });
    }

    public async Task<ServiceResult<HistoryItemDto>> AddHistoryAsync(
        Guid patientId, CreateHistoryItemRequest request, CancellationToken ct)
    {
        var patient = await GetPatientAsync(patientId, ct);
        if (patient is null)
            return ServiceResult<HistoryItemDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);
        if (IsDeceased(patient))
            return ServiceResult<HistoryItemDto>.Fail(
                "Cannot modify clinical data for a deceased patient.", ServiceErrorKind.Validation);

        var entity = new MedicalHistoryItem
        {
            PatientId = patientId,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Condition" : request.Category.Trim(),
            Description = request.Description.Trim(),
            OnsetDate = request.OnsetDate,
            IsActive = true
        };
        _db.MedicalHistoryItems.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ServiceResult<HistoryItemDto>.Ok(new HistoryItemDto
        {
            Id = entity.Id,
            Category = entity.Category,
            Description = entity.Description,
            OnsetDate = entity.OnsetDate,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        });
    }

    public async Task<ServiceResult<VisitDto>> CreateVisitAsync(
        Guid patientId, CreateVisitRequest request, ActorContext actor, CancellationToken ct)
    {
        var patient = await GetPatientAsync(patientId, ct);
        if (patient is null)
            return ServiceResult<VisitDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);
        if (IsDeceased(patient))
            return ServiceResult<VisitDto>.Fail(
                "Cannot add clinical documentation for a deceased patient.", ServiceErrorKind.Validation);

        if (request.AppointmentId.HasValue)
        {
            var apptOk = await _db.Appointments.AnyAsync(
                a => a.Id == request.AppointmentId.Value && a.PatientId == patientId, ct);
            if (!apptOk)
                return ServiceResult<VisitDto>.Fail(
                    "Appointment not found for this patient.", ServiceErrorKind.Validation);
        }

        var visitType = string.IsNullOrWhiteSpace(request.VisitType) ? "Consultation" : request.VisitType.Trim();
        var status = NormalizeVisitStatus(request.Status, visitType);

        var visit = new ClinicalVisit
        {
            PatientId = patientId,
            AppointmentId = request.AppointmentId,
            VisitDate = DateTimeOffset.UtcNow,
            VisitType = visitType,
            Status = status,
            EpisodeLabel = NullIfEmpty(request.EpisodeLabel),
            Location = NullIfEmpty(request.Location),
            Department = NullIfEmpty(request.Department),
            ChiefComplaint = NullIfEmpty(request.ChiefComplaint),
            Plan = NullIfEmpty(request.Plan),
            Instructions = NullIfEmpty(request.Instructions),
            ClinicianUserId = actor.UserId,
            ClinicianName = actor.DisplayName,
            CheckInAt = DateTimeOffset.UtcNow,
            FinalizedAt = status == "Final" ? DateTimeOffset.UtcNow : null,
            FinalizedByUserId = status == "Final" ? actor.UserId : null,
            FinalizedByName = status == "Final" ? actor.DisplayName : null
        };

        if (HasAnyVital(request))
        {
            visit.VitalSigns = new VitalSigns
            {
                BloodPressure = NullIfEmpty(request.BloodPressure),
                Pulse = request.Pulse,
                TemperatureC = request.TemperatureC,
                RespiratoryRate = request.RespiratoryRate,
                Spo2 = request.Spo2,
                WeightKg = request.WeightKg,
                HeightCm = request.HeightCm,
                RecordedByUserId = actor.UserId,
                RecordedByName = actor.DisplayName,
                RecordedAt = DateTimeOffset.UtcNow
            };
        }

        if (!string.IsNullOrWhiteSpace(request.PrimaryDiagnosis))
        {
            visit.Diagnoses.Add(new Diagnosis
            {
                IsPrimary = true,
                Code = NullIfEmpty(request.PrimaryDiagnosisCode),
                Description = request.PrimaryDiagnosis.Trim()
            });
        }

        if (!string.IsNullOrWhiteSpace(request.SecondaryDiagnosis))
        {
            visit.Diagnoses.Add(new Diagnosis
            {
                IsPrimary = false,
                Code = NullIfEmpty(request.SecondaryDiagnosisCode),
                Description = request.SecondaryDiagnosis.Trim()
            });
        }

        if (!string.IsNullOrWhiteSpace(request.ClinicalNote))
        {
            visit.Notes.Add(new ClinicalNote
            {
                NoteType = "Progress",
                Content = request.ClinicalNote.Trim(),
                AuthorUserId = actor.UserId,
                AuthorName = actor.DisplayName
            });
        }

        _db.ClinicalVisits.Add(visit);
        await _db.SaveChangesAsync(ct);

        var loaded = await _db.ClinicalVisits.AsNoTracking()
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .FirstAsync(v => v.Id == visit.Id, ct);

        return ServiceResult<VisitDto>.Ok(MapVisit(loaded));
    }

    public async Task<ServiceResult<VisitDto>> DocumentVisitAsync(
        Guid patientId, Guid visitId, DocumentVisitRequest request, ActorContext actor, CancellationToken ct)
    {
        var patient = await GetPatientAsync(patientId, ct);
        if (patient is null)
            return ServiceResult<VisitDto>.Fail("Patient not found.", ServiceErrorKind.NotFound);
        if (IsDeceased(patient))
            return ServiceResult<VisitDto>.Fail(
                "Cannot modify clinical data for a deceased patient.", ServiceErrorKind.Validation);

        var visit = await _db.ClinicalVisits
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .FirstOrDefaultAsync(v => v.Id == visitId && v.PatientId == patientId, ct);

        if (visit is null)
            return ServiceResult<VisitDto>.Fail("Visit not found for this patient.", ServiceErrorKind.NotFound);

        if (string.Equals(visit.Status, "Final", StringComparison.OrdinalIgnoreCase)
            || string.Equals(visit.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<VisitDto>.Fail(
                "Cannot document a finalized or cancelled visit. Create a new visit instead.",
                ServiceErrorKind.Validation);
        }

        if (!string.IsNullOrWhiteSpace(request.ChiefComplaint))
            visit.ChiefComplaint = request.ChiefComplaint.Trim();
        if (!string.IsNullOrWhiteSpace(request.Plan))
            visit.Plan = request.Plan.Trim();
        if (!string.IsNullOrWhiteSpace(request.Instructions))
            visit.Instructions = request.Instructions.Trim();

        if (HasAnyVitalDoc(request))
        {
            if (visit.VitalSigns is null)
            {
                visit.VitalSigns = new VitalSigns
                {
                    VisitId = visit.Id,
                    BloodPressure = NullIfEmpty(request.BloodPressure),
                    Pulse = request.Pulse,
                    TemperatureC = request.TemperatureC,
                    RespiratoryRate = request.RespiratoryRate,
                    Spo2 = request.Spo2,
                    WeightKg = request.WeightKg,
                    HeightCm = request.HeightCm,
                    RecordedByUserId = actor.UserId,
                    RecordedByName = actor.DisplayName,
                    RecordedAt = DateTimeOffset.UtcNow
                };
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(request.BloodPressure))
                    visit.VitalSigns.BloodPressure = request.BloodPressure.Trim();
                if (request.Pulse.HasValue) visit.VitalSigns.Pulse = request.Pulse;
                if (request.TemperatureC.HasValue) visit.VitalSigns.TemperatureC = request.TemperatureC;
                if (request.RespiratoryRate.HasValue) visit.VitalSigns.RespiratoryRate = request.RespiratoryRate;
                if (request.Spo2.HasValue) visit.VitalSigns.Spo2 = request.Spo2;
                if (request.WeightKg.HasValue) visit.VitalSigns.WeightKg = request.WeightKg;
                if (request.HeightCm.HasValue) visit.VitalSigns.HeightCm = request.HeightCm;
                visit.VitalSigns.RecordedByUserId = actor.UserId;
                visit.VitalSigns.RecordedByName = actor.DisplayName;
                visit.VitalSigns.RecordedAt = DateTimeOffset.UtcNow;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.PrimaryDiagnosis))
        {
            visit.Diagnoses.Add(new Diagnosis
            {
                VisitId = visit.Id,
                IsPrimary = true,
                Code = NullIfEmpty(request.PrimaryDiagnosisCode),
                Description = request.PrimaryDiagnosis.Trim()
            });
        }

        if (!string.IsNullOrWhiteSpace(request.SecondaryDiagnosis))
        {
            visit.Diagnoses.Add(new Diagnosis
            {
                VisitId = visit.Id,
                IsPrimary = false,
                Code = NullIfEmpty(request.SecondaryDiagnosisCode),
                Description = request.SecondaryDiagnosis.Trim()
            });
        }

        if (!string.IsNullOrWhiteSpace(request.ClinicalNote))
        {
            visit.Notes.Add(new ClinicalNote
            {
                VisitId = visit.Id,
                NoteType = "Progress",
                Content = request.ClinicalNote.Trim(),
                AuthorUserId = actor.UserId,
                AuthorName = actor.DisplayName
            });
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var next = NormalizeVisitStatus(request.Status, visit.VisitType);
            visit.Status = next;
            if (next == "Final")
            {
                visit.FinalizedAt = DateTimeOffset.UtcNow;
                visit.FinalizedByUserId = actor.UserId;
                visit.FinalizedByName = actor.DisplayName;
                visit.CheckOutAt ??= DateTimeOffset.UtcNow;
            }
        }

        await _db.SaveChangesAsync(ct);

        var loaded = await _db.ClinicalVisits.AsNoTracking()
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .FirstAsync(v => v.Id == visit.Id, ct);

        return ServiceResult<VisitDto>.Ok(MapVisit(loaded));
    }

    private async Task<Patient?> GetPatientAsync(Guid patientId, CancellationToken ct) =>
        await _db.Patients.FirstOrDefaultAsync(p => p.Id == patientId, ct);

    private static bool IsDeceased(Patient patient) =>
        string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeVisitStatus(string? status, string visitType)
    {
        if (string.IsNullOrWhiteSpace(status)) return "Draft";
        var s = status.Trim();
        if (string.Equals(s, "Completed", StringComparison.OrdinalIgnoreCase)) return "Final";
        if (string.Equals(s, "InProgress", StringComparison.OrdinalIgnoreCase)) return "Draft";
        if (string.Equals(s, "Draft", StringComparison.OrdinalIgnoreCase)) return "Draft";
        if (string.Equals(s, "Final", StringComparison.OrdinalIgnoreCase)) return "Final";
        if (string.Equals(s, "Cancelled", StringComparison.OrdinalIgnoreCase)) return "Cancelled";
        return "Draft";
    }

    private static bool HasAnyVital(CreateVisitRequest r) =>
        !string.IsNullOrWhiteSpace(r.BloodPressure)
        || r.Pulse.HasValue || r.TemperatureC.HasValue || r.RespiratoryRate.HasValue
        || r.Spo2.HasValue || r.WeightKg.HasValue || r.HeightCm.HasValue;

    private static bool HasAnyVitalDoc(DocumentVisitRequest r) =>
        !string.IsNullOrWhiteSpace(r.BloodPressure)
        || r.Pulse.HasValue || r.TemperatureC.HasValue || r.RespiratoryRate.HasValue
        || r.Spo2.HasValue || r.WeightKg.HasValue || r.HeightCm.HasValue;

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static VisitDto MapVisit(ClinicalVisit v) => new()
    {
        Id = v.Id,
        PatientId = v.PatientId,
        AppointmentId = v.AppointmentId,
        VisitDate = v.VisitDate,
        VisitType = v.VisitType,
        Status = v.Status,
        EpisodeLabel = v.EpisodeLabel,
        Location = v.Location,
        Department = v.Department,
        ChiefComplaint = v.ChiefComplaint,
        Plan = v.Plan,
        Instructions = v.Instructions,
        ClinicianName = v.ClinicianName,
        CheckInAt = v.CheckInAt,
        CheckOutAt = v.CheckOutAt,
        FinalizedAt = v.FinalizedAt,
        CreatedAt = v.CreatedAt,
        VitalSigns = v.VitalSigns is null ? null : new VitalSignsDto
        {
            Id = v.VitalSigns.Id,
            BloodPressure = v.VitalSigns.BloodPressure,
            Pulse = v.VitalSigns.Pulse,
            TemperatureC = v.VitalSigns.TemperatureC,
            RespiratoryRate = v.VitalSigns.RespiratoryRate,
            Spo2 = v.VitalSigns.Spo2,
            WeightKg = v.VitalSigns.WeightKg,
            HeightCm = v.VitalSigns.HeightCm,
            RecordedByName = v.VitalSigns.RecordedByName,
            RecordedAt = v.VitalSigns.RecordedAt
        },
        Diagnoses = v.Diagnoses.Select(d => new DiagnosisDto
        {
            Id = d.Id,
            IsPrimary = d.IsPrimary,
            Code = d.Code,
            Description = d.Description
        }).ToList(),
        Notes = v.Notes.Select(n => new ClinicalNoteDto
        {
            Id = n.Id,
            NoteType = n.NoteType,
            Content = n.Content,
            AuthorName = n.AuthorName,
            CreatedAt = n.CreatedAt
        }).ToList()
    };
}
