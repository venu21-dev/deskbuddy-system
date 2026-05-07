using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

public class HeartbeatRequestDto
{
    [Range(0, 100)]
    public int BatteryLevel { get; set; }

    public string Mood { get; set; } = "neutral";

    public string Mode { get; set; } = "normal";
}
