using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenClinicalRecord.Api.DTOs.Appointments;
using OpenClinicalRecord.Api.Services.Appointments;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentWorkflowService _appointments;

    public AppointmentsController(IAppointmentWorkflowService appointments)
    {
        _appointments = appointments;
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] DateOnly? date,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var items = await _appointments.ListAsync(date, status, cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var result = await _appointments.GetAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("{id:guid}/events")]
    public async Task<IActionResult> ListEvents(Guid id, CancellationToken cancellationToken)
    {
        var result = await _appointments.ListEventsAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost]
    [Authorize(Policy = "StaffCanBook")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _appointments.CreateAsync(request, GetActor(), cancellationToken);
        if (!result.Succeeded) return ToActionResult(result);
        return CreatedAtAction(nameof(Get), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "StaffCanBook")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateAppointmentStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _appointments.UpdateStatusAsync(id, request, GetActor(), cancellationToken);
        return ToActionResult(result);
    }

    [HttpPatch("{id:guid}/reschedule")]
    [Authorize(Policy = "StaffCanBook")]
    public async Task<IActionResult> Reschedule(
        Guid id,
        [FromBody] RescheduleAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _appointments.RescheduleAsync(id, request, GetActor(), cancellationToken);
        return ToActionResult(result);
    }

    private ActorContext GetActor()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")
                     ?? string.Empty;
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
