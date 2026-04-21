using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface ICalendarEventService
{
    Task<IEnumerable<CalendarEventDto>> GetAllAsync();
    Task<CalendarEventDto?> GetByIdAsync(int id);
    Task<CalendarEventDto> CreateAsync(CalendarEventCreateDto dto);
    Task<bool> UpdateAsync(int id, CalendarEventUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
