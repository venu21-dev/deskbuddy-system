using DeskBuddy.Api.DTOs;

namespace DeskBuddy.Api.Services;

public interface INowNextService
{
    Task<NowNextDto> GetNowNextAsync();
}
