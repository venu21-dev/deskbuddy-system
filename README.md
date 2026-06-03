# DeskBuddy System

A school project for PROG3 and ADP — a full-stack desk assistant that connects a physical ESP32 device with a web dashboard and Google Calendar.

---

## Description

DeskBuddy reduces calendar overload by showing only what matters right now: the current and next meeting. Events are fetched from Google Calendar into a local backend, displayed on a physical ESP32 desk device and accessible through a React admin dashboard. Device status (battery, online/offline, mood, mode) is tracked centrally via the backend.

---

## Purpose

- Focus on the essential: show only the current ("Now") and next ("Next") calendar event
- ESP32 device sits on the desk and updates its display every 60 seconds
- React dashboard gives the admin an overview of device status, calendar and system health
- Backend acts as the central hub: Google Calendar sync, device management, API for all clients

---

## Architecture

```
ESP32 Device  ──(X-Api-Key)──┐
                              ├──► ASP.NET Core Web API ──► SQLite DB
React Dashboard ──(JWT)──────┘          │
                                        └──► Google Calendar API (OAuth2)
```

| Communication | Protocol |
|---|---|
| ESP32 ↔ Backend | HTTP/JSON, `X-Api-Key` header |
| React ↔ Backend | HTTP/JSON, `Authorization: Bearer {JWT}` |
| Backend ↔ Google | OAuth2, read-only |

See [docs/architecture.md](docs/architecture.md) and [docs/sequence-calendar.md](docs/sequence-calendar.md) for detailed diagrams.

---

## Features

### Backend
- ASP.NET Core 8 Web API with Swagger/OpenAPI
- EF Core 8 + SQLite with migrations
- CRUD for `Device` and `CalendarEvent` (5 endpoints each)
- DTO layer — 10 DTOs, internal fields never exposed in responses
- Validation with field-specific error messages (400)
- JWT authentication for admin/dashboard access
- API key authentication for ESP32 device (`X-Api-Key` header)
- BCrypt password hashing
- Heartbeat endpoint — device updates battery, mood, mode and online status
- Device status endpoint with online/offline calculation and minutes since last seen
- Google Calendar sync — full replace pattern, supports primary + subscribed calendars
- Automatic background sync every 5 minutes (`CalendarSyncBackgroundService`)
- Now/Next logic — returns current event, next event and today's event count
- Global error handler (500) and automatic admin user creation on startup

### Frontend
- React 19 + Vite + Tailwind CSS, dark theme
- 5 pages: Login, Dashboard, DeskBuddy, Calendar, Settings
- JWT login with error display
- Dashboard: device status, weekly activity chart (real calendar minutes), Now/Next progress card
- DeskBuddy page: 8 mood animations via CSS keyframes (no emojis)
- Calendar page: monthly grid, upcoming events list, manual sync button
- Settings page: system info, device ID, options overview
- 30-second polling on Dashboard and DeskBuddy pages
- Automatic re-login on 401, central API client (`src/api/client.js`)

### ESP32 Device
- Waveshare ESP32-S3-Touch-AMOLED-1.75 (466×466 QSPI display)
- RoboEyes library for animated face display
- WiFi connection via local hotspot
- Fetches `/api/nownext` every 60 seconds and displays current/next event
- Sends heartbeat to `/api/devices/{id}/heartbeat` every 30 seconds
- Heartbeat payload: `{ batteryLevel: 100, mood: "...", mode: "face/calendar" }`
- Touch gesture switches between Face mode and Calendar mode
- Device code is stored locally — folder is git-ignored for security

