import { useEffect, useState } from "react";
import { Smile } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../api/api";

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 min-w-[140px]">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export function DeskBuddyPage() {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDevices()
      .then((devices) => {
        if (devices.length > 0) {
          return api.getDeviceStatus(devices[0].id);
        }
        return null;
      })
      .then((status) => {
        setDevice(status);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-white/60">Loading DeskBuddy...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!device) return <p className="text-white/60">No device found. Create one first.</p>;

  const lastSeenFormatted = new Date(device.lastSeen).toLocaleTimeString();

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
                <p className="text-3xl font-medium">{device.name}</p>
                <p className="mt-2 text-white/45">
                  Last seen: {lastSeenFormatted} ({device.minutesSinceLastSeen} min ago)
                </p>
              </div>
              <Badge className={device.isOnline ? "bg-green-400 text-black" : "bg-red-400 text-white"}>
                {device.statusText}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <MetricPill label="Battery" value={`${device.batteryLevel}%`} />
              <MetricPill label="Mood" value={device.mood} />
              <MetricPill label="Mode" value={device.mode} />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6">
              <p className="text-lg font-medium">Quick summary</p>
              <p className="mt-3 text-white/55 leading-relaxed">
                {device.isOnline
                  ? `DeskBuddy is online. Battery at ${device.batteryLevel}%, mood: ${device.mood}.`
                  : `DeskBuddy is offline. Last seen ${device.minutesSinceLastSeen} minutes ago.`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#d9dfd2] text-black border-none">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-[320px]">
            <div>
              <p className="text-2xl font-medium">Mood preview</p>
              <p className="mt-2 text-sm text-black/55">Current mood from device</p>
            </div>
            <div className="mx-auto h-44 w-44 rounded-full bg-black text-white flex flex-col items-center justify-center shadow-inner">
              <Smile className="h-12 w-12" />
              <p className="mt-3 text-lg">{device.mood}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
