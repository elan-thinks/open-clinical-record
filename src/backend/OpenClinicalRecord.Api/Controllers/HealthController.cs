using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenClinicalRecord.Api.Data;

namespace OpenClinicalRecord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public HealthController(AppDbContext db, IHostEnvironment env, IConfiguration configuration)
    {
        _db = db;
        _env = env;
        _configuration = configuration;
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
    /// In Development, includes the failure reason to aid local setup.
    /// </summary>
    [HttpGet("ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ready(CancellationToken cancellationToken)
    {
        var database = "unavailable";
        string? error = null;

        try
        {
            var canConnect = await _db.Database.CanConnectAsync(cancellationToken);
            database = canConnect ? "ok" : "unavailable";
            if (!canConnect)
            {
                error = "CanConnectAsync returned false (server reachable but database may be missing or auth failed).";
            }
        }
        catch (Exception ex)
        {
            database = "unavailable";
            error = ex.GetBaseException().Message;
        }

        object payload;
        if (_env.IsDevelopment())
        {
            // Safe for local debugging only — shows host/db/user, never the password.
            var cs = _configuration.GetConnectionString("DefaultConnection") ?? "";
            var redacted = RedactConnectionString(cs);

            payload = new
            {
                status = database == "ok" ? "ok" : "degraded",
                api = "ok",
                database,
                error,
                connection = redacted
            };
        }
        else
        {
            payload = new
            {
                status = database == "ok" ? "ok" : "degraded",
                api = "ok",
                database
            };
        }

        if (database != "ok")
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, payload);
        }

        return Ok(payload);
    }

    private static string RedactConnectionString(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return "(empty)";
        }

        // Mask Password=...
        var parts = connectionString.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        for (var i = 0; i < parts.Length; i++)
        {
            if (parts[i].StartsWith("Password=", StringComparison.OrdinalIgnoreCase) ||
                parts[i].StartsWith("Pwd=", StringComparison.OrdinalIgnoreCase))
            {
                parts[i] = "Password=***";
            }
        }

        return string.Join(';', parts);
    }
}
