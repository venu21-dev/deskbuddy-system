using DeskBuddy.Api.Data;
using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DeskBuddy.Api.Services;

public class DeviceService : IDeviceService
{
    private readonly AppDbContext _db;

    public DeviceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<DeviceStatusDto>> GetAllAsync()
    {
        return await _db.Devices.Select(d => ToDto(d)).ToListAsync();
    }

    public async Task<DeviceStatusDto?> GetByIdAsync(int id)
    {
        var device = await _db.Devices.FindAsync(id);
        return device is null ? null : ToDto(device);
    }

    public async Task<DeviceStatusDto> CreateAsync(DeviceCreateDto dto)
    {
        var device = new Device
        {
            Name = dto.Name,
            ApiKey = Guid.NewGuid().ToString(),
            LastSeen = DateTime.UtcNow
        };

        _db.Devices.Add(device);
        await _db.SaveChangesAsync();

        return ToDto(device);
    }

    public async Task<bool> UpdateAsync(int id, DeviceUpdateDto dto)
    {
        var device = await _db.Devices.FindAsync(id);
        if (device is null) return false;

        device.Name = dto.Name;
        device.IsOnline = dto.IsOnline;
        device.BatteryLevel = dto.BatteryLevel;
        device.Mood = dto.Mood;
        device.Mode = dto.Mode;
        device.LastSeen = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var device = await _db.Devices.FindAsync(id);
        if (device is null) return false;

        _db.Devices.Remove(device);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HeartbeatAsync(int id, HeartbeatRequestDto dto)
    {
        var device = await _db.Devices.FindAsync(id);
        if (device is null) return false;

        device.IsOnline = true;
        device.BatteryLevel = dto.BatteryLevel;
        device.Mood = dto.Mood;
        device.Mode = dto.Mode;
        device.LastSeen = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    private static DeviceStatusDto ToDto(Device d) => new()
    {
        Id = d.Id,
        Name = d.Name,
        IsOnline = d.LastSeen > DateTime.UtcNow.AddMinutes(-2),
        BatteryLevel = d.BatteryLevel,
        Mood = d.Mood,
        Mode = d.Mode,
        LastSeen = d.LastSeen
    };
}
