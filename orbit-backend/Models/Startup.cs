namespace Orbit.Api.Models;

public class Startup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int OpenRoles { get; set; }
    public int Upvotes { get; set; }
    public string Initial { get; set; } = string.Empty;
    public string Color { get; set; } = "#3B82F6";
    public string? ExternalKey { get; set; }
    public string? SourceUrl { get; set; }
    public string Location { get; set; } = "Remote";
}
