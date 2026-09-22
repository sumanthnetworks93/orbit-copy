using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;

namespace Orbit.Api.Services;

public class StartupSyncService(
    OrbitDbContext db,
    ExternalStartupSources sources,
    ILogger<StartupSyncService> logger)
{
    public async Task<int> SyncAsync(CancellationToken cancellationToken = default)
    {
        var fetched = await sources.FetchAllAsync(cancellationToken);
        if (fetched.Count == 0)
        {
            logger.LogWarning("No startups fetched from external sources.");
            return 0;
        }

        var keys = fetched
            .Where(s => !string.IsNullOrWhiteSpace(s.ExternalKey))
            .Select(s => s.ExternalKey!)
            .ToList();

        var existing = await db.Startups
            .Where(s => s.ExternalKey != null && keys.Contains(s.ExternalKey))
            .ToDictionaryAsync(s => s.ExternalKey!, cancellationToken);

        var added = 0;
        var fetchedKeys = fetched
            .Where(s => !string.IsNullOrWhiteSpace(s.ExternalKey))
            .Select(s => s.ExternalKey!)
            .ToHashSet(StringComparer.Ordinal);

        if (fetchedKeys.Count > 0)
        {
            var stale = await db.Startups
                .Where(s => s.ExternalKey != null && !fetchedKeys.Contains(s.ExternalKey))
                .ToListAsync(cancellationToken);

            if (stale.Count > 0)
            {
                db.Startups.RemoveRange(stale);
            }
        }

        foreach (var startup in fetched)
        {
            if (string.IsNullOrWhiteSpace(startup.ExternalKey))
            {
                continue;
            }

            if (existing.TryGetValue(startup.ExternalKey, out var current))
            {
                current.Name = startup.Name;
                current.Description = startup.Description;
                current.Category = startup.Category;
                current.SourceUrl = startup.SourceUrl;
                current.OpenRoles = startup.OpenRoles;
                current.Upvotes = Math.Max(current.Upvotes, startup.Upvotes);
                current.Location = startup.Location;
                continue;
            }

            db.Startups.Add(startup);
            added++;
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Synced {Added} new startups from open APIs ({Total} fetched).", added, fetched.Count);

        return added;
    }
}
