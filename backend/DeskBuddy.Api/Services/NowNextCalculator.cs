using DeskBuddy.Api.Models;

namespace DeskBuddy.Api.Services;

/// <summary>
/// Pure logic for Now/Next and device online status — no DB, no DI, easily testable.
/// </summary>
public static class NowNextCalculator
{
    public static CalendarEvent? FindNow(IList<CalendarEvent> events, DateTime now)
        => events.FirstOrDefault(e => e.StartTime <= now && e.EndTime > now);

    public static CalendarEvent? FindNext(IList<CalendarEvent> events, DateTime now)
        => events.Where(e => e.StartTime > now).MinBy(e => e.StartTime);

    public static bool IsDeviceOnline(DateTime? lastSeen, DateTime now, int offlineAfterMinutes)
        => lastSeen.HasValue && lastSeen.Value > now.AddMinutes(-offlineAfterMinutes);
}
