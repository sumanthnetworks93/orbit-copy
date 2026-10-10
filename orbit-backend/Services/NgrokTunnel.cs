using System.Text.Json;

namespace Orbit.Api.Services;

public static class NgrokTunnel
{
    static readonly HttpClient Client = new() { Timeout = TimeSpan.FromMilliseconds(400) };

    public static async Task<string?> PublicUrlAsync()
    {
        var fromEnv = Environment.GetEnvironmentVariable("ORBIT_PUBLIC_URL");
        if (!string.IsNullOrWhiteSpace(fromEnv))
        {
            return fromEnv.Trim().TrimEnd('/') + "/";
        }

        try
        {
            using var response = await Client.GetAsync("http://127.0.0.1:4040/api/tunnels");
            if (!response.IsSuccessStatusCode) return null;

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            if (!doc.RootElement.TryGetProperty("tunnels", out var tunnels)) return null;

            foreach (var tunnel in tunnels.EnumerateArray())
            {
                if (!tunnel.TryGetProperty("public_url", out var url)) continue;
                var value = url.GetString();
                if (string.IsNullOrWhiteSpace(value)) continue;
                if (!value.StartsWith("https://", StringComparison.OrdinalIgnoreCase)) continue;
                return value.TrimEnd('/') + "/";
            }
        }
        catch
        {
            // ngrok inspector is optional
        }

        return null;
    }
}
