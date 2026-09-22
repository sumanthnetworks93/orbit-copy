using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Orbit.Api.Models;

namespace Orbit.Api.Services;

public partial class ExternalStartupSources(HttpClient http)
{
    private const int MaxYcCompanies = 150;

    private static readonly string[] Palette =
    [
        "#3B82F6", "#22C55E", "#F97316", "#A855F7", "#14B8A6",
        "#EC4899", "#6366F1", "#EAB308", "#0EA5E9", "#84CC16",
    ];

    public async Task<IReadOnlyList<Startup>> FetchAllAsync(CancellationToken cancellationToken = default)
    {
        var yc = await FetchYcDirectoryAsync(cancellationToken);
        var hn = await FetchHackerNewsShowHnAsync(cancellationToken);
        var github = await FetchGitHubTrendingAsync(cancellationToken);

        return yc.Concat(hn).Concat(github)
            .GroupBy(s => s.ExternalKey)
            .Select(g => g.First())
            .ToList();
    }

    private async Task<IReadOnlyList<Startup>> FetchYcDirectoryAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                "https://raw.githubusercontent.com/yc-oss/api/main/companies/all.json");
            request.Headers.TryAddWithoutValidation("User-Agent", "Orbit-Api/1.0");

            var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<List<YcCompany>>(cancellationToken);
            if (payload is null)
            {
                return [];
            }

            return payload
                .Where(c => c.Status.Equals("Active", StringComparison.OrdinalIgnoreCase)
                    && !string.IsNullOrWhiteSpace(c.Name)
                    && !string.IsNullOrWhiteSpace(c.Slug))
                .OrderByDescending(c => c.LaunchedAt)
                .Take(MaxYcCompanies)
                .Select(MapYcCompany)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private async Task<IReadOnlyList<Startup>> FetchHackerNewsShowHnAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await http.GetFromJsonAsync<HnSearchResponse>(
                "https://hn.algolia.com/api/v1/search?tags=show_hn&hitsPerPage=25",
                cancellationToken);

            if (response?.Hits is null)
            {
                return [];
            }

            return response.Hits
                .Where(hit => hit.Points >= 20)
                .Select(MapHnHit)
                .Where(s => s is not null)
                .Cast<Startup>()
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private async Task<IReadOnlyList<Startup>> FetchGitHubTrendingAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                "https://api.github.com/search/repositories?q=stars:30..8000+pushed:>2024-06-01+forks:>3&sort=updated&order=desc&per_page=15");
            request.Headers.TryAddWithoutValidation("Accept", "application/vnd.github+json");
            request.Headers.TryAddWithoutValidation("User-Agent", "Orbit-Api/1.0");

            var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<GitHubSearchResponse>(cancellationToken);
            if (payload?.Items is null)
            {
                return [];
            }

            return payload.Items
                .Where(IsLikelyProduct)
                .Select(MapGitHubRepo)
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private static bool IsLikelyProduct(GitHubRepo repo)
    {
        if (string.IsNullOrWhiteSpace(repo.Description))
        {
            return false;
        }

        var text = $"{repo.Name} {repo.Description} {repo.FullName}".ToLowerInvariant();
        string[] blocked =
        [
            "awesome list", "curated list", "collection of", "free programming books",
            "roadmap", "tutorial", "examples", "interview", "leetcode", "system design primer",
        ];

        return blocked.All(term => !text.Contains(term));
    }

    private Startup? MapHnHit(HnHit hit)
    {
        var parsed = ParseShowHnTitle(hit.Title);
        if (parsed is null)
        {
            return null;
        }

        var (name, description) = parsed.Value;
        var key = $"hn:{hit.ObjectId}";

        return new Startup
        {
            Name = name,
            Description = description,
            Category = InferCategory(name, description),
            OpenRoles = Math.Clamp((hit.Points % 4) + 1, 1, 4),
            Upvotes = hit.Points,
            Initial = InitialFor(name),
            Color = ColorFor(key),
            ExternalKey = key,
            SourceUrl = hit.Url ?? $"https://news.ycombinator.com/item?id={hit.ObjectId}",
            Location = InferLocation(name, description),
        };
    }

    private static Startup MapGitHubRepo(GitHubRepo repo)
    {
        var key = $"github:{repo.FullName}";
        var category = repo.Topics?.FirstOrDefault() is { Length: > 0 } topic
            ? FormatLabel(topic)
            : repo.Language ?? "Open Source";

        return new Startup
        {
            Name = FormatLabel(repo.Name),
            Description = repo.Description!.Trim(),
            Category = category,
            OpenRoles = Math.Clamp((repo.StargazersCount % 3) + 1, 1, 3),
            Upvotes = repo.StargazersCount,
            Initial = InitialFor(repo.Name),
            Color = ColorFor(key),
            ExternalKey = key,
            SourceUrl = repo.HtmlUrl,
            Location = InferLocation(repo.Name, repo.Description, repo.FullName),
        };
    }

    private static Startup MapYcCompany(YcCompany company)
    {
        var key = $"yc:{company.Slug}";
        var description = !string.IsNullOrWhiteSpace(company.OneLiner)
            ? company.OneLiner.Trim()
            : Truncate(company.LongDescription, 160);

        if (string.IsNullOrWhiteSpace(description))
        {
            description = "YC-backed company";
        }

        var category = !string.IsNullOrWhiteSpace(company.Industry)
            ? company.Industry.Trim()
            : company.Tags?.FirstOrDefault() is { Length: > 0 } tag
                ? tag
                : company.Batch ?? "YC";

        return new Startup
        {
            Name = company.Name.Trim(),
            Description = description,
            Category = FormatBatchCategory(company.Batch, category),
            OpenRoles = company.IsHiring ? Math.Clamp(((company.TeamSize ?? 10) / 20) + 1, 1, 5) : 0,
            Upvotes = company.LaunchedAt,
            Initial = InitialFor(company.Name),
            Color = ColorFor(key),
            ExternalKey = key,
            SourceUrl = company.Url ?? company.Website,
            Location = ResolveYcLocation(company.AllLocations, company.Name, description),
        };
    }

    private static string FormatBatchCategory(string? batch, string category)
    {
        if (string.IsNullOrWhiteSpace(batch))
        {
            return category;
        }

        return $"{batch} · {category}";
    }

    private static string Truncate(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : $"{trimmed[..(maxLength - 1)]}…";
    }

    internal static (string Name, string Description)? ParseShowHnTitle(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return null;
        }

        var match = ShowHnTitleRegex().Match(title.Trim());
        if (!match.Success)
        {
            return null;
        }

        var body = match.Groups[1].Value.Trim();
        foreach (var separator in new[] { " – ", " - ", ": ", " — " })
        {
            var index = body.IndexOf(separator, StringComparison.Ordinal);
            if (index > 0)
            {
                var name = body[..index].Trim();
                var description = body[(index + separator.Length)..].Trim();
                if (name.Length > 0 && description.Length > 0)
                {
                    return (name, description);
                }
            }
        }

        return body.Length > 0 ? (body, "Launched on Hacker News") : null;
    }

    private static string ResolveYcLocation(string? allLocations, string name, string description)
    {
        if (!string.IsNullOrWhiteSpace(allLocations))
        {
            var first = allLocations
                .Split([';', '|'], StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(first))
            {
                return first;
            }
        }

        return InferLocation(name, description, allLocations);
    }

    private static string InferLocation(params string?[] parts)
    {
        var haystack = string.Join(' ', parts.Where(part => !string.IsNullOrWhiteSpace(part)));
        if (LocationReconcile.IsIndiaHyderabadLocation(haystack))
        {
            var normalized = haystack.ToLowerInvariant();
            if (normalized.Contains("hyderabad") || normalized.Contains("secunderabad") || normalized.Contains("hitec") || normalized.Contains("hitech"))
            {
                return "Hyderabad, Telangana";
            }

            return "Telangana";
        }

        return "Remote";
    }

    private static string InferCategory(string name, string description)
    {
        var text = $"{name} {description}".ToLowerInvariant();

        if (text.Contains("ai") || text.Contains("ml") || text.Contains("llm"))
            return "AI";
        if (text.Contains("climate") || text.Contains("carbon") || text.Contains("solar"))
            return "Climate";
        if (text.Contains("health") || text.Contains("medical") || text.Contains("patient"))
            return "Health";
        if (text.Contains("pay") || text.Contains("bank") || text.Contains("fintech"))
            return "Fintech";
        if (text.Contains("dev") || text.Contains("engineer") || text.Contains("code"))
            return "Dev Tools";

        return "Launch";
    }

    private static string InitialFor(string name)
    {
        var trimmed = name.Trim();
        return trimmed.Length > 0
            ? char.ToUpperInvariant(trimmed[0]).ToString()
            : "?";
    }

    private static string ColorFor(string key)
    {
        var hash = Math.Abs(StringComparer.Ordinal.GetHashCode(key));
        return Palette[hash % Palette.Length];
    }

    private static string FormatLabel(string value) =>
        string.Join(' ', value.Replace('-', ' ').Replace('_', ' ').Split(' ', StringSplitOptions.RemoveEmptyEntries));

    [GeneratedRegex(@"^Show HN:\s*(.+)$", RegexOptions.IgnoreCase)]
    private static partial Regex ShowHnTitleRegex();

    private sealed class HnSearchResponse
    {
        [JsonPropertyName("hits")]
        public List<HnHit>? Hits { get; set; }
    }

    private sealed class HnHit
    {
        [JsonPropertyName("objectID")]
        public string ObjectId { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("points")]
        public int Points { get; set; }
    }

    private sealed class GitHubSearchResponse
    {
        [JsonPropertyName("items")]
        public List<GitHubRepo>? Items { get; set; }
    }

    private sealed class GitHubRepo
    {
        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; } = string.Empty;

        [JsonPropertyName("stargazers_count")]
        public int StargazersCount { get; set; }

        [JsonPropertyName("language")]
        public string? Language { get; set; }

        [JsonPropertyName("topics")]
        public List<string>? Topics { get; set; }
    }

    private sealed class YcCompany
    {
        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("one_liner")]
        public string? OneLiner { get; set; }

        [JsonPropertyName("long_description")]
        public string? LongDescription { get; set; }

        [JsonPropertyName("website")]
        public string? Website { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("batch")]
        public string? Batch { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("industry")]
        public string? Industry { get; set; }

        [JsonPropertyName("tags")]
        public List<string>? Tags { get; set; }

        [JsonPropertyName("team_size")]
        public int? TeamSize { get; set; }

        [JsonPropertyName("isHiring")]
        public bool IsHiring { get; set; }

        [JsonPropertyName("launched_at")]
        public int LaunchedAt { get; set; }

        [JsonPropertyName("all_locations")]
        public string? AllLocations { get; set; }
    }
}
