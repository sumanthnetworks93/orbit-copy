namespace Orbit.Api.Models;

public class JobView
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string UserId { get; set; } = "guest";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
