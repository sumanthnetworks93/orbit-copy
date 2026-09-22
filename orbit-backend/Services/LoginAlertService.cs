using System.Net;
using System.Net.Http.Json;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Models;

namespace Orbit.Api.Services;

public class AlertOptions
{
    public const string SectionName = "Alerts";
    public string DiscordWebhookUrl { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = "support@orbit.app";
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string SmtpFrom { get; set; } = "Orbit <noreply@orbit.app>";
}

public class LoginAlertService(
    OrbitDbContext db,
    IHttpClientFactory httpFactory,
    IConfiguration configuration,
    ILogger<LoginAlertService> logger)
{
    public async Task<AlertSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await LoadSettingsAsync(cancellationToken);
        return AlertSettingsDto.From(settings, MaskWebhook(settings.DiscordWebhookUrl));
    }

    public async Task<AlertSettingsDto> SaveSettingsAsync(string? discordWebhookUrl, string? adminEmail, CancellationToken cancellationToken = default)
    {
        var row = await db.AlertSettings.FirstOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            row = new AlertSettings { Id = 1 };
            db.AlertSettings.Add(row);
        }

        if (!string.IsNullOrWhiteSpace(discordWebhookUrl) && !discordWebhookUrl.Contains('•'))
        {
            if (!IsDiscordWebhook(discordWebhookUrl))
            {
                throw new InvalidOperationException("Discord link must be a webhook URL from Server Settings → Integrations → Webhooks.");
            }
            row.DiscordWebhookUrl = discordWebhookUrl.Trim();
        }

        if (!string.IsNullOrWhiteSpace(adminEmail))
        {
            row.AdminEmail = adminEmail.Trim();
        }

