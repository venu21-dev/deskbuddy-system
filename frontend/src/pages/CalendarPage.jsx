import { useEffect, useState } from "react";
import { fakeApi } from "../api/fakeApi";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATES = Array.from({ length: 31 }, (_, i) => i + 1);
const TIME_SLOTS = ["11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM"];

export function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fakeApi.getEvents().then((result) => {
      setEvents(result);
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
            <p className="font-medium">July 2026</p>
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
                className={`h-9 rounded-full text-sm ${d === 8 ? "bg-black text-white" : "hover:bg-black/10"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white text-black p-6">
          <p className="font-medium mb-4">Available times</p>
          <div className="space-y-3">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                className="w-full border border-black/20 rounded-xl py-3 text-sm hover:bg-black hover:text-white transition"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
