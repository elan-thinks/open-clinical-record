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
    private readonly AppDbContext _db;

    public PatientsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Search/list patients. Optional q matches name, MRN, phone, or email.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PatientDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List([FromQuery] string? q, CancellationToken cancellationToken)
    {
        var query = _db.Patients.AsNoTracking().Where(p => p.IsActive);

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
            .Select(p => new PatientDto
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
            })
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
            return NotFound();
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

        var mrn = await NextMrnAsync(cancellationToken);

        var patient = new Patient
        {
            MedicalRecordNumber = mrn,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Sex = string.IsNullOrWhiteSpace(request.Sex) ? null : request.Sex.Trim(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Patients.Add(patient);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = patient.Id }, ToDto(patient));
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
        // Simple sequential MRN: OCR-000001
        var count = await _db.Patients.CountAsync(cancellationToken);
        return $"OCR-{(count + 1):D6}";
    }
}
