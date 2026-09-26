using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Clinical;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Clinical;

public sealed partial class ClinicalChartService
{
    public async Task<ServiceResult<VisitDto>> DocumentVisitAsync(
        Guid patientId, Guid visitId, DocumentVisitRequest request, ActorContext actor, CancellationToken ct)
    {
        if (request is null)
            return ServiceResult<VisitDto>.Fail("Request body is required.", ServiceErrorKind.Validation);

        // Load visit only (no includes). Dependents are loaded via separate queries so EF InMemory
        // does not dual-attach the same 1:1 / collection rows.
        var visit = await _db.ClinicalVisits
            .FirstOrDefaultAsync(v => v.Id == visitId && v.PatientId == patientId, ct);

        if (visit is null)
            return ServiceResult<VisitDto>.Fail("Visit not found for this patient.", ServiceErrorKind.NotFound);

        var patientRow = await _db.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.Id == patientId, ct);
        if (patientRow is not null && IsDeceased(patientRow))
            return ServiceResult<VisitDto>.Fail(
                "Cannot add clinical documentation for a deceased patient.", ServiceErrorKind.Validation);

        if (string.Equals(visit.Status, "Final", StringComparison.OrdinalIgnoreCase)
            || string.Equals(visit.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            return ServiceResult<VisitDto>.Fail(
                "This visit is closed and cannot be edited. Start a new consultation for new documentation.",
                ServiceErrorKind.Conflict);

        if (!string.IsNullOrWhiteSpace(request.ChiefComplaint))
            visit.ChiefComplaint = request.ChiefComplaint.Trim();
        if (!string.IsNullOrWhiteSpace(request.Plan))
            visit.Plan = request.Plan.Trim();
        if (!string.IsNullOrWhiteSpace(request.Instructions))
            visit.Instructions = request.Instructions.Trim();
        if (!string.IsNullOrWhiteSpace(request.EpisodeLabel))
            visit.EpisodeLabel = request.EpisodeLabel.Trim();
        if (!string.IsNullOrWhiteSpace(request.Location))
            visit.Location = request.Location.Trim();
        if (!string.IsNullOrWhiteSpace(request.Department))
            visit.Department = request.Department.Trim();

        if (HasAnyVitals(request))
        {
            var vitals = await _db.VitalSigns.FirstOrDefaultAsync(v => v.VisitId == visitId, ct);
            if (vitals is null)
            {
                vitals = new VitalSigns
                {
                    VisitId = visitId,
                    RecordedByUserId = actor.UserId,
                    RecordedByName = actor.DisplayName,
                    RecordedAt = DateTimeOffset.UtcNow
                };
                _db.VitalSigns.Add(vitals);
            }

            if (request.BloodPressure is not null) vitals.BloodPressure = NullIfEmpty(request.BloodPressure);
            if (request.Pulse.HasValue) vitals.Pulse = request.Pulse;
            if (request.TemperatureC.HasValue) vitals.TemperatureC = request.TemperatureC;
            if (request.RespiratoryRate.HasValue) vitals.RespiratoryRate = request.RespiratoryRate;
            if (request.Spo2.HasValue) vitals.Spo2 = request.Spo2;
            if (request.WeightKg.HasValue) vitals.WeightKg = request.WeightKg;
            if (request.HeightCm.HasValue) vitals.HeightCm = request.HeightCm;
            vitals.RecordedByUserId = actor.UserId;
            vitals.RecordedByName = actor.DisplayName;
            vitals.RecordedAt = DateTimeOffset.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(request.PrimaryDiagnosis)
            || !string.IsNullOrWhiteSpace(request.PrimaryDiagnosisCode))
        {
            var primary = await _db.Diagnoses.FirstOrDefaultAsync(d => d.VisitId == visitId && d.IsPrimary, ct);
            if (primary is null)
            {
                primary = new Diagnosis
                {
                    VisitId = visitId,
                    IsPrimary = true,
                    Code = NullIfEmpty(request.PrimaryDiagnosisCode),
                    Description = string.IsNullOrWhiteSpace(request.PrimaryDiagnosis)
                        ? (request.PrimaryDiagnosisCode ?? "Diagnosis")
                        : request.PrimaryDiagnosis.Trim()
                };
                _db.Diagnoses.Add(primary);
            }
            else
            {
                primary.Code = NullIfEmpty(request.PrimaryDiagnosisCode) ?? primary.Code;
                primary.Description = string.IsNullOrWhiteSpace(request.PrimaryDiagnosis)
                    ? (string.IsNullOrEmpty(primary.Description) ? (request.PrimaryDiagnosisCode ?? "Diagnosis") : primary.Description)
                    : request.PrimaryDiagnosis.Trim();
            }
        }

        if (!string.IsNullOrWhiteSpace(request.SecondaryDiagnosis)
            || !string.IsNullOrWhiteSpace(request.SecondaryDiagnosisCode))
        {
            var secondary = await _db.Diagnoses.FirstOrDefaultAsync(d => d.VisitId == visitId && !d.IsPrimary, ct);
            if (secondary is null)
            {
                secondary = new Diagnosis
                {
                    VisitId = visitId,
                    IsPrimary = false,
                    Code = NullIfEmpty(request.SecondaryDiagnosisCode),
                    Description = string.IsNullOrWhiteSpace(request.SecondaryDiagnosis)
                        ? (request.SecondaryDiagnosisCode ?? "Diagnosis")
                        : request.SecondaryDiagnosis.Trim()
                };
                _db.Diagnoses.Add(secondary);
            }
            else
            {
                secondary.Code = NullIfEmpty(request.SecondaryDiagnosisCode) ?? secondary.Code;
                secondary.Description = string.IsNullOrWhiteSpace(request.SecondaryDiagnosis)
                    ? (string.IsNullOrEmpty(secondary.Description) ? (request.SecondaryDiagnosisCode ?? "Diagnosis") : secondary.Description)
                    : request.SecondaryDiagnosis.Trim();
            }
        }

        if (!string.IsNullOrWhiteSpace(request.ClinicalNote))
        {
            _db.ClinicalNotes.Add(new ClinicalNote
            {
                VisitId = visitId,
                NoteType = string.IsNullOrWhiteSpace(request.NoteType) ? "Progress" : request.NoteType.Trim(),
                Content = request.ClinicalNote.Trim(),
                AuthorUserId = actor.UserId,
                AuthorName = actor.DisplayName,
                CreatedAt = DateTimeOffset.UtcNow
            });
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var newStatus = NormalizeVisitStatus(request.Status, visit.VisitType);
            visit.Status = newStatus;
            if (string.Equals(newStatus, "Final", StringComparison.OrdinalIgnoreCase))
            {
                visit.FinalizedAt = DateTimeOffset.UtcNow;
                visit.FinalizedByUserId = actor.UserId;
                visit.FinalizedByName = actor.DisplayName;
                visit.CheckOutAt ??= DateTimeOffset.UtcNow;
            }
        }

        visit.UpdatedAt = DateTimeOffset.UtcNow;
        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Never leak provider/SQL details to the client
            return ServiceResult<VisitDto>.Fail(
                "Could not save consultation.",
                ServiceErrorKind.Internal);
        }

        var loaded = await _db.ClinicalVisits.AsNoTracking()
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .AsSplitQuery()
            .FirstAsync(v => v.Id == visit.Id, ct);

        return ServiceResult<VisitDto>.Ok(MapVisit(loaded));
    }

