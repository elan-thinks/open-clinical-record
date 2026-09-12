using Microsoft.EntityFrameworkCore;

namespace OpenClinicalRecord.Api.Data;

/// <summary>
/// Application database context. Entities will be added in later milestones.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Entity configurations will be registered here when models are introduced.
    }
}
