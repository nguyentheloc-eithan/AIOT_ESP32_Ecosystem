# AIOT ESP32 Ecosystem - Architecture

Complete system architecture documentation for the AIOT ESP32 Ecosystem.

## System Overview

The AIOT ESP32 Ecosystem is built on a **three-layer architecture** that separates concerns and enables modular extensibility.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │             React PWA (Progressive Web App)              │  │
│   │  - Responsive UI (mobile, tablet, desktop)              │  │
│   │  - Real-time updates (WebSocket)                        │  │
│   │  - Offline support (Service Worker)                     │  │
│   │  - Push notifications (FCM)                             │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│                                                                 │
│   ┌────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│   │ Echo API   │───►│ PocketBase   │    │ MQTT Broker      │   │
│   │ Server     │    │ (Database    │    │ (Messaging)      │   │
│   │ (Golang)   │    │  + Auth)     │    │                  │   │
│   └────────────┘    └──────────────┘    └──────────────────┘   │
│         │                                         ▲             │
│         │                                         │             │
│         └─────────────────────┬───────────────────┘             │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │ MQTT Protocol
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Device Layer                              │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  M5Stack     │  │  M5Stack     │  │  M5Stack     │         │
│   │  Device      │  │  Device      │  │  Device      │         │
│   │  (Pumping)   │  │  (Sensing)   │  │  (Plugs)     │         │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│          │                 │                 │                  │
│   ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐         │
│   │  Sensors &   │  │  Sensors &   │  │  Sensors &   │         │
│   │  Actuators   │  │  Actuators   │  │  Actuators   │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Details

### 1. Device Layer (Hardware)

**Responsibilities:**

- Read sensor values
- Control actuators (relay, valve, etc.)
- Local processing and caching
- Publish telemetry data via MQTT
- Subscribe to commands via MQTT
- Display status on local screen
- Operate autonomously when disconnected

**Technology:**

- M5Stack (ESP32-based controllers)
- Arduino/PlatformIO firmware
- Grove-compatible sensors
- MQTT client library

**Communication:**

- Wi-Fi connection to local network
- MQTT protocol for pub/sub messaging
- JSON payload format

---

### 2. Application Layer (Backend)

**Responsibilities:**

- Route MQTT messages between devices and storage
- Provide REST API for frontend
- Execute scheduled jobs (watering schedules, etc.)
- Monitor thresholds and trigger alerts
- Handle authentication and authorization
- Store persistent data

**Components:**

#### Echo API Server (Golang)

- RESTful API endpoints
- MQTT client integration
- Business logic processing
- Middleware (logging, CORS, auth)

#### MQTT Broker (Eclipse Mosquitto)

- Real-time pub/sub messaging
- Topic-based routing
- QoS support
- WebSocket support (for web clients)

#### PocketBase

- Embedded database (SQLite)
- Built-in authentication
- REST API auto-generated
- Real-time subscriptions
- Admin dashboard

**Communication:**

- REST API (JSON over HTTPS)
- MQTT protocol (devices ↔ backend)
- WebSocket (real-time to frontend)

---

### 3. Presentation Layer (Frontend)

**Responsibilities:**

- Display device status and telemetry
- Provide manual control interface
- Show historical data (charts, graphs)
- Configure schedules and automation
- Display alerts and notifications
- Responsive design (mobile-first)

**Technology:**

- React 19
- TypeScript
- Vite (build tool)
- PWA capabilities
- MQTT over WebSocket (real-time)

**Features:**

- Service Worker for offline support
- Local storage for caching
- Push notifications (FCM)
- Responsive layout (mobile, tablet, desktop)

---

## Data Flow

### Telemetry Data Flow (Device → Backend → Frontend)

```
┌──────────────┐
│  M5Stack     │ 1. Read sensor (e.g., moisture = 45%)
│  Device      │
└──────┬───────┘
       │ 2. Publish to MQTT
       │    Topic: aiot/devices/M5STACK001/telemetry
       │    Payload: {"moisture": 45, "temp": 25.5}
       ▼
┌──────────────┐
│ MQTT Broker  │ 3. Route message
└──────┬───────┘
       │ 4. Backend subscribes
       ▼
┌──────────────┐
│  Backend     │ 5. Process telemetry
│  (Golang)    │ 6. Store in PocketBase
└──────┬───────┘
       │ 7. Notify frontend (WebSocket)
       ▼
┌──────────────┐
│  Frontend    │ 8. Update UI (real-time)
│  (React)     │ 9. Display to user
└──────────────┘
```

### Command Flow (Frontend → Backend → Device)

```
┌──────────────┐
│  Frontend    │ 1. User clicks "Turn On Pump"
│  (React)     │
└──────┬───────┘
       │ 2. POST /api/v1/modules/pumping/M5STACK001/activate
       │    Body: {"duration": 30}
       ▼
┌──────────────┐
│  Backend     │ 3. Validate request
│  (Golang)    │ 4. Publish MQTT command
└──────┬───────┘
       │ 5. Topic: aiot/devices/M5STACK001/command
       │    Payload: {"action": "pump", "state": "on", "duration": 30}
       ▼
┌──────────────┐
│ MQTT Broker  │ 6. Route to device
└──────┬───────┘
       │ 7. Device receives command
       ▼
┌──────────────┐
│  M5Stack     │ 8. Turn on relay
│  Device      │ 9. Start timer (30s)
└──────┬───────┘ 10. Update display
       │ 11. Publish status update
       │     Topic: aiot/devices/M5STACK001/status
       │     Payload: {"pump_state": "on"}
       ▼
    (back to frontend for confirmation)
```

