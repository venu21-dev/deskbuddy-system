# DeskBuddy – Testing Konzept

**Projekt:** DeskBuddy System (PRG3 / ADP)  
**Autor:** Venurshan Manivannan  
**Version:** 2.1

---

## 1. Testziele

Das Ziel der Tests ist es sicherzustellen, dass das DeskBuddy-System korrekt funktioniert und die definierten Anforderungen erfüllt:

- Die REST API liefert korrekte Antworten mit dem richtigen HTTP-Statuscode
- Authentifizierung (JWT und API Key) schützt die Endpoints korrekt
- Der Heartbeat-Mechanismus speichert Gerätedaten (Mood, Status, Battery) korrekt
- Google Calendar Sync aktualisiert die Datenbank vollständig
- Die Now/Next-Logik erkennt das aktuelle und nächste Event korrekt
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
       / Integr.\     ← API-Tests via Postman – Hauptfokus (15)
      /----------\
     / Manuell   \    ← Frontend + Device, manuell ausgeführt (19)
    /______________\
```

**Begründung:**  
Da es sich um ein Schulprojekt handelt, wurde kein vollautomatisiertes Test-Framework (xUnit, Jest) eingesetzt. Der Fokus liegt auf:

1. **Integrationstests via Postman** — vollständige API-Abdeckung mit dokumentierten Ergebnissen
2. **Manuelle Frontend-Tests** — alle Seiten und Funktionen wurden manuell durchgeklickt und geprüft
3. **Manuelle Device-Tests** — ESP32 wurde mit dem Serial Monitor und echten Netzwerkaufrufen geprüft
4. **Manuelle E2E-Tests** — der gesamte Datenfluss wurde mit realem Gerät verifiziert

> **Hinweis zu automatisierten Tests:** Automatisierte Unit Tests (xUnit / Jest) wurden aus Zeitgründen nicht vollständig umgesetzt. Die zentralen Funktionen wurden stattdessen über API-/Integrationstests mit Postman sowie manuelle Frontend-, Device- und End-to-End-Tests geprüft.

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
| Backend API | Integrationstests | Postman | 15 |
| Frontend | Manuelle Tests | Browser (Chrome) | 12 |
| ESP32 Device | Manuelle Tests | Serial Monitor + Netzwerk | 7 |
| Gesamtsystem | End-to-End Tests | Manuell | 4 |
| **Total** | | | **38** |

---

## 4. Testplan

### 4.1 Integrationstests – REST API (Postman)

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

### 4.2 Manuelle Tests – Frontend (React Dashboard)

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

### 4.3 Manuelle Tests – ESP32 Device

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

### 4.4 End-to-End Tests – Gesamter Datenfluss

| # | Testfall | Schritte | Erwartetes Ergebnis |
|---|----------|----------|---------------------|
| E2E-01 | ESP32 → Backend → Frontend | 1. ESP32 läuft und sendet Heartbeat<br>2. Backend empfängt und speichert Daten<br>3. Frontend-Refresh abwarten | Mood und Status im Frontend stimmen mit ESP32 überein |
| E2E-02 | Google Calendar → Backend → ESP32 | 1. Event in Google Calendar anlegen<br>2. `POST /api/googlecalendar/sync` auslösen<br>3. ESP32 fragt `/api/nownext` ab | ESP32 Display zeigt neues Event |
| E2E-03 | Google Calendar → Frontend | 1. Event in Google Calendar ändern<br>2. Sync auslösen<br>3. Calendar-Seite neu laden | Geändertes Event korrekt im Frontend |
| E2E-04 | Offline-Erkennung | 1. ESP32 ausschalten<br>2. 2 Minuten warten<br>3. Dashboard prüfen | Status wechselt zu „Offline" |

---

## 5. Testausführung und Nachweise

Alle Nachweise (Screenshots / Serial-Logs) sind abgelegt unter:

```
docs/
└── testing/
    ├── postman/
    ├── frontend/
    └── device/
