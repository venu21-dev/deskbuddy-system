import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { client, DEVICE_ID } from "../api/client";

const POLL_MS = 30_000;

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 min-w-[140px]">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value ?? "–"}</p>
    </div>
  );
}

// Animated mood visualization — no emojis, CSS keyframe animations
function MoodAnimation({ mood }) {
  const m = (mood || "").toLowerCase();

  if (m === "sleeping") {
    return (
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex gap-5">
          <div className="mood-breathe h-5 w-16 rounded-full bg-white/80" style={{ borderRadius: "999px 999px 0 0", transform: "scaleY(0.3)" }} />
          <div className="mood-breathe h-5 w-16 rounded-full bg-white/80" style={{ borderRadius: "999px 999px 0 0", transform: "scaleY(0.3)", animationDelay: "0.3s" }} />
        </div>
        <div className="relative h-10 w-10">
          <span className="absolute text-white/60 text-lg font-bold" style={{ animation: "mood-float-z 2s ease-in-out infinite", top: 0, left: 0 }}>Z</span>
          <span className="absolute text-white/40 text-sm font-bold" style={{ animation: "mood-float-z 2s ease-in-out 0.7s infinite", top: 4, left: 10 }}>z</span>
          <span className="absolute text-white/25 text-xs font-bold" style={{ animation: "mood-float-z 2s ease-in-out 1.4s infinite", top: 8, left: 18 }}>z</span>
        </div>
      </div>
    );
  }

  if (m === "happy") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="mood-bounce flex gap-6">
          <div className="mood-blink h-10 w-10 rounded-full bg-white" />
          <div className="mood-blink h-10 w-10 rounded-full bg-white" style={{ animationDelay: "0.2s" }} />
        </div>
        <svg width="60" height="24" viewBox="0 0 60 24">
          <path d="M5 5 Q30 22 55 5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (m === "crying") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-6">
          <div className="h-9 w-9 rounded-full bg-white/80" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />
          <div className="h-9 w-9 rounded-full bg-white/80" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />
        </div>
        <div className="flex gap-8 -mt-1">
          <div className="h-5 w-2 rounded-full bg-[#7ee8ff]/80" style={{ animation: "mood-tear 1.2s ease-in infinite" }} />
          <div className="h-5 w-2 rounded-full bg-[#7ee8ff]/80" style={{ animation: "mood-tear 1.2s ease-in 0.6s infinite" }} />
        </div>
      </div>
    );
  }

  if (m === "excited") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="mood-wide-pulse flex gap-5">
          <div className="h-12 w-10 rounded-2xl bg-white" />
          <div className="h-12 w-10 rounded-2xl bg-white" style={{ animationDelay: "0.1s" }} />
        </div>
        <div className="flex gap-3">
          {[0, 1, 2, 3].map(i => (
            <span key={i} className="text-yellow-300 text-lg font-bold" style={{ animation: `mood-bounce 0.6s ease-in-out ${i * 0.15}s infinite` }}>★</span>
          ))}
        </div>
      </div>
    );
  }

  if (m === "bored") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-6">
          <div className="h-3 w-12 rounded-full bg-white/80" />
          <div className="h-3 w-12 rounded-full bg-white/80" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-2 w-2 rounded-full bg-white/40" style={{ animation: `mood-bounce 1.5s ease-in-out ${i * 0.4}s infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  if (m === "thinking") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-5">
          <div className="h-10 w-9 rounded-xl bg-white" style={{ borderRadius: "12px 12px 8px 8px" }} />
          <div className="h-10 w-9 rounded-xl bg-white" style={{ borderRadius: "12px 12px 8px 8px" }} />
        </div>
        <div className="relative h-10 w-10">
          <span
            className="absolute text-white text-3xl font-bold"
            style={{ animation: "mood-bounce 1s ease-in-out infinite", left: "50%", transform: "translateX(-50%)" }}
          >
            ?
          </span>
        </div>
      </div>
    );
  }

  if (m === "stressed") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="mood-shake flex gap-5">
          <div className="h-9 w-9 bg-white" style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)" }} />
          <div className="h-9 w-9 bg-white" style={{ clipPath: "polygon(0 0, 100% 40%, 100% 100%, 0 100%)" }} />
        </div>
        <div className="flex gap-4">
          <div className="mood-pulse-red h-3 w-3 rounded-full bg-red-400" />
          <div className="mood-pulse-red h-3 w-3 rounded-full bg-red-400" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>
    );
  }

  if (m === "chill") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1 items-center">
          <div className="h-8 w-12 rounded-xl border-2 border-white/60 bg-white/10" />
          <div className="h-1 w-4 bg-white/40" />
          <div className="h-8 w-12 rounded-xl border-2 border-white/60 bg-white/10" />
        </div>
        <div className="flex gap-4">
          <span className="text-green-400 text-lg" style={{ animation: "mood-note-float 2s ease-out infinite" }}>♪</span>
          <span className="text-green-400 text-lg" style={{ animation: "mood-note-float 2s ease-out 1s infinite" }}>♫</span>
        </div>
      </div>
    );
  }

  // fallback
  return (
    <div className="flex gap-5">
      <div className="mood-blink h-10 w-10 rounded-full bg-white/60" />
      <div className="mood-blink h-10 w-10 rounded-full bg-white/60" style={{ animationDelay: "0.3s" }} />
    </div>
  );
}

