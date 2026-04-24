using DeskBuddy.Api.DTOs;
using DeskBuddy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DeskBuddy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Admin login. Returns a JWT token on success.</summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        var result = _authService.Login(request);

        if (result is null)
            return Unauthorized(new { message = "Invalid username or password." });

        return Ok(result);
    }
}
