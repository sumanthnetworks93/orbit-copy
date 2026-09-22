using Orbit.Api.Models;

namespace Orbit.Api.Data;

public static class SeedData
{
    public static readonly Startup[] Startups =
    [
        new() { Id = 1, Name = "Marble", Description = "Open-source Notion for engineers", Category = "Dev Tools", OpenRoles = 2, Upvotes = 312, Initial = "M", Color = "#3B82F6", Location = "San Francisco" },
        new() { Id = 2, Name = "Verdant", Description = "AI grid optimization for solar farms", Category = "Climate Tech", OpenRoles = 5, Upvotes = 248, Initial = "V", Color = "#22C55E", Location = "London" },
        new() { Id = 3, Name = "Cadence", Description = "Patient scheduling that learns", Category = "Health", OpenRoles = 1, Upvotes = 196, Initial = "C", Color = "#F97316", Location = "San Francisco" },
        new() { Id = 4, Name = "Ledgerly", Description = "Stablecoin treasury for African SMBs", Category = "Fintech", OpenRoles = 3, Upvotes = 174, Initial = "L", Color = "#A855F7", Location = "Lagos" },
        new() { Id = 5, Name = "Loop", Description = "Async standups for remote teams", Category = "Productivity", OpenRoles = 2, Upvotes = 152, Initial = "L", Color = "#14B8A6", Location = "Remote" },
    ];

    public static readonly Job[] Jobs =
    [
        new() { Id = 1, Title = "Founding Engineer", Company = "Marble", Location = "Remote · US", JobType = "Full-time", Tags = "TypeScript · Rust", Salary = "$170k", Initial = "M", Color = "#3B82F6", StartupId = 1, PostedAt = DateTime.UtcNow },
        new() { Id = 2, Title = "Product Designer", Company = "Marble", Location = "New York", JobType = "Full-time", Tags = "Figma · Systems", Salary = "$155k", Initial = "M", Color = "#3B82F6", StartupId = 1, PostedAt = DateTime.UtcNow },
        new() { Id = 3, Title = "ML Engineer", Company = "Verdant", Location = "Remote · EU", JobType = "Full-time", Tags = "Python · Geo", Salary = "€105k", Initial = "V", Color = "#22C55E", StartupId = 2, PostedAt = DateTime.UtcNow },
        new() { Id = 4, Title = "Climate Analyst", Company = "Verdant", Location = "London", JobType = "Full-time", Tags = "LCA · Data", Salary = "£62k", Initial = "V", Color = "#22C55E", StartupId = 2, PostedAt = DateTime.UtcNow.AddDays(-1) },
        new() { Id = 5, Title = "Full-Stack Engineer", Company = "Cadence", Location = "San Francisco", JobType = "Full-time", Tags = "React · HIPAA", Salary = "$165k", Initial = "C", Color = "#F97316", StartupId = 3, PostedAt = DateTime.UtcNow.AddDays(-2) },
        new() { Id = 6, Title = "Clinical Lead", Company = "Cadence", Location = "Remote", JobType = "Part-time", Tags = "Licensed", Salary = "$135k", Initial = "C", Color = "#F97316", StartupId = 3, PostedAt = DateTime.UtcNow.AddDays(-3) },
        new() { Id = 7, Title = "Backend Engineer", Company = "Ledgerly", Location = "Lagos · Remote", JobType = "Full-time", Tags = "Go · Payments", Salary = "$120k", Initial = "L", Color = "#A855F7", StartupId = 4, PostedAt = DateTime.UtcNow.AddDays(-4) },
    ];
}