```

### 5.1 API-Tests (Postman)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| IT-01 | Health Check | `docs/testing/postman/IT-01-health.png` |
| IT-02 | Login erfolgreich | `docs/testing/postman/login-success.png` |
| IT-03 | Login fehlgeschlagen | `docs/testing/postman/login-invalid.png` |
| IT-04 | GET Devices | `docs/testing/postman/get-devices.png` |
| IT-08 | Heartbeat erfolgreich | `docs/testing/postman/heartbeat-success.png` |
| IT-09 | Heartbeat ohne API Key | `docs/testing/postman/heartbeat-missing-api-key.png` |
| IT-11 | NowNext Response | `docs/testing/postman/nownext-response.png` |
| IT-13 | Google Calendar Sync | `docs/testing/postman/google-calendar-sync.png` |
| IT-14 | Device erstellen | `docs/testing/postman/create-device.png` |

### 5.2 Frontend-Tests (Browser)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| MT-01 | Login Screen | `docs/testing/frontend/login-screen.png` |
| MT-02 | Login Fehlermeldung | `docs/testing/frontend/login-error.png` |
| MT-03 | Dashboard Übersicht | `docs/testing/frontend/dashboard-overview.png` |
| MT-09 | Calendar Ansicht | `docs/testing/frontend/calendar-view.png` |
| MT-07 | Mood Preview Animation | `docs/testing/frontend/mood-preview.png` |

### 5.3 Device-Tests (ESP32)

| Test-ID | Beschreibung | Nachweis |
|---------|-------------|---------|
| DT-01 | WiFi + HTTP verbunden | `docs/testing/device/esp32-serial-wifi-http.png` |
| DT-03 | Heartbeat Serial Log | `docs/testing/device/esp32-heartbeat-success.png` |
| DT-05 | Display FACE Mode | `docs/testing/device/esp32-face-mode.jpg` |
| DT-06 | Display CALENDAR Mode | `docs/testing/device/esp32-calendar-mode.jpg` |

---

## 6. Testergebnisse Übersicht

### Postman API-Tests

| Kategorie | Tests | Status |
|-----------|-------|--------|
| Health | 1 | ✅ Pass |
| Auth (Login) | 2 | ✅ Pass |
| Devices CRUD | 4 | ✅ Pass |
| Heartbeat | 3 | ✅ Pass |
| NowNext | 1 | ✅ Pass |
| Calendar Events | 1 | ✅ Pass |
| Google Sync | 1 | ✅ Pass |
| Device Status | 2 | ✅ Pass |
| **Total** | **15** | **✅ All Pass** |

### Manuelle Frontend-Tests

| Seite | Tests | Status |
|-------|-------|--------|
| Login | 2 | ✅ Pass |
| Dashboard | 4 | ✅ Pass |
| DeskBuddy Status | 2 | ✅ Pass |
| Calendar | 3 | ✅ Pass |
| Settings | 1 | ✅ Pass |
| **Total** | **12** | **✅ All Pass** |

### Device-Tests (ESP32)

| Bereich | Tests | Status |
|---------|-------|--------|
| Connectivity | 2 | ✅ Pass |
| Heartbeat | 2 | ✅ Pass |
| Display / Touch | 2 | ✅ Pass |
| Backend-Verifikation | 1 | ✅ Pass |
| **Total** | **7** | **✅ All Pass** |

### End-to-End Tests

| Test | Status | Bemerkung |
|------|--------|-----------|
| E2E-01 ESP32 → Frontend | ✅ Pass | Mood-Update innerhalb von 30s sichtbar |
| E2E-02 Google → ESP32 | ✅ Pass | Nach manuellem Sync sofort auf Display |
| E2E-03 Google → Frontend | ✅ Pass | Geändertes Event in Calendar-Seite |
| E2E-04 Offline-Erkennung | ✅ Pass | Status wechselt nach 2min zu Offline |

---

## 7. Bekannte Einschränkungen

| Bereich | Beschreibung |
|---------|-------------|
| Keine automatisierten Unit Tests | xUnit-Tests wurden nicht implementiert. Die Service-Logik wurde indirekt über Postman-Integrationstests und manuelle Tests geprüft. |
| Keine automatisierten Frontend-Tests | Jest / React Testing Library wurde nicht eingesetzt. Tests wurden manuell im Browser durchgeführt. |
| Google OAuth nur manuell getestet | Der Token-Refresh-Flow wurde nicht automatisiert getestet. Bei abgelaufenem Token ist manueller Re-Login erforderlich. |
| ESP32 nur mit einem Gerät getestet | Multi-Device-Szenarien wurden nicht getestet. |
| Keine Lasttests | Performance und Skalierbarkeit sind für ein lokales Schulprojekt nicht relevant. |

---

## 8. Testumgebung

| Komponente | Details |
|------------|---------|
| Backend | Lokal, `dotnet run --urls "http://0.0.0.0:5294"` |
| Frontend | Lokal, `npm run dev`, Port 5173 |
| Datenbank | SQLite, `backend/DeskBuddy.Api/deskbuddy.db` |
| ESP32 | Waveshare ESP32-S3-Touch-AMOLED-1.75, WLAN (Hotspot) |
| API Testing | Postman, Collection unter `tests/DeskBuddy.postman_collection.json` |
| Google Calendar | Test-Account, OAuth2 Desktop App |
| Browser | Chrome (Frontend-Tests) |

---

## 9. Fazit

Das DeskBuddy-System wurde systematisch auf allen relevanten Ebenen getestet. Insgesamt wurden **34 funktionale Tests** sowie **4 End-to-End-Szenarien** dokumentiert und ausgeführt:

- **15 API-Tests** via Postman decken alle Endpoints mit positiven und negativen Szenarien ab
- **12 manuelle Frontend-Tests** verifizieren alle Seiten und Funktionen des Dashboards
- **7 Device-Tests** bestätigen die korrekte ESP32-Kommunikation mit dem Backend
- **4 End-to-End Tests** prüfen den vollständigen Datenfluss von Google Calendar bis zum Display

Die Test-Pyramide wurde eingehalten: der Schwerpunkt liegt auf Integrationstests (Postman), ergänzt durch manuelle UI- und Device-Tests sowie wenige, gezielte E2E-Tests. Automatisierte Unit Tests wurden aus Zeitgründen nicht vollständig umgesetzt — die Kernlogik wurde stattdessen durch Integrationstests mit Postman sowie manuelle System- und E2E-Tests abgedeckt. Die Testabdeckung ist für den Projektumfang vollständig und nachvollziehbar dokumentiert.
