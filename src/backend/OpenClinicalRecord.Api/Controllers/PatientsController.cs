using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.DTOs.Patients;
using OpenClinicalRecord.Api.Models.Entities;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController : ControllerBase
{
    private static readonly HashSet<string> AllowedSex = new(StringComparer.OrdinalIgnoreCase)
    {
        "Female", "Male"
    };

    private static readonly HashSet<string> AllowedStatus = new(StringComparer.OrdinalIgnoreCase)
    {
        "Active", "Inactive", "Deceased"
    };

    private readonly AppDbContext _db;

    public PatientsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status, CancellationToken cancellationToken)
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

        var items = await query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName).Take(100)
            .Select(p => ToDto(p)).ToListAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var p = await _db.Patients.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return p is null ? NotFound(new { message = "Patient not found." }) : Ok(ToDto(p));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex, request.Status);
        if (validationError is not null) return BadRequest(new { message = validationError });

        var status = NormalizeStatus(request.Status);
        var patient = new Patient
        {
            MedicalRecordNumber = await NextMrnAsync(cancellationToken),
            FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(),
            DateOfBirth = request.DateOfBirth, Sex = NormalizeSex(request.Sex), Status = status,
            NationalId = NullIfEmpty(request.NationalId), Phone = request.Phone!.Trim(),
            SecondaryPhone = NullIfEmpty(request.SecondaryPhone), Email = NullIfEmpty(request.Email),
            Address = NullIfEmpty(request.Address), City = NullIfEmpty(request.City) ?? "Addis Ababa",
            EmergencyContactName = NullIfEmpty(request.EmergencyContactName),
            PreferredLanguage = NullIfEmpty(request.PreferredLanguage),
            InsuranceScheme = NullIfEmpty(request.InsuranceScheme), Notes = NullIfEmpty(request.Notes),
            IsActive = status == "Active", CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Patients.Add(patient);
        await _db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = patient.Id }, ToDto(patient));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist,Doctor,Nurse")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex, request.Status);
        if (validationError is not null) return BadRequest(new { message = validationError });

        var patient = await _db.Patients.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (patient is null) return NotFound(new { message = "Patient not found." });

        var status = NormalizeStatus(request.Status);
        patient.FirstName = request.FirstName.Trim();
        patient.LastName = request.LastName.Trim();
        patient.DateOfBirth = request.DateOfBirth;
        patient.Sex = NormalizeSex(request.Sex);
        patient.Status = status;
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
        patient.IsActive = status == "Active";
        patient.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(patient));
    }

    private static string? ValidateDemographics(DateOnly? dob, string? sex, string? status)
    {
        if (!dob.HasValue) return "Date of birth is required.";
        if (dob.Value > DateOnly.FromDateTime(DateTime.UtcNow)) return "Date of birth cannot be in the future.";
        if (string.IsNullOrWhiteSpace(sex) || !AllowedSex.Contains(sex.Trim())) return "Sex must be Female or Male.";
        if (!string.IsNullOrWhiteSpace(status) && !AllowedStatus.Contains(status.Trim())) return "Status must be Active, Inactive, or Deceased.";
        return null;
    }

    private static string NormalizeStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return "Active";
        foreach (var value in AllowedStatus)
            if (string.Equals(value, status.Trim(), StringComparison.OrdinalIgnoreCase)) return value;
        return "Active";
    }

    private static string? NormalizeSex(string? sex)
    {
        if (string.IsNullOrWhiteSpace(sex)) return null;
        foreach (var value in AllowedSex)
            if (string.Equals(value, sex.Trim(), StringComparison.OrdinalIgnoreCase)) return value;
        return null;
    }

    private static string? NullIfEmpty(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static PatientDto ToDto(Patient p) => new()
    {
        Id = p.Id, MedicalRecordNumber = p.MedicalRecordNumber, FirstName = p.FirstName, LastName = p.LastName,
        DateOfBirth = p.DateOfBirth, Sex = p.Sex, Status = p.Status, NationalId = p.NationalId,
        Phone = p.Phone, SecondaryPhone = p.SecondaryPhone, Email = p.Email, Address = p.Address,
        City = p.City, EmergencyContactName = p.EmergencyContactName, PreferredLanguage = p.PreferredLanguage,
        InsuranceScheme = p.InsuranceScheme, Notes = p.Notes, IsActive = p.IsActive, CreatedAt = p.CreatedAt
    };

    private async Task<string> NextMrnAsync(CancellationToken cancellationToken)
    {
        var count = await _db.Patients.CountAsync(cancellationToken);
        return $"OCR-{(count + 1):D6}";
    }
}
