using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Middleware;
using Orbit.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<OrbitDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=orbit.db"));

builder.Services.AddSingleton<FirebaseAuthService>();
builder.Services.AddScoped<CurrentUser>();
builder.Services.AddHttpClient<ExternalStartupSources>();
builder.Services.AddScoped<StartupSyncService>();
builder.Services.Configure<IpGeolocationOptions>(options =>
{
    builder.Configuration.GetSection(IpGeolocationOptions.SectionName).Bind(options);
    if (string.IsNullOrWhiteSpace(options.ApiKey))
    {
        options.ApiKey = builder.Configuration["IPGEO_API_KEY"] ?? string.Empty;
    }
});
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<IpGeolocationService>();
builder.Services.AddHttpClient();
builder.Services.Configure<AlertOptions>(options =>
{
    builder.Configuration.GetSection(AlertOptions.SectionName).Bind(options);
    if (string.IsNullOrWhiteSpace(options.DiscordWebhookUrl))
    {
        options.DiscordWebhookUrl = builder.Configuration["DISCORD_WEBHOOK_URL"] ?? string.Empty;
    }
    if (string.IsNullOrWhiteSpace(options.AdminEmail))
    {
        options.AdminEmail = builder.Configuration["ADMIN_ALERT_EMAIL"] ?? "support@orbit.app";
    }
});
builder.Services.AddScoped<LoginAlertService>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(_ => true);
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OrbitDbContext>();
    await DatabaseInitializer.InitializeAsync(db);

    var startupSync = scope.ServiceProvider.GetRequiredService<StartupSyncService>();
    await startupSync.SyncAsync();
}

app.Services.GetRequiredService<FirebaseAuthService>().EnsureInitialized();

app.UseCors();
app.UseMiddleware<FirebaseAuthMiddleware>();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    app = "Orbit.Api",
}));
app.MapControllers();

app.Run();
