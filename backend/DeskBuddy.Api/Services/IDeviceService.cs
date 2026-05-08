using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface IDeviceService
{
    Task<IEnumerable<DeviceStatusDto>> GetAllAsync();
    Task<DeviceStatusDto?> GetByIdAsync(int id);
    Task<DeviceStatusDto> CreateAsync(DeviceCreateDto dto);
    Task<bool> UpdateAsync(int id, DeviceUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> HeartbeatAsync(int id, HeartbeatRequestDto dto);
    Task<DeviceStatusDetailDto?> GetStatusAsync(int id);
}