### Testing
- 13 xUnit unit tests — `NowNextCalculator` pure logic (FindNow, FindNext, IsDeviceOnline)
- 7 xUnit integration tests — full API via `WebApplicationFactory`, in-memory SQLite
- 20 automated tests total, all passing (`dotnet test`)
- 25 Postman requests / 42 test assertions — covers all endpoints with auth
- 12 manual frontend test cases
- 7 manual ESP32 device test cases
- 4 manual end-to-end scenarios
- Testing concept: [docs/testing-konzept.md](docs/testing-konzept.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core Web API (.NET 8) |
| Database | SQLite + Entity Framework Core 8 |
| Auth | JWT Bearer (admin), API Key header (device) |
| Password | BCrypt.Net |
| Calendar | Google Calendar API v3 (OAuth2, read-only) |
| Frontend | React 19 + Vite + Tailwind CSS |
| Device | ESP32-S3-Touch-AMOLED-1.75 (RoboEyes) |
| Unit Tests | xUnit 2.9.0 |
| Integration Tests | ASP.NET Core `WebApplicationFactory` |
| API Tests | Postman |
| Planning | Notion (Sprint board), GitHub |

---

## Project Structure

```
deskbuddy-system/
├── backend/
│   └── DeskBuddy.Api/
│       ├── Controllers/       # 6 controllers, 18 endpoints
│       ├── Services/          # 7 services + NowNextCalculator
│       ├── Data/              # EF Core AppDbContext
│       ├── Models/            # Device, CalendarEvent, User
│       ├── DTOs/              # 10 request/response DTOs
│       ├── Filters/           # ApiKeyAuthFilter, ApiKeyAuthAttribute
│       ├── Migrations/        # 2 EF Core migrations
│       └── Secrets/           # OAuth credentials (git-ignored)
├── frontend/
│   └── src/
│       ├── pages/             # LoginPage, DashboardPage, DeskBuddyPage, CalendarPage, SettingsPage
│       ├── components/        # Shell layout + UI components
│       └── api/client.js      # Central API client with auth handling
├── device/                    # ESP32 firmware — git-ignored (contains WiFi/API credentials)
├── tests/
│   ├── DeskBuddy.Tests/       # xUnit unit + integration tests
│   └── DeskBuddy.postman_collection.json
└── docs/
    ├── architecture.md
    ├── sequence-calendar.md
    ├── testing-konzept.md
    └── presentation-context.md
```

---

## Running Locally

### Backend

**Requirements:** .NET 8 SDK, Google OAuth credentials

```bash
cd backend/DeskBuddy.Api
dotnet run
```

Swagger UI: `http://localhost:5294/swagger`  

### Frontend

**Requirements:** Node.js 18+

```bash
cd frontend
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

### Tests

> Stop the backend before running tests — the build step cannot overwrite the DLL while it is in use.

```bash
cd tests/DeskBuddy.Tests
dotnet test
```

Expected output: `20 tests passed, 0 failed`

### Google Calendar Setup

1. Place your OAuth2 credentials JSON in `backend/DeskBuddy.Api/Secrets/`
2. Set the path in `appsettings.json` under `GoogleCalendar:CredentialsPath`
3. On first run, a browser window opens for Google login (one-time)
4. Call `POST /api/googlecalendar/sync` to load events into the local DB
5. To include a subscribed calendar, add its ID to `GoogleCalendar:ExtraCalendarIds`

### ESP32 Device

The firmware is stored in the local `device/` folder (git-ignored for security — it contains the WiFi password and API key). To run on a new device:

1. Open the `.ino` file in Arduino IDE
2. Set `WIFI_SSID`, `WIFI_PASSWORD`, `API_HOST` and `API_KEY`
3. Set `DEVICE_ID` to match the device ID registered in the backend
4. Flash to the ESP32-S3-Touch-AMOLED-1.75

---

## Key API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/login` | — | Login, returns JWT token |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/devices` | JWT | List all devices |
| POST | `/api/devices` | JWT | Create device |
| PUT | `/api/devices/{id}` | JWT | Update device |
| DELETE | `/api/devices/{id}` | JWT | Delete device |
| GET | `/api/devices/{id}/status` | JWT | Detailed device status |
| POST | `/api/devices/{id}/heartbeat` | X-Api-Key | Device heartbeat update |
| GET | `/api/calendarevents` | JWT | List stored events |
| POST | `/api/calendarevents` | JWT | Create event manually |
| PUT | `/api/calendarevents/{id}` | JWT | Update event |
| DELETE | `/api/calendarevents/{id}` | JWT | Delete event |
| GET | `/api/googlecalendar/events` | JWT | Fetch events from Google |
| POST | `/api/googlecalendar/sync` | JWT | Sync Google → local DB |
| GET | `/api/nownext` | X-Api-Key | Current + next event for ESP32 |

---

## Testing

| Type | Count | Tool | Status |
|---|---|---|---|
| Unit Tests | 13 | xUnit | ✅ All passing |
| Integration Tests | 7 | xUnit + WebApplicationFactory | ✅ All passing |
| API Tests | 25 requests / 42 assertions | Postman | Durchgeführt |
| Frontend Tests | 12 test cases | Manual (Chrome) | Manuell geprüft |
| Device Tests | 7 test cases | Manual (Serial Monitor) | Manuell geprüft |
| End-to-End | 4 scenarios | Manual | Manuell geprüft |

Test evidence screenshots are stored under `docs/testing/`.

Full testing concept: [docs/testing-konzept.md](docs/testing-konzept.md)

---

## Documentation

| File | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System architecture diagram |
| [docs/sequence-calendar.md](docs/sequence-calendar.md) | Google Calendar sync and Now/Next sequence diagrams |
| [docs/testing-konzept.md](docs/testing-konzept.md) | Full testing concept (German) |
| [docs/presentation-context.md](docs/presentation-context.md) | Presentation outline, feature list, demo plan |

---

## Security

- Google OAuth credentials are stored in `Secrets/` — this folder is **git-ignored**
- The `device/` folder is **git-ignored** — it contains WiFi password and API key
- JWT is used for all admin/dashboard endpoints (8h expiry)
- API key (`X-Api-Key` header) is used for ESP32 device endpoints
- Passwords are hashed with BCrypt
- DTOs ensure internal fields (e.g. device API key) are never returned in responses

---

## Project Status

### Implemented
- ASP.NET Core Web API with Swagger
- EF Core + SQLite with 2 migrations
- Full CRUD for `Device` and `CalendarEvent`
- DTO layer with validation and error handling
- JWT authentication (admin) + API key authentication (device)
- Google Calendar API integration (OAuth2, read-only, multi-calendar)
- Automatic background sync every 5 minutes
- Now/Next calculation (`NowNextCalculator` — isolated, testable)
- React dashboard (5 pages, dark theme, 30s polling, mood animations)
- ESP32 device client (heartbeat, Now/Next display, touch mode switch)
- xUnit unit tests (13) and integration tests (7)
- Postman collection (25 requests, 42 assertions)
- Architecture, sequence and testing documentation

### Limitations
- Runs locally only — no cloud deployment or CI/CD
- `DEVICE_ID` is hardcoded in the frontend (`src/api/client.js`)
- Admin credentials are in `appsettings.json` (development setup, not production-ready)
- Google OAuth token requires one-time manual browser login; no auto-refresh UI
- No automated frontend tests (Jest/React Testing Library not implemented)
- ESP32 firmware is not in the repository (git-ignored for credential security)

---

## School Context

This project was created for:

- **PROG3** — technical implementation: architecture, backend, frontend, testing, CRUD, DTOs, authentication
- **ADP** — agile development: Notion sprint board (Sprints 0–6, 82 tasks / 100% done), acceptance criteria per task, GitHub commits linked to tasks, progress visualization, sprint reviews
