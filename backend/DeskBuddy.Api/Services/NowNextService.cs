using DeskBuddy.Api.Data;
using DeskBuddy.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DeskBuddy.Api.Services;

public class NowNextService : INowNextService
{
    private readonly AppDbContext _db;

    public NowNextService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<NowNextDto> GetNowNextAsync()
    {
        var now = DateTime.UtcNow;

        var upcoming = await _db.CalendarEvents
            .Where(e => e.EndTime > now)
            .OrderBy(e => e.StartTime)
            .Take(10)
            .ToListAsync();

        // Now: event whose window contains the current time
        var nowEvent = upcoming.FirstOrDefault(e => e.StartTime <= now && e.EndTime > now);

        // Next: first event that starts in the future
        var nextEvent = upcoming.FirstOrDefault(e => e.StartTime > now);

        return new NowNextDto
        {
            Now = nowEvent is null ? null : new CalendarEventDto
            {
                Id = nowEvent.Id,
                Title = nowEvent.Title,
                StartTime = nowEvent.StartTime,
                EndTime = nowEvent.EndTime,
                Location = nowEvent.Location,
                Description = nowEvent.Description,
                GoogleEventId = nowEvent.GoogleEventId
            },
            Next = nextEvent is null ? null : new CalendarEventDto
            {
                Id = nextEvent.Id,
                Title = nextEvent.Title,
                StartTime = nextEvent.StartTime,
                EndTime = nextEvent.EndTime,
                Location = nextEvent.Location,
                Description = nextEvent.Description,
                GoogleEventId = nextEvent.GoogleEventId
            }
        };
    }
}
