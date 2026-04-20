namespace DeskBuddy.Api.Models;

public class CalendarEvent
{
    public int Id { get; set; }
    public string GoogleEventId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public DateTime FetchedAt { get; set; }
}