    private async Task<Patient?> GetPatientAsync(Guid patientId, CancellationToken ct) =>
        await _db.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.Id == patientId, ct);

    private static bool IsDeceased(Patient p) =>
        string.Equals(p.Status, "Deceased", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeVisitStatus(string? status, string visitType)
    {
        if (string.IsNullOrWhiteSpace(status))
            return "Draft";
        if (string.Equals(status, "Final", StringComparison.OrdinalIgnoreCase)) return "Final";
        if (string.Equals(status, "Cancelled", StringComparison.OrdinalIgnoreCase)) return "Cancelled";
        return "Draft";
    }

    private static bool HasAnyVitals(CreateVisitRequest r) =>
        !string.IsNullOrWhiteSpace(r.BloodPressure)
        || r.Pulse.HasValue || r.TemperatureC.HasValue || r.RespiratoryRate.HasValue
        || r.Spo2.HasValue || r.WeightKg.HasValue || r.HeightCm.HasValue;

    private static bool HasAnyVitals(DocumentVisitRequest r) =>
        !string.IsNullOrWhiteSpace(r.BloodPressure)
        || r.Pulse.HasValue || r.TemperatureC.HasValue || r.RespiratoryRate.HasValue
        || r.Spo2.HasValue || r.WeightKg.HasValue || r.HeightCm.HasValue;

    private static string? NullIfEmpty(string? v) => string.IsNullOrWhiteSpace(v) ? null : v.Trim();

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
        Diagnoses = (v.Diagnoses ?? Array.Empty<Diagnosis>()).Select(d => new DiagnosisDto
        {
            Id = d.Id,
            IsPrimary = d.IsPrimary,
            Code = d.Code,
            Description = d.Description
        }).ToList(),
        Notes = (v.Notes ?? Array.Empty<ClinicalNote>()).Select(n => new ClinicalNoteDto
        {
            Id = n.Id,
            NoteType = n.NoteType,
            Content = n.Content,
            AuthorName = n.AuthorName,
            CreatedAt = n.CreatedAt
        }).ToList()
    };
}
