using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
}
