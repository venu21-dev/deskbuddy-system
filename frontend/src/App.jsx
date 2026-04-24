import { useState } from "react";
import { Shell } from "./components/layout/Shell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DeskBuddyPage } from "./pages/DeskBuddyPage";
import { CalendarPage } from "./pages/CalendarPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
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
