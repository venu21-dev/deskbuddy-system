using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface IGoogleCalendarService
{
    Task<IEnumerable<CalendarEventDto>> GetUpcomingEventsAsync();
    Task SyncToDbAsync();
}
