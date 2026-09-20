using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OpenClinicalRecord.Api.Data;
using OpenClinicalRecord.Api.Models.Entities;
using OpenClinicalRecord.Api.Services.Common;

namespace OpenClinicalRecord.Api.Services.Audit;

public interface IAuditService
{
    /// <summary>
    /// Stages an audit row on the shared DbContext without saving.
    /// Call when the business mutation will SaveChanges in the same unit of work.
    /// </summary>
    void Stage(
        string action,
        string entityType,
        Guid? entityId,
        ActorContext? actor,
        string? summary);

    Task WriteAsync(
        string action,
        string entityType,
        Guid? entityId,
        ActorContext? actor,
        string? summary,
        CancellationToken ct = default);

    Task WriteAsync(
        string action,
        string entityType,
        Guid? entityId,
        string? actorUserId,
        string? actorName,
        string? summary,
        CancellationToken ct = default);

    Task<IReadOnlyList<AuditEvent>> ListAsync(
        string? entityType,
        Guid? entityId,
        int take,
        CancellationToken ct = default);
}

public sealed class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AuditService> _logger;

    public AuditService(AppDbContext db, ILogger<AuditService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public void Stage(
        string action,
        string entityType,
        Guid? entityId,
        ActorContext? actor,
        string? summary)
    {
        if (string.IsNullOrWhiteSpace(action) || string.IsNullOrWhiteSpace(entityType))
            throw new ArgumentException("Audit action and entityType are required.");

        _db.AuditEvents.Add(BuildEvent(
            action, entityType, entityId,
            actor?.UserId, actor?.DisplayName, summary));
    }

    public Task WriteAsync(
        string action,
        string entityType,
        Guid? entityId,
        ActorContext? actor,
        string? summary,
        CancellationToken ct = default)
    {
        return WriteAsync(
            action, entityType, entityId,
            actor?.UserId, actor?.DisplayName, summary, ct);
    }

    public async Task WriteAsync(
        string action,
        string entityType,
        Guid? entityId,
        string? actorUserId,
        string? actorName,
        string? summary,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(action) || string.IsNullOrWhiteSpace(entityType))
            throw new ArgumentException("Audit action and entityType are required.");

        _db.AuditEvents.Add(BuildEvent(
            action, entityType, entityId, actorUserId, actorName, summary));

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist audit event {Action} on {EntityType}", action, entityType);
            foreach (var entry in _db.ChangeTracker.Entries<AuditEvent>()
                         .Where(e => e.State == EntityState.Added)
                         .ToList())
            {
                entry.State = EntityState.Detached;
            }
            throw;
        }
    }

    public async Task<IReadOnlyList<AuditEvent>> ListAsync(
        string? entityType,
        Guid? entityId,
        int take,
        CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 200);
        var q = _db.AuditEvents.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(entityType))
            q = q.Where(e => e.EntityType == entityType);
        if (entityId.HasValue)
            q = q.Where(e => e.EntityId == entityId);
        return await q.OrderByDescending(e => e.CreatedAt).Take(take).ToListAsync(ct);
    }

    private static AuditEvent BuildEvent(
        string action,
        string entityType,
        Guid? entityId,
        string? actorUserId,
        string? actorName,
        string? summary) => new()
    {
        Action = action.Trim(),
        EntityType = entityType.Trim(),
        EntityId = entityId,
        ActorUserId = string.IsNullOrWhiteSpace(actorUserId) ? null : actorUserId.Trim(),
        ActorName = string.IsNullOrWhiteSpace(actorName) ? null : actorName.Trim(),
        Summary = string.IsNullOrWhiteSpace(summary) ? null : Truncate(summary.Trim(), 500),
        CreatedAt = DateTimeOffset.UtcNow
    };

    private static string Truncate(string value, int max) =>
        value.Length <= max ? value : value[..max];
}
