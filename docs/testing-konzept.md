# DeskBuddy – Testing Konzept

**Projekt:** DeskBuddy System (PRG3 / ADP)  
**Autor:** Venurshan Manivannan  
**Version:** 2.3

---

## 1. Testziele

Das Ziel der Tests ist es sicherzustellen, dass das DeskBuddy-System korrekt funktioniert und die definierten Anforderungen erfüllt:

- Die zentrale Business-Logik (Now/Next, Online/Offline) ist korrekt und stabil
- Die REST API liefert korrekte Antworten mit dem richtigen HTTP-Statuscode
- Authentifizierung (JWT und API Key) schützt die Endpoints korrekt
- Der Heartbeat-Mechanismus speichert Gerätedaten (Mood, Status, Battery) korrekt
- Google Calendar Sync aktualisiert die Datenbank vollständig
- Das React-Frontend zeigt Live-Daten aus dem Backend an
- Der ESP32 kommuniziert korrekt mit dem Backend (Heartbeat, NowNext)

---

## 2. Teststrategie

### Gewähltes Modell: Test-Pyramide

```
           /\
          /  \
         / E2E\        ← wenige, manuelle Systemtests (4)
        /------\
       / Integr.\     ← manuelle API-Tests via Postman (15)
      /----------\
     / Manuell   \    ← Frontend + Device, manuell (19)
    /--------------\
   / Unit Tests     \  ← automatisierte xUnit-Tests (13)
  /________________\
```

**Begründung:**

1. **Automatisierte Unit Tests (xUnit)** — zentrale Business-Logik wurde in eine isolierte, datenbankfreie Klasse extrahiert und vollständig automatisiert getestet
2. **Manuelle API-/Integrationstests via Postman** — vollständige API-Abdeckung mit dokumentierten Anfragen und Antworten
3. **Manuelle Frontend-Tests** — alle Seiten und Funktionen wurden manuell im Browser geprüft
4. **Manuelle Device-Tests** — ESP32 wurde mit dem Serial Monitor und echten Netzwerkaufrufen geprüft
5. **Manuelle E2E-Tests** — der gesamte Datenfluss wurde mit realem Gerät verifiziert

---

## 3. Systemübersicht

```
ESP32 Device  ──(X-Api-Key)──► Backend API ──► SQLite DB
                                    │
React Frontend ──(JWT)──────────────┘
                                    │
                              Google Calendar API (OAuth2)
```

| Schicht | Testart | Werkzeug | Anzahl Tests |
|---------|---------|----------|-------------|
| Business-Logik | Automatisierte Unit Tests | xUnit (.NET 8) | 13 |
| Backend API | Manuelle API-/Integrationstests | Postman | 15 |
| Frontend | Manuelle Tests | Browser (Chrome) | 12 |
| ESP32 Device | Manuelle Tests | Serial Monitor + Netzwerk | 7 |
| Gesamtsystem | End-to-End Tests | Manuell | 4 |
| **Total** | | | **51** |

---

## 4. Testplan

### 4.1 Automatisierte Unit Tests (xUnit)

Testprojekt: `tests/DeskBuddy.Tests/`  
Ausführen: `cd tests/DeskBuddy.Tests && dotnet test`

Getestet wird die statische Hilfsklasse `NowNextCalculator` — die zentrale Business-Logik ohne Datenbankabhängigkeit.

