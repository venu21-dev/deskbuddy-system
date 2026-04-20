using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface IDeviceService
{
    Task<IEnumerable<DeviceStatusDto>> GetAllAsync();
    Task<DeviceStatusDto?> GetByIdAsync(int id);
    Task UpdateStatusAsync(int id, DeviceStatusDto dto);
}
