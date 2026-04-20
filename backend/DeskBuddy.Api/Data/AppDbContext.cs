using DeskBuddy.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DeskBuddy.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Device> Devices => Set<Device>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
}
