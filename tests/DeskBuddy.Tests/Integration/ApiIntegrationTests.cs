using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using DeskBuddy.Api.DTOs;
using Xunit;

namespace DeskBuddy.Tests.Integration;

public class ApiIntegrationTests : IClassFixture<DeskBuddyWebApplicationFactory>
{
    private readonly DeskBuddyWebApplicationFactory _factory;

    // Matches appsettings.json → Device:ApiKey
    private const string DeviceApiKey = "deskbuddy-device-key-2024";

    public ApiIntegrationTests(DeskBuddyWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient NewClient() => _factory.CreateClient();

    private async Task<string> LoginAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "admin123" });
        var body = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        return body!.Token;
    }

    // ── Health ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var client = NewClient();

        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── Auth ───────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var client = NewClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "admin123" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.False(string.IsNullOrEmpty(body!.Token));
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var client = NewClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ── Devices ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetDevices_WithoutToken_ReturnsUnauthorized()
    {
        var client = NewClient();

        var response = await client.GetAsync("/api/devices");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateDevice_WithToken_ReturnsCreated()
    {
        var client = NewClient();
        var token = await LoginAsync(client);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/devices",
            new { name = "Integration Test Device" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task GetDevices_WithToken_ReturnsListContainingCreatedDevice()
    {
        var client = NewClient();
        var token = await LoginAsync(client);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Arrange: create a device first
        await client.PostAsJsonAsync("/api/devices", new { name = "Listed Device" });

        // Act
        var response = await client.GetAsync("/api/devices");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var devices = await response.Content.ReadFromJsonAsync<List<DeviceStatusDto>>();
        Assert.NotNull(devices);
        Assert.Contains(devices, d => d.Name == "Listed Device");
    }

    // ── NowNext ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetNowNext_WithApiKey_ReturnsOkWithExpectedStructure()
    {
        var client = NewClient();
        client.DefaultRequestHeaders.Add("X-Api-Key", DeviceApiKey);

        var response = await client.GetAsync("/api/nownext");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<NowNextDto>();
        Assert.NotNull(body);
        // Now and Next may be null (no events seeded) — TodayEventCount must be present
        Assert.True(body.TodayEventCount >= 0);
    }
}
