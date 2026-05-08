import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { api } from "../api/api";

export function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.login(username, password);
      onLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#cfd4cd] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b0c0d] p-8 text-white shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-white/35">DeskBuddy</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Admin Login</h2>
          <p className="mt-3 text-white/50">Simple login screen for your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-white/70">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-2"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={loading} className="h-12 w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
