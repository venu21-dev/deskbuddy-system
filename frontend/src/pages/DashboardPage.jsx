import { useEffect, useState } from "react";
import { Clock3, Monitor } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { fakeApi } from "../api/fakeApi";

function TinyBars() {
  const heights = [28, 44, 35, 60, 52, 40, 74, 68, 54, 62, 46, 70];
  return (
    <div className="flex items-end gap-2 h-24 mt-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-2 rounded-full ${i > 7 ? "bg-white" : "bg-white/12"}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fakeApi.getDashboard().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-white/60">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">Overview</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">DeskBuddy Dashboard</h2>
        </div>
        <div className="flex flex-col items-start xl:items-end">
          <div className="flex items-center gap-3 text-white/90">
            <Clock3 className="h-5 w-5 text-white/50" />
            <span className="text-4xl font-light">11:37 AM</span>
          </div>
          <p className="mt-2 text-xl text-white/70">9 September</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Device Overview */}
        <Card className="xl:col-span-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-medium">Device Overview</p>
                <p className="mt-2 text-sm text-white/45">Real-time device data from your ESP32</p>
              </div>
              <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white hover:text-black transition">
                Live data
              </button>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-white/45">Battery</p>
                <TinyBars />
                <p className="mt-4 text-5xl font-light">{data.battery}%</p>
                <p className="text-sm text-white/40">Current battery status from device</p>
              </div>
              <div>
                <p className="text-sm text-white/45">Status</p>
                <TinyBars />
                <p className="mt-4 text-5xl font-light">Online</p>
                <p className="text-sm text-white/40">API + device connectivity</p>
              </div>
              <div>
                <p className="text-sm text-white/45">Mood</p>
                <TinyBars />
                <p className="mt-4 text-5xl font-light">{data.mood}</p>
                <p className="text-sm text-white/40">Mood sent from ESP32</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection */}
        <Card className="xl:col-span-3 overflow-hidden relative">
          <CardContent className="p-6 h-full flex flex-col justify-between min-h-[330px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-medium">Connection</p>
                <p className="mt-2 text-sm text-white/45">Backend ↔ ESP32 communication</p>
              </div>
              <div className="h-7 w-12 rounded-full bg-[#d9dfd2] p-1 flex items-center justify-end">
                <div className="h-5 w-5 rounded-full bg-[#0b0c0d]" />
              </div>
            </div>
            <div className="my-6 flex-1 rounded-[24px] border border-[#93ff7a]/10 bg-[radial-gradient(circle_at_center,rgba(152,255,152,0.18),transparent_65%)] flex items-center justify-center">
              <div className="h-40 w-40 rounded-[28px] border border-white/10 bg-white/[0.03] flex items-center justify-center">
                <Monitor className="h-16 w-16 text-[#dce7d7]" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/45">API Health</p>
                <p className="mt-2 text-3xl font-light">83%</p>
              </div>
              <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[83%] bg-[#d9dfd2] rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card className="xl:col-span-3">
          <CardContent className="p-6 min-h-[330px] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-medium">System Actions</p>
                <p className="mt-2 text-sm text-white/45">Quick actions for your system</p>
              </div>
              <span className="text-white/50">•••</span>
            </div>
            <div className="mt-8 rounded-[24px] bg-[#d9dfd2] p-5 text-black">
              <p className="text-base font-medium">System is running stable.</p>
              <p className="mt-2 text-sm text-black/65">Battery is stable and the current event sync looks healthy.</p>
              <p className="mt-4 text-xs text-black/45">Today recommendation</p>
            </div>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
              <p className="text-base font-medium">Manual Sync Calendar</p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                <span>Action</span>
                <span>5 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battery Usage */}
        <Card className="xl:col-span-2 bg-[#d9dfd2] text-black border-none">
          <CardContent className="p-6 min-h-[220px] flex flex-col justify-between">
            <div>
              <p className="text-2xl font-medium">Battery Usage</p>
              <p className="mt-2 text-sm text-black/55">Battery drain tracking</p>
            </div>
            <div>
              <p className="text-6xl font-light">5.7</p>
              <p className="text-sm text-black/50">avg battery usage / hour</p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="xl:col-span-4">
          <CardContent className="p-6 min-h-[220px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-medium">Weekly Activity</p>
                <p className="mt-2 text-sm text-white/45">Device + calendar activity</p>
              </div>
              <button className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70">Week</button>
            </div>
            <div className="mt-10 grid grid-cols-7 gap-3 text-center">
              {[["Mon", 276], ["Tue", 282], ["Wed", 297], ["Thu", 269], ["Fri", 274], ["Sat", 175], ["Sun", 138]].map(
                ([day, value], index) => (
                  <div key={day} className="space-y-3">
                    <p className="text-xs text-white/35">{day}</p>
                    <div className="h-12 rounded-md bg-white/5 relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 left-0 right-0 ${index === 2 ? "bg-[#d9dfd2]" : "bg-white/20"}`}
                        style={{ height: `${20 + (Number(value) / 300) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/55">{value} pts</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Now / Next */}
        <Card className="xl:col-span-6 bg-[#d9dfd2] text-black border-none">
          <CardContent className="p-6 min-h-[220px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-medium">Now / Next Event</p>
                <p className="mt-2 text-sm text-black/55">Current calendar processing</p>
              </div>
              <button className="rounded-full border border-black/15 px-4 py-2 text-sm text-black/80">Change</button>
            </div>
            <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-sm text-black/55">Current Event Progress</p>
                <p className="mt-2 text-6xl font-light">47%</p>
                <p className="text-sm text-black/50">11AM — 3PM</p>
              </div>
              <div className="flex-1">
                <div className="relative h-16 flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-black/20" />
                  {["11AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM"].map((time, index) => (
                    <div key={index} className="relative flex flex-col items-center gap-3">
                      <div className={`h-6 w-6 rounded-full border ${index > 0 && index < 6 ? "bg-black border-black" : "bg-transparent border-black/35"}`} />
                      <span className="text-xs text-black/55">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
