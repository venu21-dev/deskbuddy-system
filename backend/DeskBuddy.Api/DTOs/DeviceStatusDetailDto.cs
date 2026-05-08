namespace DeskBuddy.Api.DTOs;

public class DeviceStatusDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public int BatteryLevel { get; set; }
    public string Mood { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; }
    public int MinutesSinceLastSeen { get; set; }
}
