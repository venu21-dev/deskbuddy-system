# Sequence Diagram – Google Calendar Integration

## Sync Flow (Google Calendar → Local DB)

```mermaid
sequenceDiagram
    actor Admin
    participant API as ASP.NET Core API
    participant GCal as Google Calendar API
    participant DB as SQLite DB

    Admin->>API: POST /api/googlecalendar/sync
    API->>GCal: Request events (OAuth2, next 7 days)
    GCal-->>API: Return event list
    API->>DB: Save new events (skip duplicates)
    API-->>Admin: 200 OK { message: "Sync completed" }
```

## Now/Next Flow (Device / Dashboard)

```mermaid
sequenceDiagram
    actor Client as ESP32 / Dashboard
    participant API as ASP.NET Core API
    participant DB as SQLite DB

    Client->>API: GET /api/nownext
    API->>DB: Query events (EndTime > now)
    DB-->>API: Return event list
    API->>API: Find Now (StartTime <= now < EndTime)
    API->>API: Find Next (first StartTime > now)
    API-->>Client: 200 OK { now: {...}, next: {...} }
```

## Notes

- Sync must be triggered before Now/Next returns real data
- Token is cached locally after first OAuth login
- Now or Next can be null if no matching event exists
