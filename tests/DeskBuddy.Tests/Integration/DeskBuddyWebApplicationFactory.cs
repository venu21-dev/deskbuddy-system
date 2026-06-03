using DeskBuddy.Api.Data;
using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DeskBuddy.Tests.Integration;

public class DeskBuddyWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Open once — in-memory DB lives as long as this connection stays open
        _connection.Open();

        builder.ConfigureServices(services =>
        {
            // Replace real SQLite file DB with in-memory SQLite for isolation
            var dbDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbDescriptor != null)
                services.Remove(dbDescriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_connection));

            // Replace real GoogleCalendarService — no OAuth2, no network calls in tests
            var googleDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IGoogleCalendarService));
            if (googleDescriptor != null)
                services.Remove(googleDescriptor);

            services.AddScoped<IGoogleCalendarService, FakeGoogleCalendarService>();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

// No-op stub — avoids any Google API calls during automated tests
internal class FakeGoogleCalendarService : IGoogleCalendarService
{
    public Task<IEnumerable<CalendarEventDto>> GetUpcomingEventsAsync()
        => Task.FromResult(Enumerable.Empty<CalendarEventDto>());

    public Task SyncToDbAsync() => Task.CompletedTask;
}
