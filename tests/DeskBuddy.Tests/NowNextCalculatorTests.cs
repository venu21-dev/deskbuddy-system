using DeskBuddy.Api.Models;
using DeskBuddy.Api.Services;
using Xunit;

namespace DeskBuddy.Tests;

public class NowNextCalculatorTests
{
    private static readonly DateTime Now = new DateTime(2026, 6, 2, 10, 0, 0);

    // ── FindNow ────────────────────────────────────────────────────────────────

    [Fact]
    public void FindNow_WhenNoEvents_ReturnsNull()
    {
        var result = NowNextCalculator.FindNow([], Now);

        Assert.Null(result);
    }

    [Fact]
    public void FindNow_WhenEventIsRunning_ReturnsEvent()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Standup", StartTime = Now.AddMinutes(-15), EndTime = Now.AddMinutes(30) }
        };

        var result = NowNextCalculator.FindNow(events, Now);

        Assert.NotNull(result);
        Assert.Equal("Standup", result.Title);
    }

    [Fact]
    public void FindNow_WhenEventAlreadyEnded_ReturnsNull()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Old Meeting", StartTime = Now.AddHours(-2), EndTime = Now.AddMinutes(-30) }
        };

        var result = NowNextCalculator.FindNow(events, Now);

        Assert.Null(result);
    }

    // ── FindNext ───────────────────────────────────────────────────────────────

    [Fact]
    public void FindNext_WhenFutureEventExists_ReturnsEarliestOne()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Later",  StartTime = Now.AddHours(3), EndTime = Now.AddHours(4) },
            new() { Title = "Sooner", StartTime = Now.AddHours(1), EndTime = Now.AddHours(2) }
        };

        var result = NowNextCalculator.FindNext(events, Now);

        Assert.NotNull(result);
        Assert.Equal("Sooner", result.Title);
    }

    [Fact]
    public void FindNext_WhenNoFutureEvents_ReturnsNull()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Past", StartTime = Now.AddHours(-3), EndTime = Now.AddHours(-1) }
        };

        var result = NowNextCalculator.FindNext(events, Now);

        Assert.Null(result);
    }

    // ── IsDeviceOnline ─────────────────────────────────────────────────────────

    [Fact]
    public void IsDeviceOnline_WhenLastSeenRecently_ReturnsTrue()
    {
        var lastSeen = Now.AddSeconds(-30);

        var result = NowNextCalculator.IsDeviceOnline(lastSeen, Now, offlineAfterMinutes: 2);

        Assert.True(result);
    }

    [Fact]
    public void IsDeviceOnline_WhenLastSeenTooLongAgo_ReturnsFalse()
    {
        var lastSeen = Now.AddMinutes(-5);

        var result = NowNextCalculator.IsDeviceOnline(lastSeen, Now, offlineAfterMinutes: 2);

        Assert.False(result);
    }

    // ── FindNow boundary cases ─────────────────────────────────────────────────

    [Fact]
    public void FindNow_WhenEventStartsExactlyNow_ReturnsEvent()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Sharp Start", StartTime = Now, EndTime = Now.AddMinutes(30) }
        };

        var result = NowNextCalculator.FindNow(events, Now);

        Assert.NotNull(result);
        Assert.Equal("Sharp Start", result.Title);
    }

    [Fact]
    public void FindNow_WhenEventEndsExactlyNow_ReturnsNull()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Just Ended", StartTime = Now.AddMinutes(-30), EndTime = Now }
        };

        var result = NowNextCalculator.FindNow(events, Now);

        Assert.Null(result);
    }

    // ── FindNext edge cases ────────────────────────────────────────────────────

    [Fact]
    public void FindNext_WithMixedPastAndFutureEvents_IgnoresPastEvents()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Past",   StartTime = Now.AddHours(-3), EndTime = Now.AddHours(-1) },
            new() { Title = "Future", StartTime = Now.AddHours(2),  EndTime = Now.AddHours(3) }
        };

        var result = NowNextCalculator.FindNext(events, Now);

        Assert.NotNull(result);
        Assert.Equal("Future", result.Title);
    }

    [Fact]
    public void FindNext_WithUnorderedFutureEvents_ReturnsEarliestOne()
    {
        var events = new List<CalendarEvent>
        {
            new() { Title = "Last",   StartTime = Now.AddHours(5), EndTime = Now.AddHours(6) },
            new() { Title = "First",  StartTime = Now.AddHours(1), EndTime = Now.AddHours(2) },
            new() { Title = "Middle", StartTime = Now.AddHours(3), EndTime = Now.AddHours(4) }
        };

        var result = NowNextCalculator.FindNext(events, Now);

        Assert.NotNull(result);
        Assert.Equal("First", result.Title);
    }

    // ── IsDeviceOnline edge cases ──────────────────────────────────────────────

    [Fact]
    public void IsDeviceOnline_WhenLastSeenIsNull_ReturnsFalse()
    {
        var result = NowNextCalculator.IsDeviceOnline(null, Now, offlineAfterMinutes: 2);

        Assert.False(result);
    }

    [Fact]
    public void IsDeviceOnline_WhenLastSeenExactlyAtBoundary_ReturnsFalse()
    {
        // The threshold is exclusive: lastSeen must be strictly AFTER (now - offlineAfterMinutes).
        // A device last seen exactly at the boundary counts as offline.
        var lastSeen = Now.AddMinutes(-2);

        var result = NowNextCalculator.IsDeviceOnline(lastSeen, Now, offlineAfterMinutes: 2);

        Assert.False(result);
    }
}
