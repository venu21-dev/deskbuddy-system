import { useState, useEffect } from "react";
import { client } from "./api/client";
import { Shell } from "./components/layout/Shell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DeskBuddyPage } from "./pages/DeskBuddyPage";
import { CalendarPage } from "./pages/CalendarPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [autoLogging, setAutoLogging] = useState(true);

  // Auto-login on startup: if a token already exists in localStorage, use it.
  // Otherwise try to log in with hardcoded admin credentials.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // We already have a token — treat as logged in
      setUser({ name: "Admin" });
      setAutoLogging(false);
      return;
    }

    client.ensureLoggedIn()
      .then((data) => {
        if (data) {
          setUser({ name: data.username || "Admin" });
        }
      })
      .catch(() => {
        // Auto-login failed — fall through to manual login page
      })
      .finally(() => {
        setAutoLogging(false);
      });
  }, []);

  const handleLogin = (result) => {
    setUser({ name: result?.username || result?.name || "Admin" });
  };

  const handleLogout = () => {
    client.logout();
    setUser(null);
    setCurrentPage("dashboard");
  };

  // While we're attempting auto-login, show a minimal loading screen
  if (autoLogging) {
    return (
      <div className="min-h-screen bg-[#cfd4cd] flex items-center justify-center">
        <p className="text-[#0b0c0d] text-lg font-medium">Connecting to DeskBuddy...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Shell
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      user={user}
    >
      {currentPage === "dashboard" && <DashboardPage />}
      {currentPage === "deskbuddy" && <DeskBuddyPage />}
      {currentPage === "calendar" && <CalendarPage />}
      {currentPage === "settings" && <SettingsPage />}
    </Shell>
  );
}
