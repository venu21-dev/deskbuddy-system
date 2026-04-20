namespace DeskBuddy.Api.DTOs;

public class NowNextDto
{
    public CalendarEventDto? Now { get; set; }
    public CalendarEventDto? Next { get; set; }
}

public class CalendarEventDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
}
