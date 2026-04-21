using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DeskBuddy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarEventsController : ControllerBase
{
    private readonly ICalendarEventService _service;

    public CalendarEventsController(ICalendarEventService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var events = await _service.GetAllAsync();
        return Ok(events);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ev = await _service.GetByIdAsync(id);
        if (ev is null) return NotFound();
        return Ok(ev);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CalendarEventCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CalendarEventUpdateDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
