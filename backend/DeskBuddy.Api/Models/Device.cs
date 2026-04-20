namespace DeskBuddy.Api.Models;

public class Device
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public int BatteryLevel { get; set; }
    public string Mood { get; set; } = "neutral";
    public string Mode { get; set; } = "normal";
    public DateTime LastSeen { get; set; }
}
