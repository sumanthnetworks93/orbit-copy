using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Models;
using Orbit.Api.Services;

namespace Orbit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController(OrbitDbContext db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedJobsResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? jobType = null,
        [FromQuery] string? location = null,
        [FromQuery] bool remoteOnly = false,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.Jobs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(j =>
                EF.Functions.Like(j.Title, term)
                || EF.Functions.Like(j.Company, term)
                || EF.Functions.Like(j.Tags, term));
        }

        if (!string.IsNullOrWhiteSpace(jobType))
        {
            var type = jobType.Trim();
            query = query.Where(j => j.JobType == type);
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            var place = $"%{location.Trim()}%";
            query = query.Where(j => EF.Functions.Like(j.Location, place));
        }

        if (remoteOnly)
        {
            query = query.Where(j => EF.Functions.Like(j.Location, "%Remote%"));
        }

        var roleCount = await query.CountAsync(cancellationToken);
        var startupCount = await query.Select(j => j.Company).Distinct().CountAsync(cancellationToken);
        var totalPages = roleCount == 0 ? 0 : (int)Math.Ceiling(roleCount / (double)pageSize);
        var (startUtc, endUtc, _) = IstClock.TodayUtcRange(DateTime.UtcNow);
        var postedAts = await query
            .Where(j => j.PostedAt != null)
            .Select(j => j.PostedAt!.Value)
            .ToListAsync(cancellationToken);
        var postedTodayCount = postedAts.Count(at => at >= startUtc && at < endUtc);
        var postedByDay = postedAts
            .Where(at => at >= startUtc.AddDays(-13))
            .GroupBy(IstClock.DayKey)
            .Select(group => new PostedDayCount(group.Key, group.Count()))
            .OrderByDescending(row => row.Date)
            .ToList();
        var jobs = await query
            .OrderByDescending(j => j.PostedAt)
            .ThenByDescending(j => j.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => JobDto.From(j))
            .ToListAsync(cancellationToken);

        return Ok(new PagedJobsResponse(page, pageSize, roleCount, totalPages, startupCount, postedTodayCount, postedByDay, jobs));
    }

    [HttpGet("filters")]
    public async Task<ActionResult<JobFiltersResponse>> GetFilters(CancellationToken cancellationToken)
    {
        var jobTypes = await db.Jobs
            .AsNoTracking()
            .Select(j => j.JobType)
            .Where(t => t != string.Empty)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);

        return Ok(new JobFiltersResponse(jobTypes));
    }

    [HttpPost]
    public async Task<ActionResult<JobDto>> Create(
        [FromBody] CreateJobRequest request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated)
        {
            return Unauthorized(new { error = "Sign in required." });
        }

        if (string.IsNullOrWhiteSpace(request.Title)
            || string.IsNullOrWhiteSpace(request.Company)
            || string.IsNullOrWhiteSpace(request.Location))
        {
            return BadRequest(new { error = "Title, company, and location are required." });
        }

        var company = request.Company.Trim();
        var job = new Job
        {
            Title = request.Title.Trim(),
            Company = company,
            Location = request.Location.Trim(),
            JobType = string.IsNullOrWhiteSpace(request.JobType) ? "Full-time" : request.JobType.Trim(),
            Tags = LocationReconcile.ApplyTag(request.Location, request.Tags),
            Salary = request.Salary?.Trim() ?? string.Empty,
            Initial = BrandColors.Initial(company),
            Color = BrandColors.Pick(company),
            PostedAt = DateTime.UtcNow,
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(JobDto.From(job));
    }
}

public record CreateJobRequest(
    string Title,
    string Company,
    string Location,
    string? JobType,
    string? Tags,
    string? Salary);

public record JobFiltersResponse(IReadOnlyList<string> JobTypes);

public record PostedDayCount(string Date, int Count);

public record PagedJobsResponse(
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    int StartupCount,
    int PostedTodayCount,
    IReadOnlyList<PostedDayCount> PostedByDay,
    IReadOnlyList<JobDto> Jobs);

public record JobsResponse(int RoleCount, int StartupCount, IReadOnlyList<JobDto> Jobs);

public record JobDto(
    int Id,
    string Title,
    string Company,
    string Location,
    string JobType,
    string Tags,
    string Salary,
    string Initial,
    string Color,
    string? SourceUrl,
    DateTime? PostedAt,
    bool OutsideLocation)
{
    public static JobDto From(Models.Job j) =>
        new(
            j.Id,
            j.Title,
            j.Company,
            j.Location,
            j.JobType,
            LocationReconcile.ApplyTag(j.Location, j.Tags),
            j.Salary,
            j.Initial,
            j.Color,
            j.SourceUrl,
            j.PostedAt,
            LocationReconcile.IsOutside(j.Location));
}