---

## MQTT Topic Structure

### Topic Hierarchy

```
aiot/
├── devices/
│   └── {device_id}/
│       ├── command          # Backend → Device (commands)
│       ├── telemetry        # Device → Backend (sensor data)
│       ├── status           # Device → Backend (state updates)
│       └── alert            # Device → Backend (urgent notifications)
├── modules/
│   ├── pumping/{device_id}/
│   ├── sensing/{device_id}/
│   └── plugs/{device_id}/
└── system/
    ├── alerts               # System-wide alerts
    └── logs                 # System logs
```

### Message Formats

**Command Message:**

```json
{
  "action": "pump|plug|config",
  "state": "on|off",
  "duration": 30,
  "timestamp": "2026-03-24T10:30:00Z"
}
```

**Telemetry Message:**

```json
{
  "device_id": "M5STACK001",
  "timestamp": "2026-03-24T10:30:00Z",
  "sensors": {
    "temperature": 25.5,
    "humidity": 65,
    "moisture": 45
  }
}
```

**Status Message:**

```json
{
  "device_id": "M5STACK001",
  "online": true,
  "ip": "192.168.1.100",
  "signal_strength": -45,
  "uptime": 86400,
  "pump_state": "on"
}
```

---

## Database Schema

### Core Collections

**devices**

- id (string, primary key)
- name (string)
- type (string: "smart-pumping", "smart-sensing", "smart-plugs")
- location (string)
- online (boolean)
- last_seen (timestamp)
- config (json)

**telemetry**

- id (string, primary key)
- device_id (string, foreign key)
- timestamp (timestamp)
- temperature (float)
- humidity (float)
- moisture (integer)
- [additional sensor fields]

**tasks**

- id (string, primary key)
- device_id (string, foreign key)
- name (string)
- type (string)
- payload (json)
- status (string: "pending", "processing", "done", "failed")
- created_at (timestamp)

**schedules**

- id (string, primary key)
- device_id (string, foreign key)
- time (string: HH:MM)
- duration (integer, seconds)
- enabled (boolean)
- days (array of strings)

**logs**

- id (string, primary key)
- device_id (string, foreign key)
- level (string: "info", "warning", "error")
- message (string)
- timestamp (timestamp)

---

## API Architecture

### RESTful Endpoints

**Base URL:** `http://localhost:8080/api/v1`

**Authentication:** (To be implemented)

- Bearer token
- PocketBase auth integration

**Standard Response Format:**

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-03-24T10:30:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Device not found"
  },
  "timestamp": "2026-03-24T10:30:00Z"
}
```

### Endpoint Categories

1. **Devices:** `/devices` - Device management
2. **Modules:** `/modules/{module-type}` - Module-specific actions
3. **Tasks:** `/tasks` - Background tasks
4. **Logs:** `/logs` - System logs

See `api-reference.md` for complete endpoint documentation.

---

## Security Architecture

### Authentication

**Phase 1 (Current):**

- No authentication (development only)
- Local network access only

**Phase 2 (Production):**

- PocketBase authentication
- JWT tokens
- User roles (admin, user, device)

### Network Security

**Development:**

- HTTP allowed
- MQTT without TLS
- Open Wi-Fi networks

**Production:**

- HTTPS only (Let's Encrypt)
- MQTT over TLS
- WPA2/WPA3 Wi-Fi
- VPN for remote access

### Device Security

- Wi-Fi credentials stored securely
- MQTT credentials separate per device
- OTA updates signed
- Firmware version tracking

---

## Scalability Considerations

### Horizontal Scaling

**Current (Single Instance):**

- One backend server
- One MQTT broker
- One PocketBase instance
- Suitable for: 1-100 devices

**Multi-Instance (Future):**

- Load-balanced backend servers
- MQTT broker cluster
- Database replication
- Suitable for: 100-10,000 devices

### Performance Targets

- Telemetry latency: < 500ms end-to-end
- Command execution: < 1 second
- UI responsiveness: < 100ms
- Concurrent devices: 100+ per server
- Messages per second: 1000+

---

## Deployment Architecture

### Development

```
Developer Machine:
├── Docker Compose (MQTT + PocketBase)
├── Backend (go run main.go)
└── Frontend (npm run dev)
```

### Production

```
VPS / Cloud Server:
├── Reverse Proxy (Nginx)
│   ├── HTTPS termination
│   └── Domain routing
├── Backend (systemd service)
├── MQTT Broker (Docker)
├── PocketBase (Docker)
└── Frontend (static files served by Nginx)
```

### Edge Computing (Future)

```
Local Gateway (Raspberry Pi):
├── MQTT Broker (local)
├── Edge Backend (cache + forward)
└── Devices connect locally
     │
     ▼
   Cloud Sync (when available)
```

---

## Extendibility

### Adding New Modules

1. **Firmware:** Create new firmware in `modules/{module-name}/firmware/`
2. **Backend:** Add handlers in `core/backend/internal/api/{module-name}.go`
3. **Frontend:** Add UI components for module
4. **Database:** Create PocketBase migration for module data
5. **Documentation:** Add README and wiring diagrams

### Adding New Sensors

- Extend telemetry message format
- Update database schema (add fields)
- Create firmware library for sensor
- Add UI visualization

### Integration Points

- **External APIs:** Weather, notifications, etc.
- **Home automation:** IFTTT, Home Assistant
- **Voice control:** Alexa, Google Home (future)
- **Cloud services:** AWS IoT, Azure IoT (future)

---

_Architecture evolves with the project. This document reflects v1.0 design._
