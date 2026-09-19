using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenClinicalRecord.Api.DTOs.Patients;
using OpenClinicalRecord.Api.Services.Common;
using OpenClinicalRecord.Api.Services.Patients;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patients;

    public PatientsController(IPatientService patients)
    {
        _patients = patients;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PatientDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] string? q,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var items = await _patients.ListAsync(q, status, cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var result = await _patients.GetAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _patients.CreateAsync(request, cancellationToken);
        if (!result.Succeeded) return ToActionResult(result);
        return CreatedAtAction(nameof(Get), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist,Doctor,Nurse")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _patients.UpdateAsync(id, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/deceased")]
    [Authorize(Roles = "Admin,Doctor,Receptionist")]
    public async Task<IActionResult> MarkDeceased(
        Guid id,
        [FromBody] MarkDeceasedRequest? request,
        CancellationToken cancellationToken)
    {
        var result = await _patients.MarkDeceasedAsync(id, request, GetActor(), cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/deceased/clear")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> ClearDeceased(Guid id, CancellationToken cancellationToken)
    {
        var result = await _patients.ClearDeceasedAsync(id, GetActor(), cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("{id:guid}/death-record")]
    public async Task<IActionResult> GetDeathRecord(Guid id, CancellationToken cancellationToken)
    {
        var result = await _patients.GetDeathRecordAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    private ActorContext GetActor()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = User.FindFirstValue("fullName")
                   ?? User.FindFirstValue(ClaimTypes.Name)
                   ?? User.Identity?.Name
                   ?? "Staff";
        return new ActorContext(userId, name);
    }

    private IActionResult ToActionResult<T>(ServiceResult<T> result)
    {
        if (result.Succeeded) return Ok(result.Value);
        return result.ErrorKind switch
        {
            ServiceErrorKind.NotFound => NotFound(new { message = result.Error }),
            ServiceErrorKind.Conflict => Conflict(new { message = result.Error }),
            ServiceErrorKind.Forbidden => StatusCode(StatusCodes.Status403Forbidden, new { message = result.Error }),
            _ => BadRequest(new { message = result.Error })
        };
    }
}