| # | Testname | Beschreibung | Erwartetes Ergebnis |
|---|----------|-------------|---------------------|
| UT-01 | `FindNow_WhenNoEvents_ReturnsNull` | Leere Event-Liste | `null` |
| UT-02 | `FindNow_WhenEventIsRunning_ReturnsEvent` | Event läuft gerade | Event wird zurückgegeben |
| UT-03 | `FindNow_WhenEventAlreadyEnded_ReturnsNull` | Event bereits beendet | `null` |
| UT-04 | `FindNow_WhenEventStartsExactlyNow_ReturnsEvent` | Start == now (Grenzfall) | Event gilt als laufend (inklusiv) |
| UT-05 | `FindNow_WhenEventEndsExactlyNow_ReturnsNull` | End == now (Grenzfall) | Event gilt als beendet (exklusiv) |
| UT-06 | `FindNext_WhenFutureEventExists_ReturnsEarliestOne` | Mehrere zukünftige Events | Frühestes Event |
| UT-07 | `FindNext_WhenNoFutureEvents_ReturnsNull` | Keine zukünftigen Events | `null` |
| UT-08 | `FindNext_WithMixedPastAndFutureEvents_IgnoresPastEvents` | Vergangene und zukünftige Events gemischt | Nur zukünftiges Event |
| UT-09 | `FindNext_WithUnorderedFutureEvents_ReturnsEarliestOne` | Unsortierte zukünftige Events | Frühestes Event (unabhängig von Reihenfolge) |
| UT-10 | `IsDeviceOnline_WhenLastSeenRecently_ReturnsTrue` | LastSeen vor 30 Sekunden | `true` |
| UT-11 | `IsDeviceOnline_WhenLastSeenTooLongAgo_ReturnsFalse` | LastSeen vor 5 Minuten (Grenze: 2 Min) | `false` |
| UT-12 | `IsDeviceOnline_WhenLastSeenIsNull_ReturnsFalse` | LastSeen ist `null` | `false` |
| UT-13 | `IsDeviceOnline_WhenLastSeenExactlyAtBoundary_ReturnsFalse` | LastSeen genau an der Grenze (Grenzfall) | `false` (Grenze ist exklusiv) |

---

### 4.2 Manuelle API-/Integrationstests (Postman)

Getestet mit der Postman Collection: `tests/DeskBuddy.postman_collection.json`

| # | Endpoint | Methode | Szenario | Erwartetes Ergebnis |
|---|----------|---------|----------|---------------------|
| IT-01 | `/api/health` | GET | Kein Auth erforderlich | `200 OK` |
| IT-02 | `/api/auth/login` | POST | Gültige Credentials (`admin / admin123`) | `200 OK`, JWT Token im Body |
| IT-03 | `/api/auth/login` | POST | Ungültiges Passwort | `401 Unauthorized` |
| IT-04 | `/api/devices` | GET | Mit gültigem JWT | `200 OK`, Device-Array |
| IT-05 | `/api/devices` | GET | Ohne JWT | `401 Unauthorized` |
| IT-06 | `/api/devices/3` | GET | Mit JWT | `200 OK`, Device-Objekt |
| IT-07 | `/api/devices/3/status` | GET | Mit JWT | `200 OK`, `isOnline`, `mood`, `batteryLevel` |
| IT-08 | `/api/devices/3/heartbeat` | POST | Mit `X-Api-Key`, gültige Payload | `200 OK`, `"Heartbeat received."` |
| IT-09 | `/api/devices/3/heartbeat` | POST | Ohne `X-Api-Key` | `401 Unauthorized` |
| IT-10 | `/api/devices/99/heartbeat` | POST | Unbekannte Device-ID | `404 Not Found` |
| IT-11 | `/api/nownext` | GET | Mit `X-Api-Key` | `200 OK`, `now`, `next`, `todayEventCount` |
| IT-12 | `/api/calendarevents` | GET | Mit JWT | `200 OK`, Event-Liste |
| IT-13 | `/api/googlecalendar/sync` | POST | Mit JWT | `200 OK`, Sync ausgeführt |
| IT-14 | `/api/devices` | POST | Mit JWT, gültiger Body | `201 Created`, neues Device |
| IT-15 | `/api/devices/3` | DELETE | Mit JWT | `204 No Content` |

---

### 4.3 Manuelle Tests – Frontend (React Dashboard)

