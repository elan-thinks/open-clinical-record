using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenClinicalRecord.Api.Services.Audit;

namespace OpenClinicalRecord.Api.Controllers;

/// <summary>
/// Admin-only read access to the append-only audit trail.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _audit;

    public AuditController(IAuditService audit) => _audit = audit;

    /// <summary>
    /// Recent audit events (newest first). Optional filters by entity type / entity id.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? entityType,
        [FromQuery] Guid? entityId,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var items = await _audit.ListAsync(entityType, entityId, take, cancellationToken);
        return Ok(items.Select(e => new
        {
            e.Id,
            e.Action,
            e.EntityType,
            e.EntityId,
            e.ActorUserId,
            e.ActorName,
            e.Summary,
            e.CreatedAt
        }));
    }
}
