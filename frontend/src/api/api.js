const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: async (username, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(res);
    localStorage.setItem("token", data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getDeviceStatus: async (id) => {
    const res = await fetch(`${BASE}/devices/${id}/status`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  getDevices: async () => {
    const res = await fetch(`${BASE}/devices`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  getNowNext: async () => {
    const res = await fetch(`${BASE}/nownext`, {
      headers: { "X-Api-Key": "deskbuddy-device-key-2024" },
    });
    return handleResponse(res);
  },
};