| # | Seite | Testfall | Erwartetes Ergebnis |
|---|-------|----------|---------------------|
| MT-01 | Login | Korrekte Credentials eingeben | Weiterleitung zum Dashboard, kein Fehler |
| MT-02 | Login | Falsche Credentials eingeben | Fehlermeldung sichtbar |
| MT-03 | Dashboard | Seite laden | Battery, Online-Status und Mood werden angezeigt |
| MT-04 | Dashboard | 30 Sekunden warten | Werte aktualisieren sich automatisch (Polling) |
| MT-05 | Dashboard | Weekly Activity | Balken zeigen echte Kalender-Minuten pro Tag |
| MT-06 | Dashboard | Now/Next Karte | Aktuelles Event mit Fortschrittsanzeige |
| MT-07 | DeskBuddy | Mood Preview | Korrekte Animation passend zur aktuellen Mood |
| MT-08 | DeskBuddy | Refresh Button | Neue Daten werden vom Backend geladen |
| MT-09 | Calendar | Seite laden | Events werden in Liste und Kalender angezeigt |
| MT-10 | Calendar | Manual Sync klicken | Sync-Meldung erscheint, Events aktualisieren sich |
| MT-11 | Calendar | Now/Next Panel | Aktuelles und nächstes Event korrekt |
| MT-12 | Settings | Seite laden | System-Informationen sichtbar, keine Fehler |

---

### 4.4 Manuelle Tests – ESP32 Device

| # | Testfall | Vorgehen | Erwartetes Ergebnis |
|---|----------|----------|---------------------|
| DT-01 | WiFi-Verbindung | ESP32 starten, Serial Monitor öffnen | `WiFi OK: 172.20.x.x` erscheint |
| DT-02 | NowNext-Fetch | Serial Monitor beobachten | `GET /api/nownext -> 200` alle 60s |
| DT-03 | Heartbeat senden | Serial Monitor beobachten | `Heartbeat OK (mood=... mode=...)` alle 30s |
| DT-04 | Mood-Anzeige | Event in Google Calendar anlegen und Sync auslösen | Mood ändert sich auf Display |
| DT-05 | Touch FACE → CALENDAR | Display antippen | Wechsel zur Kalenderansicht |
| DT-06 | Touch CALENDAR → FACE | Display nochmals antippen | Rückkehr zur Gesichtsanimation |
| DT-07 | Heartbeat im Backend | Nach DT-03 im Dashboard prüfen | `lastSeen` aktuell, `isOnline = true` |

---

### 4.5 End-to-End Tests – Gesamter Datenfluss

| # | Testfall | Schritte | Erwartetes Ergebnis |
|---|----------|----------|---------------------|
| E2E-01 | ESP32 → Backend → Frontend | 1. ESP32 läuft und sendet Heartbeat<br>2. Backend empfängt und speichert Daten<br>3. Frontend-Refresh abwarten | Mood und Status im Frontend stimmen mit ESP32 überein |
| E2E-02 | Google Calendar → Backend → ESP32 | 1. Event in Google Calendar anlegen<br>2. `POST /api/googlecalendar/sync` auslösen<br>3. ESP32 fragt `/api/nownext` ab | ESP32 Display zeigt neues Event |
| E2E-03 | Google Calendar → Frontend | 1. Event in Google Calendar ändern<br>2. Sync auslösen<br>3. Calendar-Seite neu laden | Geändertes Event korrekt im Frontend |
| E2E-04 | Offline-Erkennung | 1. ESP32 ausschalten<br>2. 2 Minuten warten<br>3. Dashboard prüfen | Status wechselt zu „Offline" |

---

## 5. Testausführung und Nachweise

```
docs/
└── testing/
    ├── unit-tests/
    ├── postman/
    ├── frontend/
    └── device/
```

### 5.1 Unit Tests (xUnit)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| UT-01 bis UT-13 | Alle 13 Tests, `dotnet test`-Ausgabe | `docs/testing/unit-tests/dotnet-test-result.png` |

