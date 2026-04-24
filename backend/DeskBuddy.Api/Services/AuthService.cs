using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DeskBuddy.Api.DTOs;
using Microsoft.IdentityModel.Tokens;

namespace DeskBuddy.Api.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public LoginResponseDto? Login(LoginRequestDto request)
    {
        var expectedUsername = _config["Admin:Username"];
        var expectedPassword = _config["Admin:Password"];

        if (request.Username != expectedUsername || request.Password != expectedPassword)
            return null;

        var token = GenerateToken(request.Username);
        return token;
    }

    private LoginResponseDto GenerateToken(string username)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresInHours = int.Parse(_config["Jwt:ExpiresInHours"]!);
        var expiresAt = DateTime.UtcNow.AddHours(expiresInHours);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "Admin"),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = username,
            ExpiresAt = expiresAt
        };
    }
}
