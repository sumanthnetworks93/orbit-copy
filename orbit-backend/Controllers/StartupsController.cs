using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Models;
using Orbit.Api.Services;

namespace Orbit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StartupsController(OrbitDbContext db, CurrentUser currentUser, StartupSyncService sync) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<StartupDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] bool hiringOnly = false,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Startups.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(s =>
                EF.Functions.Like(s.Name, term) || EF.Functions.Like(s.Description, term));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = category.Trim();
            query = query.Where(s => s.Category.Contains(cat));
        }

        if (hiringOnly)
        {
            query = query.Where(s => s.OpenRoles > 0);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = await query
            .OrderByDescending(s => s.Upvotes)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => StartupDto.From(s))
            .ToListAsync(cancellationToken);

        return Ok(new PagedResponse<StartupDto>(page, pageSize, totalCount, totalPages, items));
    }

    [HttpGet("filters")]
    public async Task<ActionResult<StartupFiltersResponse>> GetFilters(CancellationToken cancellationToken)
    {
        var categories = await db.Startups
            .AsNoTracking()
            .Select(s => s.Category)
            .Where(c => c != string.Empty)
            .Distinct()
            .OrderBy(c => c)
            .Take(60)
            .ToListAsync(cancellationToken);

        return Ok(new StartupFiltersResponse(categories));
    }

    [HttpPost]
    public async Task<ActionResult<StartupDto>> Create(
        [FromBody] CreateStartupRequest request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated)
        {
            return Unauthorized(new { error = "Sign in required." });
        }

        if (string.IsNullOrWhiteSpace(request.Name)
            || string.IsNullOrWhiteSpace(request.Description)
            || string.IsNullOrWhiteSpace(request.Category))
        {
            return BadRequest(new { error = "Name, description, and category are required." });
        }

        var name = request.Name.Trim();
        var startup = new Startup
        {
            Name = name,
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            OpenRoles = request.OpenRoles is > 0 ? request.OpenRoles.Value : 0,
            Upvotes = 0,
            Initial = BrandColors.Initial(name),
            Color = BrandColors.Pick(name),
            Location = string.IsNullOrWhiteSpace(request.Location) ? "Remote" : request.Location.Trim(),
        };

        db.Startups.Add(startup);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(StartupDto.From(startup));
    }

    [HttpPost("sync")]
    public async Task<ActionResult<object>> Sync(CancellationToken cancellationToken)
    {
        var added = await sync.SyncAsync(cancellationToken);
        var total = await db.Startups.CountAsync(cancellationToken);
        return Ok(new { added, total, sources = new[] { "YC Company Directory (yc-oss)", "Hacker News (Show HN)", "GitHub Search API" } });
    }

    [HttpPost("{id:int}/upvote")]
    public async Task<ActionResult<StartupDto>> Upvote(int id, CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated)
        {
            return Unauthorized(new { error = "Sign in required." });
        }

        var startup = await db.Startups.FindAsync([id], cancellationToken);
        if (startup is null)
        {
            return NotFound();
        }

        startup.Upvotes += 1;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(StartupDto.From(startup));
    }
}

public record CreateStartupRequest(string Name, string Description, string Category, int? OpenRoles, string? Location);

public record StartupFiltersResponse(IReadOnlyList<string> Categories);

public record StartupDto(
    int Id,
    string Name,
    string Description,
    string Category,
    int OpenRoles,
    int Upvotes,
    string Initial,
    string Color,
    string Location,
    bool OutsideLocation)
{
    public static StartupDto From(Startup s) =>
        new(
            s.Id,
            s.Name,
            s.Description,
            s.Category,
            s.OpenRoles,
            s.Upvotes,
            s.Initial,
            s.Color,
            string.IsNullOrWhiteSpace(s.Location) ? "Remote" : s.Location,
            LocationReconcile.IsOutside(s.Location));
}
