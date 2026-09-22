namespace Orbit.Api.Models;

public class LoginEvent
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string Role { get; set; } = "seeker";
    public string Method { get; set; } = "login";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string DiscordStatus { get; set; } = "pending";
    public string EmailStatus { get; set; } = "pending";
}

public class AlertSettings
{
    public int Id { get; set; } = 1;
    public string DiscordWebhookUrl { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = "support@orbit.app";
}
