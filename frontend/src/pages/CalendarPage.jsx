import { useEffect, useState, useCallback } from "react";
import { client } from "../api/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

function EventItem({ event }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm text-white">{event.title}</p>
        <span className="text-xs text-white/35 whitespace-nowrap">{formatDateShort(event.startTime)}</span>
      </div>
      <p className="mt-1 text-sm text-white/55">
        {formatTime(event.startTime)} — {formatTime(event.endTime)}
      </p>
      {event.location && (
        <p className="mt-1 text-xs text-white/35">{event.location}</p>
      )}
      {event.description && (
        <p className="mt-1 text-xs text-white/30 line-clamp-2">{event.description}</p>
      )}
    </div>
  );
}

export function CalendarPage() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const [nowNext, setNowNext] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [nn, evts] = await Promise.all([
        client.getNowNext().catch(() => null),
        client.getCalendarEvents().catch(() => []),
      ]);
      setNowNext(nn);
      setEvents(Array.isArray(evts) ? evts : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      await client.syncCalendar();
      setSyncMessage("Sync successful! Refreshing events...");
      await loadData();
      setSyncMessage("Calendar synced from Google.");
    } catch (err) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <p className="text-white/60">Loading calendar...</p>;

  // Upcoming events (next 7 days, sorted)
  const nowMs = Date.now();
  const upcomingEvents = events
    .filter((e) => new Date(e.endTime).getTime() > nowMs)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">Calendar</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">Schedule</h2>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-2xl border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? "Syncing..." : "Manual Sync Google"}
        </button>
      </div>

      {syncMessage && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
          {syncMessage}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left panel: Session info */}
        <div className="rounded-[28px] bg-white/[0.05] border border-white/10 text-white p-6">
          <p className="text-lg font-semibold text-white">DeskBuddy Session</p>
          <p className="mt-4 text-sm text-white/50">Manage your device &amp; sync events</p>
          <div className="mt-6 space-y-3 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9dfd2]" />
              <span>30 sec poll</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9dfd2]" />
              <span>Device sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9dfd2]" />
              <span>Calendar integration</span>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-xs text-white/35 uppercase tracking-wider mb-2">Total events loaded</p>
            <p className="text-3xl font-light text-white">{events.length}</p>
          </div>
        </div>

        {/* Middle panel: Calendar grid */}
        <div className="rounded-[28px] bg-white/[0.05] border border-white/10 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-white">
              {new Date().toLocaleDateString([], { month: "long", year: "numeric" })}
            </p>
            <button
              onClick={loadData}
              className="text-sm text-white/50 hover:text-white transition"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-7 text-xs text-white/40 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const hasEvent = events.some((ev) => {
                const evDate = new Date(ev.startTime);
                return (
                  evDate.getFullYear() === today.getFullYear() &&
                  evDate.getMonth() === today.getMonth() &&
                  evDate.getDate() === d
                );
              });
              return (
                <button
                  key={d}
                  className={`h-9 rounded-full text-sm relative ${
                    d === today.getDate()
                      ? "bg-[#d9dfd2] text-black font-semibold"
                      : hasEvent
                      ? "bg-white/15 text-white font-medium hover:bg-white/20"
                      : "text-white/60 hover:bg-white/10"
                  }`}
                >
                  {d}
                  {hasEvent && d !== today.getDate() && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#d9dfd2]/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel: Now / Next */}
        <div className="rounded-[28px] bg-white/[0.05] border border-white/10 text-white p-6 flex flex-col">
          <p className="font-medium mb-4 text-white">Now / Next</p>
          <div className="space-y-4 flex-1">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-widest text-white/35 mb-2">Now</p>
              {nowNext?.now ? (
                <>
                  <p className="font-medium text-white">{nowNext.now.title}</p>
                  <p className="mt-1 text-sm text-white/55">
                    {formatTime(nowNext.now.startTime)} — {formatTime(nowNext.now.endTime)}
                  </p>
                  {nowNext.now.location && (
                    <p className="mt-1 text-xs text-white/35">{nowNext.now.location}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-white/40">No current event</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-widest text-white/35 mb-2">Next</p>
              {nowNext?.next ? (
                <>
                  <p className="font-medium text-white">{nowNext.next.title}</p>
                  <p className="mt-1 text-sm text-white/55">
                    {formatTime(nowNext.next.startTime)} — {formatTime(nowNext.next.endTime)}
                  </p>
                  {nowNext.next.location && (
                    <p className="mt-1 text-xs text-white/35">{nowNext.next.location}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-white/40">No upcoming event</p>
              )}
            </div>

            {nowNext?.todayEventCount != null && (
              <p className="text-xs text-white/35 text-center">
                {nowNext.todayEventCount} event{nowNext.todayEventCount !== 1 ? "s" : ""} today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events List */}
      {upcomingEvents.length > 0 && (
        <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-6">
          <p className="font-semibold text-lg mb-4 text-white">Upcoming Events</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {upcomingEvents.map((ev) => (
              <EventItem key={ev.id} event={ev} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
