using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Clinical;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/patients/{patientId:guid}/chart")]
[Authorize]
public class ClinicalChartController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClinicalChartController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PatientChartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChart(Guid patientId, CancellationToken cancellationToken)
    {
        var patient = await _db.Patients.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == patientId, cancellationToken);
        if (patient is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

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
            .ToListAsync(cancellationToken);

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
            .ToListAsync(cancellationToken);

        var visits = await _db.ClinicalVisits.AsNoTracking()
            .Where(v => v.PatientId == patientId)
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .OrderByDescending(v => v.VisitDate)
            .Take(50)
            .ToListAsync(cancellationToken);

        return Ok(new PatientChartDto
        {
            PatientId = patient.Id,
            MedicalRecordNumber = patient.MedicalRecordNumber,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Sex = patient.Sex,
            Phone = patient.Phone,
            Status = patient.Status,
            Allergies = allergies,
            MedicalHistory = history,
            Visits = visits.Select(MapVisit).ToList()
        });
    }

    [HttpPost("allergies")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> AddAllergy(Guid patientId, [FromBody] CreateAllergyRequest request, CancellationToken cancellationToken)
    {
        if (!await PatientExists(patientId, cancellationToken))
        {
            return NotFound(new { message = "Patient not found." });
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var entity = new PatientAllergy
        {
            PatientId = patientId,
            Substance = request.Substance.Trim(),
            Reaction = string.IsNullOrWhiteSpace(request.Reaction) ? null : request.Reaction.Trim(),
            Severity = string.IsNullOrWhiteSpace(request.Severity) ? "Unknown" : request.Severity.Trim()
        };
        _db.PatientAllergies.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new AllergyDto
        {
            Id = entity.Id,
            Substance = entity.Substance,
            Reaction = entity.Reaction,
            Severity = entity.Severity,
            CreatedAt = entity.CreatedAt
        });
    }

    [HttpPost("history")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> AddHistory(Guid patientId, [FromBody] CreateHistoryItemRequest request, CancellationToken cancellationToken)
    {
        if (!await PatientExists(patientId, cancellationToken))
        {
            return NotFound(new { message = "Patient not found." });
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var entity = new MedicalHistoryItem
        {
            PatientId = patientId,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Condition" : request.Category.Trim(),
            Description = request.Description.Trim(),
            OnsetDate = request.OnsetDate,
            IsActive = true
        };
        _db.MedicalHistoryItems.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new HistoryItemDto
        {
            Id = entity.Id,
            Category = entity.Category,
            Description = entity.Description,
            OnsetDate = entity.OnsetDate,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        });
    }

    [HttpPost("visits")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> CreateVisit(Guid patientId, [FromBody] CreateVisitRequest request, CancellationToken cancellationToken)
    {
        if (!await PatientExists(patientId, cancellationToken))
        {
            return NotFound(new { message = "Patient not found." });
        }

        var (userId, fullName) = GetCurrentUser();
        var visit = new ClinicalVisit
        {
            PatientId = patientId,
            VisitDate = DateTimeOffset.UtcNow,
            VisitType = string.IsNullOrWhiteSpace(request.VisitType) ? "Consultation" : request.VisitType.Trim(),
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Completed" : request.Status.Trim(),
            ChiefComplaint = NullIfEmpty(request.ChiefComplaint),
            Plan = NullIfEmpty(request.Plan),
            Instructions = NullIfEmpty(request.Instructions),
            ClinicianUserId = userId,
            ClinicianName = fullName
        };

        if (HasAnyVital(request))
        {
            visit.VitalSigns = new VitalSigns
            {
                BloodPressure = NullIfEmpty(request.BloodPressure),
                Pulse = request.Pulse,
                TemperatureC = request.TemperatureC,
                Spo2 = request.Spo2,
                WeightKg = request.WeightKg,
                HeightCm = request.HeightCm,
                RecordedByUserId = userId,
                RecordedByName = fullName,
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
                AuthorUserId = userId,
                AuthorName = fullName
            });
        }

        _db.ClinicalVisits.Add(visit);
        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await _db.ClinicalVisits.AsNoTracking()
            .Include(v => v.VitalSigns)
            .Include(v => v.Diagnoses)
            .Include(v => v.Notes)
            .FirstAsync(v => v.Id == visit.Id, cancellationToken);

        return CreatedAtAction(nameof(GetChart), new { patientId }, MapVisit(loaded));
    }

    private async Task<bool> PatientExists(Guid patientId, CancellationToken cancellationToken) =>
        await _db.Patients.AnyAsync(p => p.Id == patientId, cancellationToken);

    private (string? userId, string fullName) GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = User.FindFirstValue("fullName")
                   ?? User.FindFirstValue(ClaimTypes.Name)
                   ?? User.Identity?.Name
                   ?? "Clinician";
        return (userId, name);
    }

    private static bool HasAnyVital(CreateVisitRequest r) =>
        !string.IsNullOrWhiteSpace(r.BloodPressure)
        || r.Pulse.HasValue
        || r.TemperatureC.HasValue
        || r.Spo2.HasValue
        || r.WeightKg.HasValue
        || r.HeightCm.HasValue;

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static VisitDto MapVisit(ClinicalVisit v) => new()
    {
        Id = v.Id,
        PatientId = v.PatientId,
        VisitDate = v.VisitDate,
        VisitType = v.VisitType,
        Status = v.Status,
        ChiefComplaint = v.ChiefComplaint,
        Plan = v.Plan,
        Instructions = v.Instructions,
        ClinicianName = v.ClinicianName,
        CreatedAt = v.CreatedAt,
        VitalSigns = v.VitalSigns is null ? null : new VitalSignsDto
        {
            Id = v.VitalSigns.Id,
            BloodPressure = v.VitalSigns.BloodPressure,
            Pulse = v.VitalSigns.Pulse,
            TemperatureC = v.VitalSigns.TemperatureC,
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
