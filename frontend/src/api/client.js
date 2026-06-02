/**
 * Central API client for DeskBuddy frontend.
 * Uses Vite proxy: /api → http://localhost:5294/api
 */

const API_BASE = "/api";
const DEVICE_ID = 3;
const DEVICE_API_KEY = "deskbuddy-device-key-2024";

function getToken() {
  return localStorage.getItem("token");
}

export function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    // Try auto-relogin with hardcoded admin credentials
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem("token", data.token);
        return null; // Caller should retry
      }
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    window.location.reload();
    return null;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.title || `HTTP ${res.status}`);
  }
  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export const client = {
  /** POST /api/auth/login — stores JWT in localStorage */
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(res);
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  /** Auto-login with hardcoded admin credentials if no token present */
  ensureLoggedIn: async () => {
    if (!getToken()) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        return data;
      }
    }
    return null;
  },

  /** GET /api/Devices */
  getDevices: async () => {
    const res = await fetch(`${API_BASE}/Devices`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** GET /api/Devices/{id} */
  getDevice: async (id = DEVICE_ID) => {
    const res = await fetch(`${API_BASE}/Devices/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** GET /api/Devices/{id}/status → DeviceStatusDetailDto */
  getDeviceStatus: async (id = DEVICE_ID) => {
    const res = await fetch(`${API_BASE}/Devices/${id}/status`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** GET /api/NowNext → NowNextDto
   *  NowNextController uses [ApiKeyAuth] — must send X-Api-Key header.
   */
  getNowNext: async () => {
    const res = await fetch(`${API_BASE}/NowNext`, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": DEVICE_API_KEY,
      },
    });
    return handleResponse(res);
  },

  /** GET /api/CalendarEvents */
  getCalendarEvents: async () => {
    const res = await fetch(`${API_BASE}/CalendarEvents`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** POST /api/GoogleCalendar/sync */
  syncCalendar: async () => {
    const res = await fetch(`${API_BASE}/GoogleCalendar/sync`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** GET /api/Health */
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/Health`);
    return handleResponse(res);
  },
};

export { DEVICE_ID };
