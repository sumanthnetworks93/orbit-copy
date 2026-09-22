using Microsoft.EntityFrameworkCore;
using Orbit.Api.Models;

namespace Orbit.Api.Data;

public class OrbitDbContext(DbContextOptions<OrbitDbContext> options) : DbContext(options)
{
    public DbSet<Startup> Startups => Set<Startup>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<LoginEvent> LoginEvents => Set<LoginEvent>();
    public DbSet<AlertSettings> AlertSettings => Set<AlertSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Startup>(entity =>
        {
            entity.HasIndex(s => s.ExternalKey).IsUnique();
            entity.HasData(SeedData.Startups);
        });
        modelBuilder.Entity<Job>(entity =>
        {
            entity.HasIndex(j => j.ExternalKey).IsUnique();
            entity.HasData(SeedData.Jobs);
        });
    }
}
