using System.ComponentModel.DataAnnotations;

namespace DeskBuddy.Api.DTOs;

public class DeviceCreateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
