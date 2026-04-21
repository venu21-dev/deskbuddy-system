using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

/// <summary>DTO for creating a new device. Sent by client in POST /api/devices.</summary>
public class DeviceCreateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
