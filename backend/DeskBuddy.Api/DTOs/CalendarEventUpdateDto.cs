using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

public class CalendarEventUpdateDto
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
