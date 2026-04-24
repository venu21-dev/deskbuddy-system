import { Cpu } from "lucide-react";
import { Input } from "../components/ui/input";

const NAV_ITEMS = ["General", "API & Backend", "Calendar", "Device", "Notifications", "Security"];

const SYSTEM_OPTIONS = [
  ["Auto sync calendar", "Enabled"],
  ["Device heartbeat check", "Every 30 sec"],
  ["Low battery warning", "Below 20%"],
  ["JWT admin login", "Enabled"],
];

const THEMES = [
  { title: "System dark", active: true },
  { title: "Light", active: false },
  { title: "Auto", active: false },
];

const CALENDAR_MODES = [
  { title: "Now / Next", active: true },
  { title: "Today list", active: false },
  { title: "Next only", active: false },
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">Settings</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">System Settings</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white hover:text-black transition">
            Cancel
          </button>
          <button className="rounded-2xl bg-white px-4 py-2 text-sm text-black hover:bg-[#d9dfd2] transition">
            Save changes
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#070808] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[680px]">
          <aside className="border-r border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-base font-semibold text-white">DeskBuddy</p>
                <p className="mt-1 text-sm text-white/45">System configuration</p>
              </div>
              <nav className="mt-6 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                  <button
                    key={item}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      index === 0
                        ? "bg-white/10 text-white"
                        : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-white/45">Admin</p>
              <p className="mt-1 font-medium text-white">DeskBuddy Admin</p>
              <p className="mt-1 text-xs text-white/40">Local dashboard access</p>
            </div>
          </aside>

          <div className="p-6 md:p-8 space-y-8">
            {/* System name */}
            <div className="border-b border-white/10 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div>
                  <p className="text-sm font-medium text-white">System name</p>
                  <p className="mt-1 text-sm text-white/45">This name is shown in the dashboard.</p>
                </div>
                <div className="space-y-3">
                  <Input value="DeskBuddy System" readOnly />
                  <Input value="deskbuddy.local/dashboard" readOnly />
                </div>
              </div>
            </div>

            {/* ESP32 device */}
            <div className="border-b border-white/10 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div>
                  <p className="text-sm font-medium text-white">ESP32 device</p>
                  <p className="mt-1 text-sm text-white/45">Main device identity and connection target.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="h-20 w-20 rounded-[24px] border border-white/10 bg-white/[0.03] flex items-center justify-center">
                    <Cpu className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value="DeskBuddy-01" readOnly />
                    <Input value="192.168.1.40" readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className="border-b border-white/10 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div>
                  <p className="text-sm font-medium text-white">Dashboard theme</p>
                  <p className="mt-1 text-sm text-white/45">Choose the visual style of the admin dashboard.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {THEMES.map((theme) => (
                    <div
                      key={theme.title}
                      className={`rounded-[24px] border p-3 ${
                        theme.active ? "border-white bg-white/[0.05]" : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="h-28 rounded-[18px] border border-white/10 bg-[#0f1011] p-3">
                        <div className="h-2 w-16 rounded-full bg-white/20" />
                        <div className="mt-4 space-y-2">
                          <div className="h-2 w-full rounded-full bg-white/10" />
                          <div className="h-2 w-4/5 rounded-full bg-white/10" />
                          <div className="h-10 rounded-xl bg-white/5 mt-3" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-white/80">{theme.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar mode */}
            <div className="border-b border-white/10 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div>
                  <p className="text-sm font-medium text-white">Calendar mode</p>
                  <p className="mt-1 text-sm text-white/45">How events are processed for the device display.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CALENDAR_MODES.map((mode) => (
                    <div
                      key={mode.title}
                      className={`rounded-[24px] border p-4 ${
                        mode.active ? "border-white bg-white/[0.05]" : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="h-24 rounded-[18px] border border-white/10 bg-white/[0.03] p-3 flex flex-col justify-between">
                        <div className="h-2 w-20 rounded-full bg-white/20" />
                        <div className="space-y-2">
                          <div className="h-8 rounded-xl bg-white/10" />
                          <div className="h-6 rounded-xl bg-white/5" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-white/80">{mode.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System options */}
            <div className="pb-2">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div>
                  <p className="text-sm font-medium text-white">System options</p>
                  <p className="mt-1 text-sm text-white/45">Useful settings for your PRG3 project.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYSTEM_OPTIONS.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white">{label}</p>
                        <p className="mt-1 text-xs text-white/40">Current setting</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white hover:text-black transition">
                Cancel
              </button>
              <button className="rounded-2xl bg-white px-4 py-2 text-sm text-black hover:bg-[#d9dfd2] transition">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
