using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

/// <summary>DTO for updating an existing device. Sent by client in PUT /api/devices/{id}.</summary>
public class DeviceUpdateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    [Range(0, 100)]
    public int BatteryLevel { get; set; }
    public string Mood { get; set; } = "neutral";
    public string Mode { get; set; } = "normal";
}
