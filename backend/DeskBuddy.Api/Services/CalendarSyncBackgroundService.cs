namespace DeskBuddy.Api.Services;

public class CalendarSyncBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CalendarSyncBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(5);

    public CalendarSyncBackgroundService(IServiceScopeFactory scopeFactory, ILogger<CalendarSyncBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run once shortly after startup, then repeat every 5 minutes
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        await RunSyncAsync();

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_interval, stoppingToken);
            await RunSyncAsync();
        }
    }

    private async Task RunSyncAsync()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IGoogleCalendarService>();
            await service.SyncToDbAsync();
            _logger.LogInformation("Calendar sync completed at {Time}", DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Calendar sync failed");
        }
    }
}
