using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface IAuthService
{
    LoginResponseDto? Login(LoginRequestDto request);
}
