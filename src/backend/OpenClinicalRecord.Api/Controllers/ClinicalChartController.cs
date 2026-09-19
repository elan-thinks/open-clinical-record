using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenClinicalRecord.Api.DTOs.Clinical;
using OpenClinicalRecord.Api.Services.Clinical;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/patients/{patientId:guid}/chart")]
[Authorize]
public class ClinicalChartController : ControllerBase
{
    private readonly IClinicalChartService _chart;

    public ClinicalChartController(IClinicalChartService chart)
    {
        _chart = chart;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PatientChartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChart(Guid patientId, CancellationToken cancellationToken)
    {
        var result = await _chart.GetChartAsync(patientId, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("visits/{visitId:guid}")]
    [ProducesResponseType(typeof(VisitDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVisit(Guid patientId, Guid visitId, CancellationToken cancellationToken)
    {
        var result = await _chart.GetVisitAsync(patientId, visitId, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("allergies")]
    [Authorize(Policy = "ClinicalStaff")]
    public async Task<IActionResult> AddAllergy(
        Guid patientId,
        [FromBody] CreateAllergyRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _chart.AddAllergyAsync(patientId, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("history")]
    [Authorize(Policy = "ClinicalStaff")]
    public async Task<IActionResult> AddHistory(
        Guid patientId,
        [FromBody] CreateHistoryItemRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _chart.AddHistoryAsync(patientId, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("visits")]
    [Authorize(Policy = "ClinicalStaff")]
    public async Task<IActionResult> CreateVisit(
        Guid patientId,
        [FromBody] CreateVisitRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _chart.CreateVisitAsync(patientId, request, GetActor(), cancellationToken);
        if (!result.Succeeded) return ToActionResult(result);
        return CreatedAtAction(nameof(GetVisit), new { patientId, visitId = result.Value!.Id }, result.Value);
    }

    [HttpPatch("visits/{visitId:guid}")]
    [Authorize(Policy = "ClinicalStaff")]
    public async Task<IActionResult> DocumentVisit(
        Guid patientId,
        Guid visitId,
        [FromBody] DocumentVisitRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _chart.DocumentVisitAsync(patientId, visitId, request, GetActor(), cancellationToken);
        return ToActionResult(result);
    }

    private ActorContext GetActor()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        var name = User.FindFirstValue("fullName")
                   ?? User.FindFirstValue(ClaimTypes.Name)
                   ?? User.Identity?.Name
                   ?? "Clinician";
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
