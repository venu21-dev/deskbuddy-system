using DeskBuddy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeskBuddy.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GoogleCalendarController : ControllerBase
{
    private readonly IGoogleCalendarService _service;

    public GoogleCalendarController(IGoogleCalendarService service)
    {
        _service = service;
    }

    /// <summary>Returns upcoming events directly from Google Calendar (next 7 days).</summary>
    [HttpGet("events")]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _service.GetUpcomingEventsAsync();
        return Ok(events);
    }

    /// <summary>Syncs Google Calendar events into the local SQLite database.</summary>
    [HttpPost("sync")]
    public async Task<IActionResult> Sync()
    {
        await _service.SyncToDbAsync();
        return Ok(new { message = "Sync completed." });
    }
}
