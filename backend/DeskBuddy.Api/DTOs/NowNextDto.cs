namespace DeskBuddy.Api.DTOs;

/// <summary>DTO returned for the Now/Next endpoint used by the ESP32 device.</summary>
public class NowNextDto
{
    public CalendarEventDto? Now { get; set; }
    public CalendarEventDto? Next { get; set; }
}

public class CalendarEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? GoogleEventId { get; set; }
}
