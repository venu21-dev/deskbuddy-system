using DeskBuddy.Api.Filters;
using DeskBuddy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DeskBuddy.Api.Controllers;

[ApiKeyAuth]
[ApiController]
[Route("api/[controller]")]
public class NowNextController : ControllerBase
{
    private readonly INowNextService _service;

    public NowNextController(INowNextService service)
    {
        _service = service;
    }

    /// <summary>Returns the current and next calendar event. Used by ESP32 device.</summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _service.GetNowNextAsync();
        return Ok(result);
    }
}
