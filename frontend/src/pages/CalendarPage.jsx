import { useEffect, useState } from "react";
import { api } from "../api/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATES = Array.from({ length: 31 }, (_, i) => i + 1);

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function CalendarPage() {
  const [nowNext, setNowNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getNowNext()
      .then((data) => {
        setNowNext(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-white/60">Loading calendar...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-white/35">Calendar</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">Schedule</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="rounded-[28px] bg-white text-black p-6">
          <p className="text-lg font-semibold">DeskBuddy Session</p>
          <p className="mt-4 text-sm text-black/60">Manage your device & sync events</p>
          <div className="mt-6 space-y-3 text-sm">
            <p>⏱ 30 min</p>
            <p>🔌 Device sync</p>
            <p>📅 Calendar integration</p>
          </div>
        </div>

        <div className="rounded-[28px] bg-white text-black p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">
              {new Date().toLocaleDateString([], { month: "long", year: "numeric" })}
            </p>
            <button className="text-sm text-black/60">Today</button>
          </div>
          <div className="grid grid-cols-7 text-xs text-black/50 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DATES.map((d) => (
              <button
                key={d}
                className={`h-9 rounded-full text-sm ${d === new Date().getDate() ? "bg-black text-white" : "hover:bg-black/10"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white text-black p-6 flex flex-col">
          <p className="font-medium mb-4">Now / Next</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!error && (
            <div className="space-y-4 flex-1">
              <div className="rounded-xl border border-black/10 p-4">
                <p className="text-xs uppercase tracking-widest text-black/40 mb-2">Now</p>
                {nowNext?.now ? (
                  <>
                    <p className="font-medium">{nowNext.now.title}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {formatTime(nowNext.now.startTime)} — {formatTime(nowNext.now.endTime)}
                    </p>
                    {nowNext.now.location && (
                      <p className="mt-1 text-xs text-black/40">{nowNext.now.location}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-black/45">No current event</p>
                )}
              </div>

              <div className="rounded-xl border border-black/10 p-4">
                <p className="text-xs uppercase tracking-widest text-black/40 mb-2">Next</p>
                {nowNext?.next ? (
                  <>
                    <p className="font-medium">{nowNext.next.title}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {formatTime(nowNext.next.startTime)} — {formatTime(nowNext.next.endTime)}
                    </p>
                    {nowNext.next.location && (
                      <p className="mt-1 text-xs text-black/40">{nowNext.next.location}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-black/45">No upcoming event</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
