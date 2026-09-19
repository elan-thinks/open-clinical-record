using System.Security.Claims;
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

    private static readonly HashSet<string> AllowedStatus = new(StringComparer.OrdinalIgnoreCase)
    {
        "Active", "Inactive", "Deceased"
    };

    private readonly AppDbContext _db;

    public PatientsController(AppDbContext db)
    {
        _db = db;
    }

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
    [Authorize(Roles = "Admin,Receptionist")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex, request.Status);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var status = NormalizeStatus(request.Status);
        if (string.Equals(status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Cannot register a patient as Deceased. Register as Active/Inactive, then use POST /api/patients/{id}/deceased if needed."
            });
        }

        var mrn = await NextMrnAsync(cancellationToken);

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

        var validationError = ValidateDemographics(request.DateOfBirth, request.Sex, request.Status);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var patient = await _db.Patients.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (patient is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

        var status = NormalizeStatus(request.Status);

        // Phase 1: Deceased only via POST /patients/{id}/deceased (death record + cancel future appts).
        // Clear only via POST /patients/{id}/deceased/clear.
        if (string.Equals(status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "Cannot set status to Deceased via patient update. Use POST /api/patients/{id}/deceased so a death record is created and future appointments are cancelled."
                });
            }
        }
        else if (string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase)
                 && !string.Equals(status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Cannot clear deceased status via patient update. Use POST /api/patients/{id}/deceased/clear."
            });
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

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(patient));
    }

    /// <summary>
    /// Mark patient deceased and create a death record. Does not delete clinical history.
    /// </summary>
    [HttpPost("{id:guid}/deceased")]
    [Authorize(Roles = "Admin,Doctor,Receptionist")]
    public async Task<IActionResult> MarkDeceased(
        Guid id,
        [FromBody] MarkDeceasedRequest? request,
        CancellationToken cancellationToken)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (patient is null) return NotFound(new { message = "Patient not found." });

        if (string.Equals(patient.Status, "Deceased", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(ToDto(patient));
        }

        var (userId, name) = GetCurrentUser();
        var prior = await _db.PatientDeathRecords
            .Where(r => r.PatientId == id && r.IsActive)
            .ToListAsync(cancellationToken);
        foreach (var r in prior)
        {
            r.IsActive = false;
            r.ClearedAt = DateTimeOffset.UtcNow;
            r.ClearedByUserId = userId;
            r.ClearedByName = name;
        }

        _db.PatientDeathRecords.Add(new PatientDeathRecord
        {
            PatientId = id,
            DateOfDeath = request?.DateOfDeath,
            Note = string.IsNullOrWhiteSpace(request?.Note) ? null : request!.Note.Trim(),
            RecordedByUserId = userId,
            RecordedByName = name,
            RecordedAt = DateTimeOffset.UtcNow,
            IsActive = true
        });

        patient.Status = "Deceased";
        patient.IsActive = false;
        patient.UpdatedAt = DateTimeOffset.UtcNow;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var future = await _db.Appointments
            .Where(a => a.PatientId == id
                        && a.AppointmentDate >= today
                        && (a.Status == "Scheduled" || a.Status == "Waiting" || a.Status == "CheckedIn"))
            .ToListAsync(cancellationToken);
        foreach (var a in future)
        {
            var from = a.Status;
            a.Status = "Cancelled";
            a.UpdatedAt = DateTimeOffset.UtcNow;
            _db.AppointmentEvents.Add(new AppointmentEvent
            {
                AppointmentId = a.Id,
                FromStatus = from,
                ToStatus = "Cancelled",
                Reason = "Patient marked deceased",
                ActorUserId = userId,
                ActorName = name,
                CreatedAt = DateTimeOffset.UtcNow
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(patient));
    }

    /// <summary>
    /// Clear deceased status (restore to Active). Death record is retained with ClearedAt.
    /// </summary>
    [HttpPost("{id:guid}/deceased/clear")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> ClearDeceased(Guid id, CancellationToken cancellationToken)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (patient is null) return NotFound(new { message = "Patient not found." });

        var (userId, name) = GetCurrentUser();
        var active = await _db.PatientDeathRecords
            .Where(r => r.PatientId == id && r.IsActive)
            .ToListAsync(cancellationToken);
        foreach (var r in active)
        {
            r.IsActive = false;
            r.ClearedAt = DateTimeOffset.UtcNow;
            r.ClearedByUserId = userId;
            r.ClearedByName = name;
        }

        patient.Status = "Active";
        patient.IsActive = true;
        patient.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(patient));
    }

    [HttpGet("{id:guid}/death-record")]
    public async Task<IActionResult> GetDeathRecord(Guid id, CancellationToken cancellationToken)
    {
        var exists = await _db.Patients.AsNoTracking().AnyAsync(p => p.Id == id, cancellationToken);
        if (!exists) return NotFound(new { message = "Patient not found." });

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
            .FirstOrDefaultAsync(cancellationToken);

        if (record is null) return NotFound(new { message = "No death record." });
        return Ok(record);
    }

    private (string? userId, string fullName) GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = User.FindFirstValue("fullName")
                   ?? User.FindFirstValue(ClaimTypes.Name)
                   ?? User.Identity?.Name
                   ?? "Staff";
        return (userId, name);
    }

    private static string? ValidateDemographics(DateOnly? dob, string? sex, string? status)
    {
        if (!dob.HasValue)
        {
            return "Date of birth is required.";
        }

        if (dob.Value > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return "Date of birth cannot be in the future.";
        }

        if (string.IsNullOrWhiteSpace(sex) || !AllowedSex.Contains(sex.Trim()))
        {
            return "Sex must be Female, Male, Other, or Unknown.";
        }

        if (!string.IsNullOrWhiteSpace(status) && !AllowedStatus.Contains(status.Trim()))
        {
            return "Status must be Active, Inactive, or Deceased.";
        }

        return null;
    }

    private static string NormalizeStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return "Active";
        }

        foreach (var a in AllowedStatus)
        {
            if (string.Equals(a, status.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return a;
            }
        }

        return "Active";
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

    private async Task<string> NextMrnAsync(CancellationToken cancellationToken)
    {
        var count = await _db.Patients.CountAsync(cancellationToken);
        return $"OCR-{(count + 1):D6}";
    }
}
