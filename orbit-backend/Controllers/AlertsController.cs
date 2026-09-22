using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Services;

namespace Orbit.Api.Controllers;

[ApiController]
[Route("api/alerts")]
public class AlertsController(LoginAlertService alerts) : ControllerBase
{
    [HttpGet("settings")]
    public async Task<ActionResult<AlertSettingsDto>> GetSettings(CancellationToken cancellationToken)
    {
        return Ok(await alerts.GetSettingsAsync(cancellationToken));
    }

    [HttpPut("settings")]
    public async Task<ActionResult<AlertSettingsDto>> SaveSettings(
        [FromBody] SaveAlertSettingsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await alerts.SaveSettingsAsync(request.DiscordWebhookUrl, request.AdminEmail, cancellationToken));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("logins")]
    public async Task<ActionResult<IReadOnlyList<LoginEventDto>>> GetLogins(CancellationToken cancellationToken)
    {
        var rows = await alerts.RecentAsync(20, cancellationToken);
        return Ok(rows.Select(LoginEventDto.From).ToList());
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginEventDto>> ReportLogin(
        [FromBody] LoginAlertRequest request,
        CancellationToken cancellationToken)
    {
        var row = await alerts.ReportAsync(request, cancellationToken);
        return Ok(LoginEventDto.From(row));
    }
}

public record SaveAlertSettingsRequest(string? DiscordWebhookUrl, string? AdminEmail);

public record LoginEventDto(
    int Id,
    string UserId,
    string? Email,
    string? Name,
    string Role,
    string Method,
    DateTime CreatedAt,
    string DiscordStatus,
    string EmailStatus)
{
    public static LoginEventDto From(Orbit.Api.Models.LoginEvent row) =>
        new(row.Id, row.UserId, row.Email, row.Name, row.Role, row.Method, row.CreatedAt, row.DiscordStatus, row.EmailStatus);
}