### 5.2 API-Tests (Postman)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| IT-01 | Health Check | Nachweis vorgesehen unter `docs/testing/postman/IT-01-health.png` |
| IT-02 | Login erfolgreich | Nachweis vorgesehen unter `docs/testing/postman/login-success.png` |
| IT-03 | Login fehlgeschlagen | Nachweis vorgesehen unter `docs/testing/postman/login-invalid.png` |
| IT-04 | GET Devices | Nachweis vorgesehen unter `docs/testing/postman/get-devices.png` |
| IT-08 | Heartbeat erfolgreich | Nachweis vorgesehen unter `docs/testing/postman/heartbeat-success.png` |
| IT-09 | Heartbeat ohne API Key | Nachweis vorgesehen unter `docs/testing/postman/heartbeat-missing-api-key.png` |
| IT-11 | NowNext Response | Nachweis vorgesehen unter `docs/testing/postman/nownext-response.png` |
| IT-13 | Google Calendar Sync | Nachweis vorgesehen unter `docs/testing/postman/google-calendar-sync.png` |
| IT-14 | Device erstellen | Nachweis vorgesehen unter `docs/testing/postman/create-device.png` |

### 5.3 Frontend-Tests (Browser)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| MT-01 | Login Screen | Nachweis vorgesehen unter `docs/testing/frontend/login-screen.png` |
| MT-02 | Login Fehlermeldung | Nachweis vorgesehen unter `docs/testing/frontend/login-error.png` |
| MT-03 | Dashboard Übersicht | Nachweis vorgesehen unter `docs/testing/frontend/dashboard-overview.png` |
| MT-07 | Mood Preview Animation | Nachweis vorgesehen unter `docs/testing/frontend/mood-preview.png` |
| MT-09 | Calendar Ansicht | Nachweis vorgesehen unter `docs/testing/frontend/calendar-view.png` |

### 5.4 Device-Tests (ESP32)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| DT-01 | WiFi + HTTP verbunden | Nachweis vorgesehen unter `docs/testing/device/esp32-serial-wifi-http.png` |
| DT-03 | Heartbeat Serial Log | Nachweis vorgesehen unter `docs/testing/device/esp32-heartbeat-success.png` |
| DT-05 | Display FACE Mode | Nachweis vorgesehen unter `docs/testing/device/esp32-face-mode.jpg` |
| DT-06 | Display CALENDAR Mode | Nachweis vorgesehen unter `docs/testing/device/esp32-calendar-mode.jpg` |

---

## 6. Testergebnisse Übersicht

### Automatisierte Unit Tests (xUnit)

| Bereich | Tests | Status |
|---------|-------|--------|
| FindNow (Standardfälle) | 3 | ✅ Bestanden |
| FindNow (Grenzfälle) | 2 | ✅ Bestanden |
| FindNext (Standardfälle) | 2 | ✅ Bestanden |
| FindNext (Grenzfälle) | 2 | ✅ Bestanden |
| IsDeviceOnline (Standardfälle) | 2 | ✅ Bestanden |
| IsDeviceOnline (Grenzfälle) | 2 | ✅ Bestanden |
| **Total** | **13** | **✅ Alle bestanden** |

### Manuelle API-/Integrationstests (Postman)

| Kategorie | Tests | Status |
|-----------|-------|--------|
| Health | 1 | Durchgeführt |
| Auth (Login) | 2 | Durchgeführt |
| Devices CRUD | 4 | Durchgeführt |
| Heartbeat | 3 | Durchgeführt |
| NowNext | 1 | Durchgeführt |
| Calendar Events | 1 | Durchgeführt |
| Google Sync | 1 | Durchgeführt |
| Device Status | 2 | Durchgeführt |
| **Total** | **15** | **Durchgeführt** |

### Manuelle Frontend-Tests

| Seite | Tests | Status |
|-------|-------|--------|
| Login | 2 | Manuell geprüft |
| Dashboard | 4 | Manuell geprüft |
| DeskBuddy Status | 2 | Manuell geprüft |
| Calendar | 3 | Manuell geprüft |
| Settings | 1 | Manuell geprüft |
| **Total** | **12** | **Manuell geprüft** |