const MOOD_COLORS = {
  sleeping:  "bg-indigo-900/60 border-indigo-400/30",
  happy:     "bg-yellow-900/60 border-yellow-400/30",
  crying:    "bg-blue-900/60 border-blue-400/30",
  excited:   "bg-amber-900/60 border-amber-400/30",
  bored:     "bg-zinc-800/60 border-zinc-400/20",
  thinking:  "bg-violet-900/60 border-violet-400/30",
  stressed:  "bg-red-900/60 border-red-400/30",
  chill:     "bg-green-900/60 border-green-400/30",
};

const MOOD_LABELS = {
  sleeping:  "Sleeping",
  happy:     "Happy",
  crying:    "Crying",
  excited:   "Excited",
  bored:     "Bored",
  thinking:  "Thinking",
  stressed:  "Stressed",
  chill:     "Chill",
};

export function DeskBuddyPage() {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDevice = useCallback(async () => {
    try {
      const status = await client.getDeviceStatus(DEVICE_ID);
      setDevice(status);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load device data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevice();
    const timer = setInterval(fetchDevice, POLL_MS);
    return () => clearInterval(timer);
  }, [fetchDevice]);

  if (loading) return <p className="text-white/60">Loading DeskBuddy...</p>;

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">Device</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">DeskBuddy Status</h2>
        </div>
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
        <button
          onClick={fetchDevice}
          className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white hover:text-black transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">Device</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">DeskBuddy Status</h2>
        </div>
        <p className="text-white/60">No device found at ID {DEVICE_ID}. Ensure the ESP32 has sent a heartbeat.</p>
      </div>
    );
  }

  const moodKey = (device.mood || "").toLowerCase();
  const moodColor = MOOD_COLORS[moodKey] || "bg-white/[0.06] border-white/10";
  const moodLabel = MOOD_LABELS[moodKey] || device.mood || "–";

  const lastUpdateLabel = device.minutesSinceLastSeen != null
    ? device.minutesSinceLastSeen === 0
      ? "Just now"
      : `${device.minutesSinceLastSeen} min ago`
    : "–";

  const lastSeenFormatted = device.lastSeen
    ? new Date(device.lastSeen).toLocaleTimeString()
    : "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-white/35">Device</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">DeskBuddy Status</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-medium">{device.name || `Device ${DEVICE_ID}`}</p>
                <p className="mt-2 text-white/45">Last seen: {lastSeenFormatted} ({lastUpdateLabel})</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={device.isOnline ? "bg-green-400 text-black" : "bg-red-400 text-white"}>
                  {device.isOnline ? "Online" : "Offline"}
                </Badge>
                <button
                  onClick={fetchDevice}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white hover:text-black transition"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricPill label="Battery" value={`${device.batteryLevel}%`} />
              <MetricPill label="Mood" value={moodLabel} />
              <MetricPill label="Last Update" value={lastUpdateLabel} />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6">
              <p className="text-lg font-medium">Quick summary</p>
              <p className="mt-3 text-white/55 leading-relaxed">
                {device.isOnline
                  ? `DeskBuddy is online. Battery at ${device.batteryLevel}%, mood: ${moodLabel}. Last heartbeat received ${lastUpdateLabel}.`
                  : `DeskBuddy is offline. Last seen ${device.minutesSinceLastSeen ?? "?"} minutes ago.`}
              </p>
            </div>

            <p className="text-xs text-white/30">
              Polling every 30 seconds • Device ID: {DEVICE_ID}
            </p>
          </CardContent>
        </Card>

        {/* Mood Preview — animated */}
        <Card className={`border ${moodColor} transition-all duration-700`}>
          <CardContent className="p-6 flex flex-col h-full min-h-[320px]">
            <div>
              <p className="text-2xl font-medium text-white">Mood Preview</p>
              <p className="mt-2 text-sm text-white/50">Live from device</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 mt-4">
              <MoodAnimation mood={device.mood} />
              <p className="text-xl font-semibold tracking-wide text-white capitalize">{moodLabel}</p>
            </div>

            {/* All possible moods */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs text-white/30 mb-2">Moods</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(MOOD_LABELS).map(([key, label]) => (
                  <span
                    key={key}
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      key === moodKey
                        ? "bg-white text-black font-semibold"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
