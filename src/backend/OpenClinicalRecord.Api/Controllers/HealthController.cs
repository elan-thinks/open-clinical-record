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

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }

    /// <summary>
    /// Readiness: API + database connectivity.
    /// Opens a real connection so PostgreSQL errors are visible in Development.
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
            // Force a real open so auth / missing-DB errors surface clearly
            await _db.Database.OpenConnectionAsync(cancellationToken);
            try
            {
                await _db.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
                database = "ok";
            }
            finally
            {
                await _db.Database.CloseConnectionAsync();
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
            var cs = _configuration.GetConnectionString("DefaultConnection") ?? "";
            payload = new
            {
                status = database == "ok" ? "ok" : "degraded",
                api = "ok",
                database,
                error,
                connection = RedactConnectionString(cs)
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
