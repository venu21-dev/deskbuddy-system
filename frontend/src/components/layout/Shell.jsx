import { Bell, ChevronDown, Cpu, LogOut } from "lucide-react";
import { Button } from "../ui/button";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "deskbuddy", label: "DeskBuddy" },
  { key: "calendar", label: "Calendar" },
  { key: "settings", label: "Settings" },
];

export function Shell({ children, currentPage, onNavigate, onLogout, user }) {
  return (
    <div className="min-h-screen bg-[#cfd4cd] p-4 md:p-8 text-white">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-[#0b0c0d] shadow-2xl overflow-hidden">
        <header className="border-b border-white/10 px-6 md:px-8 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/50">System</p>
                  <h1 className="text-lg font-semibold tracking-wide">DeskBuddy</h1>
                </div>
              </div>

              <nav className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 overflow-x-auto">
                {NAV_ITEMS.map((item) => {
                  const active = currentPage === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onNavigate(item.key)}
                      className={`rounded-xl px-4 py-2 text-sm transition whitespace-nowrap ${
                        active
                          ? "bg-white text-black"
                          : "text-white/65 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/70 hover:text-white transition">
                <Bell className="h-4 w-4" />
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-white/45">Account</p>
                  <p className="text-sm text-white/90">{user?.name || "Admin"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-white/60" />
              </div>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
