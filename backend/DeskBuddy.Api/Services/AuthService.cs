using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DeskBuddy.Api.Data;
using DeskBuddy.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DeskBuddy.Api.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public AuthService(IConfiguration config, AppDbContext db)
    {
        _config = config;
        _db = db;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return GenerateToken(user.Username, user.Role);
    }

    private LoginResponseDto GenerateToken(string username, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresInHours = int.Parse(_config["Jwt:ExpiresInHours"]!);
        var expiresAt = DateTime.UtcNow.AddHours(expiresInHours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
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
