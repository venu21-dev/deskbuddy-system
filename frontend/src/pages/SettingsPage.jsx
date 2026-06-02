import { Cpu } from "lucide-react";
import { Input } from "../components/ui/input";

const SYSTEM_OPTIONS = [
  ["Auto sync calendar", "Enabled"],
  ["Device heartbeat check", "Every 30 sec"],
  ["JWT admin login", "Enabled"],
  ["Device ID", "3"],
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">Settings</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">System Settings</h2>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#070808] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[540px]">
          <aside className="border-r border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-base font-semibold text-white">DeskBuddy</p>
                <p className="mt-1 text-sm text-white/45">System configuration</p>
              </div>
              <nav className="mt-6 space-y-1">
                <div className="w-full rounded-xl px-3 py-2.5 text-left text-sm bg-white/10 text-white">
                  General
                </div>
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
                    <Input value="DeskBuddy ESP32" readOnly />
                    <Input value="172.20.10.x (WiFi)" readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* System options */}
            <div className="pb-2">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div>
                  <p className="text-sm font-medium text-white">System options</p>
                  <p className="mt-1 text-sm text-white/45">Active configuration overview.</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
