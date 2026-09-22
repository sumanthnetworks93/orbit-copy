namespace Orbit.Api.Services;

public static class LocationReconcile
{
    public const string OutsideLocationTag = "Outside location";

    private static readonly string[] LocalMarkers =
    [
        "hyderabad",
        "secunderabad",
        "telangana",
        "hitec city",
        "hitech city",
        "hitec",
        "hitech",
        "gachibowli",
        "financial district",
        "madhapur",
        "kompally",
        "uppal",
        "adilabad",
        "bhadradri kothagudem",
        "hanumakonda",
        "jagtial",
        "jangaon",
        "jayashankar bhupalpally",
        "jogulamba gadwal",
        "kamareddy",
        "karimnagar",
        "khammam",
        "kumuram bheem asifabad",
        "mahabubabad",
        "mahabubnagar",
        "mancherial",
        "medak",
        "medchal-malkajgiri",
        "mulugu",
        "nagarkurnool",
        "nalgonda",
        "narayanpet",
        "nirmal",
        "nizamabad",
        "peddapalli",
        "rajanna sircilla",
        "rangareddy",
        "sangareddy",
        "siddipet",
        "suryapet",
        "vikarabad",
        "wanaparthy",
        "warangal",
        "yadadri bhuvanagiri",
    ];

    public static bool IsIndiaHyderabadLocation(string? location)
    {
        if (string.IsNullOrWhiteSpace(location))
        {
            return false;
        }

        var haystack = Normalize(location);
        return LocalMarkers.Any(marker => HasMarker(haystack, marker));
    }

    public static bool IsOutside(string? location) => !IsIndiaHyderabadLocation(location);

    public static string ApplyTag(string? location, string? tags)
    {
        var parts = (tags ?? string.Empty)
            .Split(['·', ',', '|'], StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Where(tag => !tag.Equals(OutsideLocationTag, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (IsOutside(location))
        {
            parts.Add(OutsideLocationTag);
        }

        return string.Join(" · ", parts);
    }

    private static string Normalize(string value) =>
        string.Join(' ', value.ToLowerInvariant().Replace('_', ' ').Replace('/', ' ').Replace('.', ' ').Split(' ', StringSplitOptions.RemoveEmptyEntries));

    private static bool HasMarker(string haystack, string marker)
    {
        if (marker.Length <= 3)
        {
            var padded = $" {haystack} ";
            return padded.Contains($" {marker} ", StringComparison.Ordinal);
        }

        return haystack.Contains(marker, StringComparison.Ordinal);
    }
}
