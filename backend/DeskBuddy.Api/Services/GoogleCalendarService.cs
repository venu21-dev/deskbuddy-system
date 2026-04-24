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

    public GoogleCalendarService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<IEnumerable<CalendarEventDto>> GetUpcomingEventsAsync()
    {
        var service = await BuildServiceAsync();

        var request = service.Events.List("primary");
        request.TimeMinDateTimeOffset = DateTimeOffset.UtcNow;
        request.TimeMaxDateTimeOffset = DateTimeOffset.UtcNow.AddDays(7);
        request.SingleEvents = true;
        request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;
        request.MaxResults = 20;

        var result = await request.ExecuteAsync();

        return result.Items?
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
    }

    public async Task SyncToDbAsync()
    {
        var events = await GetUpcomingEventsAsync();

        foreach (var ev in events)
        {
            var exists = await _db.CalendarEvents
                .AnyAsync(e => e.GoogleEventId == ev.GoogleEventId);

            if (!exists)
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
        }

        await _db.SaveChangesAsync();
    }

    private async Task<CalendarService> BuildServiceAsync()
    {
        var secretsPath = _config["GoogleCalendar:CredentialsPath"]
            ?? "Secrets/google-oauth-client.json";

        using var stream = new FileStream(secretsPath, FileMode.Open, FileAccess.Read);

        var credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
            GoogleClientSecrets.FromStream(stream).Secrets,
            new[] { CalendarService.Scope.CalendarReadonly },
            "user",
            CancellationToken.None
        );

        return new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "DeskBuddy"
        });
    }
}
