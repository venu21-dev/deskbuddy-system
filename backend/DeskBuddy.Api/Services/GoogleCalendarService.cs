using DeskBuddy.Api.Data;
using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Microsoft.EntityFrameworkCore;

namespace DeskBuddy.Api.Services;

public class GoogleCalendarService : IGoogleCalendarService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    // Cached once across all DI scopes — avoids re-authorizing on every background sync
    private static CalendarService? _cachedService;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public GoogleCalendarService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<IEnumerable<CalendarEventDto>> GetUpcomingEventsAsync()
    {
        var service = await BuildServiceAsync();

        var calendarIds = new List<string> { "primary" };
        var extras = _config.GetSection("GoogleCalendar:ExtraCalendarIds").Get<string[]>();
        if (extras != null)
            calendarIds.AddRange(extras);

        var allEvents = new List<CalendarEventDto>();

        foreach (var calendarId in calendarIds)
        {
            var request = service.Events.List(calendarId);
            request.TimeMinDateTimeOffset = DateTimeOffset.UtcNow;
            request.TimeMaxDateTimeOffset = DateTimeOffset.UtcNow.AddDays(7);
            request.SingleEvents = true;
            request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;
            request.MaxResults = 20;

            var result = await request.ExecuteAsync();

            var events = result.Items?
                .Where(e => e.Start?.DateTime != null)
                .Select(e => new CalendarEventDto
                {
                    Id = 0,
                    Title = e.Summary ?? "(No title)",
                    StartTime = e.Start.DateTime!.Value,
                    EndTime = e.End?.DateTime ?? e.Start.DateTime!.Value,
                    Location = e.Location,
                    Description = e.Description,
                    GoogleEventId = e.Id
                }) ?? Enumerable.Empty<CalendarEventDto>();

            allEvents.AddRange(events);
        }

        return allEvents.OrderBy(e => e.StartTime);
    }

    public async Task SyncToDbAsync()
    {
        var events = await GetUpcomingEventsAsync();

        // Full replace: clear everything and re-insert from Google
        var all = await _db.CalendarEvents.ToListAsync();
        _db.CalendarEvents.RemoveRange(all);

        foreach (var ev in events)
        {
            _db.CalendarEvents.Add(new CalendarEvent
            {
                GoogleEventId = ev.GoogleEventId ?? string.Empty,
                Title = ev.Title,
                StartTime = ev.StartTime,
                EndTime = ev.EndTime,
                Location = ev.Location,
                Description = ev.Description,
                FetchedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }

    private async Task<CalendarService> BuildServiceAsync()
    {
        if (_cachedService is not null) return _cachedService;

        await _lock.WaitAsync();
        try
        {
            if (_cachedService is not null) return _cachedService;

            var secretsPath = _config["GoogleCalendar:CredentialsPath"]
                ?? "Secrets/google-oauth-client.json";

            using var stream = new FileStream(secretsPath, FileMode.Open, FileAccess.Read);

            var credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                GoogleClientSecrets.FromStream(stream).Secrets,
                new[] { CalendarService.Scope.CalendarReadonly },
                "user",
                CancellationToken.None
            );

            _cachedService = new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "DeskBuddy"
            });

            return _cachedService;
        }
        finally
        {
            _lock.Release();
        }
    }
}
