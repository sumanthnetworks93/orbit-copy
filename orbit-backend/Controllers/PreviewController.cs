using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Services;

namespace Orbit.Api.Controllers;

[ApiController]
[Route("preview")]
public class PreviewController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> Get([FromQuery] int port = 8081)
    {
        port = Math.Clamp(port, 1, 65535);
        var addresses = LanHost.IPv4Addresses();
        var ip = addresses.FirstOrDefault() ?? "127.0.0.1";
        var publicUrl = await NgrokTunnel.PublicUrlAsync();
        return Ok(new
        {
            ip,
            port,
            url = $"http://{ip}:{port}/",
            publicUrl,
            addresses,
        });
    }
}
