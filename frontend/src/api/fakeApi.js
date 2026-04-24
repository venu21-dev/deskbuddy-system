function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fakeApi = {
  login: async (username, password) => {
    await wait(400);
    if (username === "admin" && password === "admin123") {
      return { token: "fake-jwt-token", user: { name: "Admin" } };
    }
    throw new Error("Invalid username or password");
  },

  getDashboard: async () => {
    await wait(300);
    return {
      status: "Online",
      battery: 82,
      mood: "Focused",
      todayEvents: 4,
      uptime: "99.2%",
      nowEvent: { title: "Project Coaching", time: "11:00 - 11:30" },
      nextEvent: { title: "Lunch Break", time: "12:00 - 13:00" },
    };
  },

  getDeskBuddy: async () => {
    await wait(300);
    return {
      id: 1,
      name: "DeskBuddy-01",
      battery: 82,
      status: "Online",
      mood: "Focused",
      lastSeen: "2 minutes ago",
      firmware: "v1.0.3",
      wifi: "Connected",
    };
  },

  getEvents: async () => {
    await wait(300);
    return [
      { id: 1, title: "Project Coaching", start: "11:00", end: "11:30", type: "Now" },
      { id: 2, title: "Lunch Break", start: "12:00", end: "13:00", type: "Next" },
      { id: 3, title: "Frontend Work", start: "14:00", end: "15:30", type: "Later" },
    ];
  },
};
