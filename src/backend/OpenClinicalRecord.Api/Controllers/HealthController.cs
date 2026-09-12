using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Basic liveness: API is up.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }

    /// <summary>
    /// Readiness: API + database connectivity.
    /// </summary>
    [HttpGet("ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ready(CancellationToken cancellationToken)
    {
        var database = "unavailable";

        try
        {
            var canConnect = await _db.Database.CanConnectAsync(cancellationToken);
            database = canConnect ? "ok" : "unavailable";
        }
        catch
        {
            database = "unavailable";
        }

        var payload = new
        {
            status = database == "ok" ? "ok" : "degraded",
            api = "ok",
            database
        };

        if (database != "ok")
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, payload);
        }

        return Ok(payload);
    }
}