### Device-Tests (ESP32)

| Bereich | Tests | Status |
|---------|-------|--------|
| Connectivity | 2 | Manuell geprüft |
| Heartbeat | 2 | Manuell geprüft |
| Display / Touch | 2 | Manuell geprüft |
| Backend-Verifikation | 1 | Manuell geprüft |
| **Total** | **7** | **Manuell geprüft** |

### End-to-End Tests

| Test | Status | Bemerkung |
|------|--------|-----------|
| E2E-01 ESP32 → Frontend | Manuell geprüft | Mood-Update innerhalb von 30s sichtbar |
| E2E-02 Google → ESP32 | Manuell geprüft | Nach manuellem Sync sofort auf Display |
| E2E-03 Google → Frontend | Manuell geprüft | Geändertes Event in Calendar-Seite |
| E2E-04 Offline-Erkennung | Manuell geprüft | Status wechselt nach 2 Min zu „Offline" |

---

## 7. Bekannte Einschränkungen

| Bereich | Beschreibung |
|---------|-------------|
| Keine automatisierten Frontend-Tests | Jest / React Testing Library wurde nicht eingesetzt. Tests wurden manuell im Browser durchgeführt. |
| Keine automatisierten Device-Tests | ESP32-Kommunikation wurde nur manuell via Serial Monitor und Netzwerkaufrufe geprüft. |
| Google OAuth nur manuell getestet | Der Token-Refresh-Flow wurde nicht automatisiert getestet. Bei abgelaufenem Token ist manueller Re-Login erforderlich. |
| ESP32 nur mit einem Gerät getestet | Multi-Device-Szenarien wurden nicht getestet. |
| Keine Lasttests | Performance und Skalierbarkeit sind für ein lokales Schulprojekt nicht relevant. |

---

## 8. Testumgebung

| Komponente | Details |
|------------|---------|
| Unit Tests | `dotnet test`, .NET 8, xUnit 2.9.0 |
| Backend | Lokal, `dotnet run --urls "http://0.0.0.0:5294"` |
| Frontend | Lokal, `npm run dev`, Port 5173 |
| Datenbank | SQLite, `backend/DeskBuddy.Api/deskbuddy.db` |
| ESP32 | Waveshare ESP32-S3-Touch-AMOLED-1.75, WLAN (Hotspot) |
| API Testing | Postman, Collection unter `tests/DeskBuddy.postman_collection.json` |
| Google Calendar | Test-Account, OAuth2 Desktop App |
| Browser | Chrome (Frontend-Tests) |

---

## 9. Fazit

Das DeskBuddy-System wurde systematisch auf allen relevanten Ebenen getestet. Insgesamt wurden **47 funktionale Testfälle** sowie **4 End-to-End-Szenarien** dokumentiert und durchgeführt:

- **13 automatisierte Unit Tests** (xUnit) decken die zentrale Business-Logik (Now/Next-Berechnung, Online/Offline-Erkennung) vollständig ab — inklusive Grenzfälle
- **15 manuelle API-/Integrationstests** via Postman decken alle Endpoints mit positiven und negativen Szenarien ab
- **12 manuelle Frontend-Tests** prüfen alle Seiten und Funktionen des Dashboards im Browser
- **7 manuelle Device-Tests** bestätigen die korrekte ESP32-Kommunikation mit dem Backend
- **4 manuelle End-to-End-Tests** prüfen den vollständigen Datenfluss von Google Calendar bis zum Display

Die Test-Pyramide wurde eingehalten: die Basis bilden automatisierte Unit Tests für die isolierte Business-Logik, darüber manuelle API-/Integrationstests (Postman), ergänzt durch manuelle UI- und Device-Tests sowie wenige, gezielte E2E-Tests. Die Testabdeckung ist für den Projektumfang ausreichend und nachvollziehbar dokumentiert.