        await db.SaveChangesAsync(cancellationToken);
        return AlertSettingsDto.From(row, MaskWebhook(row.DiscordWebhookUrl));
    }

    public async Task<IReadOnlyList<LoginEvent>> RecentAsync(int take = 20, CancellationToken cancellationToken = default)
    {
        return await db.LoginEvents
            .OrderByDescending(item => item.CreatedAt)
            .Take(Math.Clamp(take, 1, 50))
            .ToListAsync(cancellationToken);
    }

    public async Task<LoginEvent> ReportAsync(LoginAlertRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await LoadSettingsAsync(cancellationToken);
        var login = new LoginEvent
        {
            UserId = string.IsNullOrWhiteSpace(request.UserId) ? "unknown" : request.UserId.Trim(),
            Email = request.Email?.Trim(),
            Name = request.Name?.Trim(),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "seeker" : request.Role.Trim(),
            Method = string.IsNullOrWhiteSpace(request.Method) ? "login" : request.Method.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        login.DiscordStatus = await PostDiscordAsync(settings.DiscordWebhookUrl, login, cancellationToken);
        login.EmailStatus = await SendEmailAsync(settings, login, cancellationToken);

        db.LoginEvents.Add(login);
        await db.SaveChangesAsync(cancellationToken);
        return login;
    }

    private async Task<AlertSettings> LoadSettingsAsync(CancellationToken cancellationToken)
    {
        var options = new AlertOptions();
        configuration.GetSection(AlertOptions.SectionName).Bind(options);
        if (string.IsNullOrWhiteSpace(options.DiscordWebhookUrl))
        {
            options.DiscordWebhookUrl = configuration["DISCORD_WEBHOOK_URL"] ?? string.Empty;
        }
        if (string.IsNullOrWhiteSpace(options.AdminEmail))
        {
            options.AdminEmail = configuration["ADMIN_ALERT_EMAIL"] ?? "support@orbit.app";
        }

        var row = await db.AlertSettings.FirstOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            row = new AlertSettings
            {
                Id = 1,
                DiscordWebhookUrl = options.DiscordWebhookUrl,
                AdminEmail = options.AdminEmail,
            };
            db.AlertSettings.Add(row);
            await db.SaveChangesAsync(cancellationToken);
            return row;
        }

        if (string.IsNullOrWhiteSpace(row.DiscordWebhookUrl))
        {
            row.DiscordWebhookUrl = options.DiscordWebhookUrl;
        }
        if (string.IsNullOrWhiteSpace(row.AdminEmail))
        {
            row.AdminEmail = options.AdminEmail;
        }
        return row;
    }

    private async Task<string> PostDiscordAsync(string webhookUrl, LoginEvent login, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(webhookUrl))
        {
            return "skipped";
        }

        try
        {
            var when = TimeZoneInfo.ConvertTimeFromUtc(login.CreatedAt, IstClock.Zone)
                .ToString("dd MMM yyyy, hh:mm tt") + " IST";
            var payload = new
            {
                username = "Orbit Admin",
                content = $"Login alert: **{login.Name ?? "A user"}** signed in.",
                embeds = new[]
                {
                    new
                    {
                        title = "User login",
                        color = 0x16140F,
                        fields = new[]
                        {
                            new { name = "Name", value = login.Name ?? "—", inline = true },
                            new { name = "Email", value = login.Email ?? "—", inline = true },
                            new { name = "Role", value = login.Role, inline = true },
                            new { name = "Method", value = login.Method, inline = true },
                            new { name = "When", value = when, inline = false },
                        },
                    },
                },
            };

            using var response = await httpFactory.CreateClient().PostAsJsonAsync(webhookUrl, payload, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Discord login alert failed with {Status}", (int)response.StatusCode);
                return $"error:{(int)response.StatusCode}";
            }
            return "sent";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Discord login alert failed");
            return "error";
        }
    }

    private async Task<string> SendEmailAsync(AlertSettings settings, LoginEvent login, CancellationToken cancellationToken)
    {
        var options = new AlertOptions();
        configuration.GetSection(AlertOptions.SectionName).Bind(options);
        var to = string.IsNullOrWhiteSpace(settings.AdminEmail) ? options.AdminEmail : settings.AdminEmail;
        if (string.IsNullOrWhiteSpace(to))
        {
            return "skipped";
        }

        if (string.IsNullOrWhiteSpace(options.SmtpHost))
        {
            options.SmtpHost = configuration["SMTP_HOST"] ?? string.Empty;
            options.SmtpUser = configuration["SMTP_USER"] ?? options.SmtpUser;
            options.SmtpPassword = configuration["SMTP_PASSWORD"] ?? options.SmtpPassword;
        }

        if (string.IsNullOrWhiteSpace(options.SmtpHost))
        {
            logger.LogInformation("Login email for {Email} stored for admin {To}; SMTP is not configured.", login.Email, to);
            return "queued";
        }

        try
        {
            var when = TimeZoneInfo.ConvertTimeFromUtc(login.CreatedAt, IstClock.Zone)
                .ToString("dd MMM yyyy, hh:mm tt") + " IST";
            using var message = new MailMessage
            {
                From = new MailAddress(ParseFrom(options.SmtpFrom), "Orbit"),
                Subject = $"[Orbit] Login: {login.Email ?? login.Name ?? login.UserId}",
                Body = $"A user signed in to Orbit.\n\nName: {login.Name ?? "—"}\nEmail: {login.Email ?? "—"}\nRole: {login.Role}\nMethod: {login.Method}\nWhen: {when}\n",
            };
            message.To.Add(to);

            using var client = new SmtpClient(options.SmtpHost, options.SmtpPort)
            {
                EnableSsl = true,
                Credentials = string.IsNullOrWhiteSpace(options.SmtpUser)
                    ? CredentialCache.DefaultNetworkCredentials
                    : new NetworkCredential(options.SmtpUser, options.SmtpPassword),
            };
            await client.SendMailAsync(message, cancellationToken);
            return "sent";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Login email alert failed");
            return "error";
        }
    }

    private static string ParseFrom(string value)
    {
        var start = value.IndexOf('<');
        var end = value.IndexOf('>');
        if (start >= 0 && end > start)
        {
            return value[(start + 1)..end];
        }
        return string.IsNullOrWhiteSpace(value) ? "noreply@orbit.app" : value.Trim();
    }

    public static bool IsDiscordWebhook(string value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && (uri.Host.Equals("discord.com", StringComparison.OrdinalIgnoreCase)
                || uri.Host.Equals("discordapp.com", StringComparison.OrdinalIgnoreCase))
            && uri.AbsolutePath.Contains("/api/webhooks/", StringComparison.OrdinalIgnoreCase);
    }

    public static string MaskWebhook(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        if (value.Length < 12) return "••••••••";
        return $"{value[..20]}…{value[^4..]}";
    }
}

public record LoginAlertRequest(string? UserId, string? Email, string? Name, string? Role, string? Method);

public record AlertSettingsDto(string DiscordWebhookUrl, string AdminEmail, bool DiscordReady, bool EmailReady)
{
    public static AlertSettingsDto From(AlertSettings settings, string maskedWebhook) =>
        new(maskedWebhook, settings.AdminEmail, !string.IsNullOrWhiteSpace(settings.DiscordWebhookUrl), !string.IsNullOrWhiteSpace(settings.AdminEmail));
}
