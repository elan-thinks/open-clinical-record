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
        "Female", "Male", "Other", "Unknown"
    };

    private readonly AppDbContext _db;

    public PatientsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// List/search patients. q matches name, MRN, phone, email.
    /// status: active | inactive | all (default active).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PatientDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] string? q,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = _db.Patients.AsNoTracking().AsQueryable();

        var statusKey = (status ?? "active").Trim().ToLowerInvariant();
        query = statusKey switch
        {
            "inactive" => query.Where(p => !p.IsActive),
            "all" => query,
            _ => query.Where(p => p.IsActive)
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

        var items = await query
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .Take(100)
            .Select(p => ToDto(p))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var p = await _db.Patients.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (p is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

        return Ok(ToDto(p));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist,Doctor,Nurse")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var mrn = await NextMrnAsync(cancellationToken);

        var patient = new Patient
        {
            MedicalRecordNumber = mrn,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Sex = NormalizeSex(request.Sex),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Patients.Add(patient);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = patient.Id }, ToDto(patient));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist,Doctor,Nurse")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var patient = await _db.Patients.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (patient is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

        patient.FirstName = request.FirstName.Trim();
        patient.LastName = request.LastName.Trim();
        patient.DateOfBirth = request.DateOfBirth;
        patient.Sex = NormalizeSex(request.Sex);
        patient.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        patient.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        patient.IsActive = request.IsActive;
        patient.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(patient));
    }

    private static string? ValidateDemographics(DateOnly? dob, string? sex)
    {
        if (dob.HasValue && dob.Value > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return "Date of birth cannot be in the future.";
        }

        if (!string.IsNullOrWhiteSpace(sex) && !AllowedSex.Contains(sex.Trim()))
        {
            return "Sex must be Female, Male, Other, or Unknown.";
        }

        return null;
    }

    private static string? NormalizeSex(string? sex)
    {
        if (string.IsNullOrWhiteSpace(sex))
        {
            return null;
        }

        var t = sex.Trim();
        foreach (var a in AllowedSex)
        {
            if (string.Equals(a, t, StringComparison.OrdinalIgnoreCase))
            {
                return a;
            }
        }

        return t;
    }

    private static PatientDto ToDto(Patient p) => new()
    {
        Id = p.Id,
        MedicalRecordNumber = p.MedicalRecordNumber,
        FirstName = p.FirstName,
        LastName = p.LastName,
        DateOfBirth = p.DateOfBirth,
        Sex = p.Sex,
        Phone = p.Phone,
        Email = p.Email,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };

    private async Task<string> NextMrnAsync(CancellationToken cancellationToken)
    {
        var count = await _db.Patients.CountAsync(cancellationToken);
        return $"OCR-{(count + 1):D6}";
    }
}
