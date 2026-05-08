using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Filters;
using DeskBuddy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeskBuddy.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _service;

    public DevicesController(IDeviceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var devices = await _service.GetAllAsync();
        return Ok(devices);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var device = await _service.GetByIdAsync(id);
        if (device is null) return NotFound();
        return Ok(device);
    }

    [HttpGet("{id}/status")]
    public async Task<IActionResult> GetStatus(int id)
    {
        var status = await _service.GetStatusAsync(id);
        if (status is null) return NotFound();
        return Ok(status);
    }

    [HttpPost]
    public async Task<IActionResult> Create(DeviceCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, DeviceUpdateDto dto)
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

    [ApiKeyAuth]
    [AllowAnonymous]
    [HttpPost("{id}/heartbeat")]
    public async Task<IActionResult> Heartbeat(int id, [FromBody] HeartbeatRequestDto dto)
    {
        var success = await _service.HeartbeatAsync(id, dto);
        if (!success) return NotFound(new { message = $"Device {id} not found." });
        return Ok(new { message = "Heartbeat received.", deviceId = id, lastSeen = DateTime.UtcNow });
    }
}
