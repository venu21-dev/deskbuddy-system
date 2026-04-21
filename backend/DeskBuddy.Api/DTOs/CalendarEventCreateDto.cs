using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

/// <summary>DTO for creating a calendar event manually. POST /api/calendarevents.</summary>
public class CalendarEventCreateDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public string? Location { get; set; }
    public string? Description { get; set; }
}
