namespace DeskBuddy.Api.DTOs;

public class DeviceStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public int BatteryLevel { get; set; }
    public string Mood { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; }
}
