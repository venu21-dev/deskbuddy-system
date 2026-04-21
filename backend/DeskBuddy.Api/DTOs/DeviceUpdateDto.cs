using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

public class DeviceUpdateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public int BatteryLevel { get; set; }
    public string Mood { get; set; } = "neutral";
    public string Mode { get; set; } = "normal";
}
