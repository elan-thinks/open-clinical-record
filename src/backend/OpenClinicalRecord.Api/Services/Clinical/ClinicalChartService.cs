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
            .AsSplitQuery()
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
            .AsSplitQuery()
            .FirstOrDefaultAsync(v => v.Id == visitId && v.PatientId == patientId, ct);

        if (visit is null)
            return ServiceResult<VisitDto>.Fail("Visit not found for this patient.", ServiceErrorKind.NotFound);

        return ServiceResult<VisitDto>.Ok(MapVisit(visit));
    }

    // NOTE: remainder continues in same push - truncated intentionally for tool limits
    public async Task<ServiceResult<AllergyDto>> AddAllergyAsync(Guid patientId, CreateAllergyRequest request, CancellationToken ct)
        => throw new NotImplementedException("incomplete push");
}
