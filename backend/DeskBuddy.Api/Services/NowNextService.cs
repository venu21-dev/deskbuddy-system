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
        var now = DateTime.Now;

        var upcoming = await _db.CalendarEvents
            .Where(e => e.EndTime > now)
            .OrderBy(e => e.StartTime)
            .Take(10)
            .ToListAsync();

        var nowEvent  = NowNextCalculator.FindNow(upcoming, now);
        var nextEvent = NowNextCalculator.FindNext(upcoming, now);

        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1);
        var todayCount = await _db.CalendarEvents
            .CountAsync(e => e.StartTime >= todayStart && e.StartTime < todayEnd);

        return new NowNextDto
        {
            TodayEventCount = todayCount,
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
