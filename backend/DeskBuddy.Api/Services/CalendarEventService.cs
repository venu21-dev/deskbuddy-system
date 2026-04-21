using DeskBuddy.Api.Data;
using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DeskBuddy.Api.Services;

public class CalendarEventService : ICalendarEventService
{
    private readonly AppDbContext _db;

    public CalendarEventService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<CalendarEventDto>> GetAllAsync()
    {
        return await _db.CalendarEvents.Select(e => ToDto(e)).ToListAsync();
    }

    public async Task<CalendarEventDto?> GetByIdAsync(int id)
    {
        var ev = await _db.CalendarEvents.FindAsync(id);
        return ev is null ? null : ToDto(ev);
    }

    public async Task<CalendarEventDto> CreateAsync(CalendarEventCreateDto dto)
    {
        var ev = new CalendarEvent
        {
            Title = dto.Title,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Location = dto.Location,
            Description = dto.Description,
            GoogleEventId = string.Empty,
            FetchedAt = DateTime.UtcNow
        };

        _db.CalendarEvents.Add(ev);
        await _db.SaveChangesAsync();

        return ToDto(ev);
    }

    public async Task<bool> UpdateAsync(int id, CalendarEventUpdateDto dto)
    {
        var ev = await _db.CalendarEvents.FindAsync(id);
        if (ev is null) return false;

        ev.Title = dto.Title;
        ev.StartTime = dto.StartTime;
        ev.EndTime = dto.EndTime;
        ev.Location = dto.Location;
        ev.Description = dto.Description;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ev = await _db.CalendarEvents.FindAsync(id);
        if (ev is null) return false;

        _db.CalendarEvents.Remove(ev);
        await _db.SaveChangesAsync();
        return true;
    }

    private static CalendarEventDto ToDto(CalendarEvent e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        StartTime = e.StartTime,
        EndTime = e.EndTime,
        Location = e.Location,
        Description = e.Description,
        GoogleEventId = e.GoogleEventId
    };
}
