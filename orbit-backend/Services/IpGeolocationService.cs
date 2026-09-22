using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Orbit.Api.Services;

public class IpGeolocationOptions
{
    public const string SectionName = "IpGeolocation";

    public string ApiKey { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://api.ipgeolocation.io/v3/ipgeo";
}

public record GeoLocationDto(
    string Ip,
    string City,
    string State,
    string Country,
    string CountryCode,
    string Latitude,
    string Longitude,
    string Timezone,
    string Flag,
    string Emoji,
    string District);

public class IpGeolocationService(
    HttpClient http,
    IOptions<IpGeolocationOptions> options,
    IMemoryCache cache,
    ILogger<IpGeolocationService> logger)
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(6);

    public async Task<GeoLocationDto?> LookupAsync(string? ip, CancellationToken cancellationToken)
    {
        var apiKey = options.Value.ApiKey?.Trim();
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("IpGeolocation API key is not configured.");
            return null;
        }

        var cacheKey = $"ipgeo:{ip ?? "caller"}";
        if (cache.TryGetValue(cacheKey, out GeoLocationDto? cached) && cached is not null)
        {
            return cached;
        }

        var url = $"{options.Value.BaseUrl}?apiKey={Uri.EscapeDataString(apiKey)}";
        if (!string.IsNullOrWhiteSpace(ip))
        {
            url += $"&ip={Uri.EscapeDataString(ip)}";
        }

        using var response = await http.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("IpGeolocation lookup failed with {Status}", (int)response.StatusCode);
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = doc.RootElement;
        var location = root.TryGetProperty("location", out var loc) ? loc : default;
        var timeZone = root.TryGetProperty("time_zone", out var tz) ? tz : default;

        var locEl = location.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null ? root : location;
        var result = new GeoLocationDto(
            Read(root, "ip"),
            First(locEl, "city", "locality"),
            First(locEl, "state_prov", "state"),
            First(locEl, "country_name", "country"),
            First(locEl, "country_code2", "country_code"),
            Read(locEl, "latitude"),
            Read(locEl, "longitude"),
            First(timeZone, "name", "current_tz_full_name"),
            Read(locEl, "country_flag"),
            Read(locEl, "country_emoji"),
            Read(locEl, "district"));

        cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    public static string? ResolveClientIp(HttpContext context)
    {
        var forwarded = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        var candidate = forwarded?.Split(',').FirstOrDefault()?.Trim()
            ?? context.Connection.RemoteIpAddress?.ToString();

        if (string.IsNullOrWhiteSpace(candidate))
        {
            return null;
        }

        if (!IPAddress.TryParse(candidate, out var address))
        {
            return candidate;
        }

        if (IPAddress.IsLoopback(address) || address.IsIPv6LinkLocal)
        {
            return null;
        }

        return address.IsIPv4MappedToIPv6 ? address.MapToIPv4().ToString() : address.ToString();
    }

    private static string First(JsonElement element, params string[] names)
    {
        foreach (var name in names)
        {
            var value = Read(element, name);
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return string.Empty;
    }

    private static string Read(JsonElement element, string name)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
        {
            return string.Empty;
        }

        if (!element.TryGetProperty(name, out var value))
        {
            return string.Empty;
        }

        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString() ?? string.Empty,
            JsonValueKind.Number => value.ToString(),
            _ => string.Empty,
        };
    }
}
