# DeskBuddy System

A school project (PRG3) — a backend system that fetches Google Calendar events and provides them via REST API for a web dashboard and an ESP32 desk device.

---

## Purpose

DeskBuddy shows the current and next calendar event ("Now / Next") on a physical desk device and in a web admin dashboard. Device status (battery, online/offline, mood, mode) is managed centrally via the backend.

---

## Architecture

```
ESP32 Device  ──┐
                ├──► ASP.NET Core Web API ──► SQLite DB
React Dashboard─┘          │
                            └──► Google Calendar API
```

See [docs/architecture.md](docs/architecture.md) and [docs/sequence-calendar.md](docs/sequence-calendar.md) for detailed diagrams.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core Web API (.NET 8) |
| Database | SQLite + Entity Framework Core 8 |
| Calendar | Google Calendar API v3 (OAuth2) |
| Frontend | React *(planned)* |
| Device | ESP32-S3 *(planned)* |
| API Testing | Postman |

---

## Project Structure

```
deskbuddy-system/
├── backend/
│   └── DeskBuddy.Api/
│       ├── Controllers/       # API endpoints
│       ├── Services/          # Business logic
│       ├── Data/              # EF Core DbContext
│       ├── Models/            # Database entities
│       ├── DTOs/              # Data transfer objects
│       ├── Migrations/        # EF Core migrations
│       └── Secrets/           # OAuth credentials (git-ignored)
├── docs/                      # Architecture & sequence diagrams
├── tests/                     # Postman collection
└── frontend/                  # React dashboard (planned)
```

---

## Implementation Status

### ✅ Done
- ASP.NET Core Web API with Swagger
- EF Core + SQLite with migrations
- CRUD endpoints for `Device` and `CalendarEvent`
- DTO layer with validation and error handling
- Google Calendar API integration (OAuth2, read-only)
- Now/Next logic — detects current and next calendar event
- Postman test collection (15 requests, 24 tests — all passing)
- Architecture and sequence diagrams

### 🔜 Planned
- React admin dashboard with login
- JWT authentication for admin
- API key authentication for ESP32
- ESP32 device client
- Automated unit/integration tests
- Auto-sync of Google Calendar on a schedule

---

## Running the Backend

**Requirements:** .NET 8 SDK, Google OAuth credentials

```bash
cd backend/DeskBuddy.Api
dotnet run
```

Swagger UI: `http://localhost:5294/swagger`

**Google Calendar Setup:**
1. Place your OAuth credentials JSON in `backend/DeskBuddy.Api/Secrets/`
2. Update the path in `appsettings.json` under `GoogleCalendar:CredentialsPath`
3. Call `POST /api/googlecalendar/sync` to fetch and store events
4. Call `GET /api/nownext` to get the current and next event

---

## Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/devices` | List all devices |
| POST | `/api/devices` | Create device |
| PUT | `/api/devices/{id}` | Update device |
| DELETE | `/api/devices/{id}` | Delete device |
| GET | `/api/calendarevents` | List stored events |
| POST | `/api/googlecalendar/sync` | Sync from Google Calendar |
| GET | `/api/nownext` | Get current and next event |

---

## Notes

- The `Secrets/` folder is git-ignored — credentials are never committed
- The ESP32 device and React frontend are part of the full project scope but not yet implemented
- Google Calendar integration is read-only for now
