# API Reference

Complete REST API documentation for the AIOT ESP32 Ecosystem backend.

## Base URL

```
Development: http://localhost:8080/api/v1
Production:  https://your-domain.com/api/v1
```

## Authentication

**Current:** No authentication (development only)

**Future:** Bearer token authentication

```http
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-24T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": "2026-03-24T10:30:00Z"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Endpoints

### Health Check

Check server health and status.

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "pocketbase": "http://localhost:8090",
  "mqtt": "connected"
}
```

---

## Devices

Manage IoT devices.

### List All Devices

**Endpoint:** `GET /api/v1/devices`

**Query Parameters:**

- `type` (optional) - Filter by device type
- `location` (optional) - Filter by location
- `online` (optional) - Filter by online status

**Response:**

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "M5STACK001",
        "name": "Garden Pump",
        "type": "smart-pumping",
        "location": "Front Yard",
        "online": true,
        "last_seen": "2026-03-24T10:30:00Z",
        "config": {}
      }
    ],
    "total": 1
  }
}
```

---

### Get Device

**Endpoint:** `GET /api/v1/devices/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "M5STACK001",
    "name": "Garden Pump",
    "type": "smart-pumping",
    "location": "Front Yard",
    "online": true,
    "last_seen": "2026-03-24T10:30:00Z",
    "ip_address": "192.168.1.100",
    "signal_strength": -45,
    "uptime": 86400,
    "firmware_version": "1.0.0"
  }
}
```

---

### Create Device

**Endpoint:** `POST /api/v1/devices`

**Request Body:**

```json
{
  "id": "M5STACK001",
  "name": "Garden Pump",
  "type": "smart-pumping",
  "location": "Front Yard"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "M5STACK001",
    "message": "Device created successfully"
  }
}
```

---

### Update Device

**Endpoint:** `PUT /api/v1/devices/:id`

**Request Body:**

```json
{
  "name": "Updated Name",
  "location": "Back Yard"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Device updated successfully"
  }
}
```

---

### Delete Device

**Endpoint:** `DELETE /api/v1/devices/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Device deleted successfully"
  }
}
```

---

## Smart Pumping Module

Control water pumps and manage schedules.

### Activate Pump

Turn on the pump for a specified duration.

**Endpoint:** `POST /api/v1/modules/pumping/:deviceId/activate`

**Request Body:**

```json
{
  "duration": 30 // seconds
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK001",
    "action": "activate",
    "duration": 30,
    "message": "Pump activation command sent"
  }
}
```

---

### Deactivate Pump

Turn off the pump immediately.

**Endpoint:** `POST /api/v1/modules/pumping/:deviceId/deactivate`

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK001",
    "action": "deactivate",
    "message": "Pump deactivation command sent"
  }
}
```

---

### Get Pump Schedules

List all watering schedules for a device.

**Endpoint:** `GET /api/v1/modules/pumping/:deviceId/schedules`

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK001",
    "schedules": [
      {
        "id": "sched_001",
        "time": "06:00",
        "duration": 300,
        "enabled": true,
        "days": ["Mon", "Wed", "Fri"]
      },
      {
        "id": "sched_002",
        "time": "18:00",
        "duration": 180,
        "enabled": true,
        "days": ["Tue", "Thu", "Sat"]
      }
    ]
  }
}
```

---

### Create Schedule

Add a new watering schedule.

**Endpoint:** `POST /api/v1/modules/pumping/:deviceId/schedules`

**Request Body:**

```json
{
  "time": "06:00",
  "duration": 300,
  "days": ["Mon", "Wed", "Fri"],
  "enabled": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sched_003",
    "message": "Schedule created successfully"
  }
}
```

---

### Update Schedule

Modify an existing schedule.

**Endpoint:** `PUT /api/v1/modules/pumping/schedules/:id`

**Request Body:**

```json
{
  "time": "07:00",
  "duration": 240,
  "enabled": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Schedule updated successfully"
  }
}
```

---

### Delete Schedule

Remove a schedule.

**Endpoint:** `DELETE /api/v1/modules/pumping/schedules/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Schedule deleted successfully"
  }
}
```

---

## Smart Sensing Module

Retrieve sensor data and telemetry.

### Get Telemetry

Retrieve historical telemetry data.

**Endpoint:** `GET /api/v1/modules/sensing/:deviceId/telemetry`

**Query Parameters:**

- `from` (optional) - Start timestamp (ISO 8601)
- `to` (optional) - End timestamp (ISO 8601)
- `limit` (optional) - Max records (default: 100)
- `offset` (optional) - Pagination offset

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK002",
    "telemetry": [
      {
        "id": "telem_001",
        "timestamp": "2026-03-24T10:30:00Z",
        "temperature": 25.5,
        "humidity": 65,
        "moisture": 45
      },
      {
        "id": "telem_002",
        "timestamp": "2026-03-24T10:31:00Z",
        "temperature": 25.6,
        "humidity": 64,
        "moisture": 45
      }
    ],
    "total": 2,
    "has_more": false
  }
}
```

---

### Get Latest Telemetry

Get the most recent sensor reading.

**Endpoint:** `GET /api/v1/modules/sensing/:deviceId/telemetry/latest`

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK002",
    "timestamp": "2026-03-24T10:30:00Z",
    "temperature": 25.5,
    "humidity": 65,
    "moisture": 45
  }
}
```

---

### Create Telemetry

**Note:** Typically called by devices, not frontend.

**Endpoint:** `POST /api/v1/modules/sensing/:deviceId/telemetry`

**Request Body:**

```json
{
  "temperature": 25.5,
  "humidity": 65,
  "moisture": 45
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "telem_003",
    "message": "Telemetry recorded"
  }
}
```

---

## Smart Plugs Module

Control smart plugs and monitor energy usage.

### Turn Plug On

**Endpoint:** `POST /api/v1/modules/plugs/:deviceId/on`

**Request Body (optional):**

```json
{
  "plug_id": 1 // If device has multiple plugs
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK003",
    "plug_id": 1,
    "state": "on",
    "message": "Plug turned on"
  }
}
```

---

### Turn Plug Off

**Endpoint:** `POST /api/v1/modules/plugs/:deviceId/off`

**Request Body (optional):**

```json
{
  "plug_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK003",
    "plug_id": 1,
    "state": "off",
    "message": "Plug turned off"
  }
}
```

---

### Get Plug Status

**Endpoint:** `GET /api/v1/modules/plugs/:deviceId/status`

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK003",
    "plugs": [
      {
        "plug_id": 1,
        "state": "on",
        "current": 2.5,
        "voltage": 220,
        "power": 550
      },
      {
        "plug_id": 2,
        "state": "off",
        "current": 0,
        "voltage": 220,
        "power": 0
      }
    ]
  }
}
```

---

### Get Energy Usage

**Endpoint:** `GET /api/v1/modules/plugs/:deviceId/energy`

**Query Parameters:**

- `from` (optional) - Start timestamp
- `to` (optional) - End timestamp
- `plug_id` (optional) - Specific plug

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "M5STACK003",
    "usage": [
      {
        "timestamp": "2026-03-24T10:00:00Z",
        "plug_id": 1,
        "consumption": 1.2, // kWh
        "cost": 0.14 // based on rate
      }
    ],
    "total_consumption": 1.2,
    "total_cost": 0.14
  }
}
```

---

## Tasks

Background task management.

### List Tasks

**Endpoint:** `GET /api/v1/tasks`

**Query Parameters:**

- `status` (optional) - Filter by status
- `type` (optional) - Filter by type
- `limit` (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_001",
        "name": "Water Plant",
        "type": "WATER_PLANT",
        "status": "done",
        "payload": {
          "duration": 30
        },
        "created_at": "2026-03-24T10:00:00Z",
        "completed_at": "2026-03-24T10:00:30Z"
      }
    ]
  }
}
```

---

### Create Task

**Endpoint:** `POST /api/v1/tasks`

**Request Body:**

```json
{
  "name": "Water Plant",
  "type": "WATER_PLANT",
  "payload": {
    "device_id": "M5STACK001",
    "duration": 30
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "task_002",
    "message": "Task created"
  }
}
```

---

## Logs

System and device logs.

### Get Logs

**Endpoint:** `GET /api/v1/logs`

**Query Parameters:**

- `level` (optional) - info, warning, error
- `device_id` (optional)
- `from` (optional) - Start timestamp
- `to` (optional) - End timestamp
- `limit` (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "device_id": "M5STACK001",
        "level": "info",
        "message": "Pump activated",
        "timestamp": "2026-03-24T10:00:00Z"
      }
    ]
  }
}
```

---

### Create Log

**Endpoint:** `POST /api/v1/logs`

**Request Body:**

```json
{
  "device_id": "M5STACK001",
  "level": "info",
  "message": "Custom log message"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "log_002",
    "message": "Log created"
  }
}
```

---

## Rate Limiting

**Current:** No rate limiting (development)

**Future:**

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- MQTT: 10 messages per second per device

---

## Pagination

For endpoints that return lists:

**Query Parameters:**

- `limit` - Number of items (default: 100, max: 1000)
- `offset` - Skip items

**Response includes:**

```json
{
  "total": 250,
  "limit": 100,
  "offset": 0,
  "has_more": true
}
```

---

## Filtering

Many endpoints support filtering:

**Examples:**

```
GET /api/v1/devices?type=smart-pumping
GET /api/v1/tasks?status=pending
GET /api/v1/logs?level=error&device_id=M5STACK001
```

---

## Webhooks (Future)

Subscribe to events:

**Event Types:**

- `device.online`
- `device.offline`
- `telemetry.threshold_exceeded`
- `pump.activated`
- `task.completed`

**Webhook Payload:**

```json
{
  "event": "pump.activated",
  "device_id": "M5STACK001",
  "timestamp": "2026-03-24T10:00:00Z",
  "data": {
    "duration": 30
  }
}
```

---

## Testing

### Using cURL

**Get health:**

```bash
curl http://localhost:8080/health
```

**List devices:**

```bash
curl http://localhost:8080/api/v1/devices
```

**Activate pump:**

```bash
curl -X POST http://localhost:8080/api/v1/modules/pumping/M5STACK001/activate \
  -H "Content-Type: application/json" \
  -d '{"duration": 30}'
```

### Using Postman

Import the Postman collection (coming soon).

---

## OpenAPI / Swagger

Full OpenAPI 3.0 specification (coming soon).

Access interactive API docs at:

```
http://localhost:8080/api/docs
```

---

_API version: 1.0.0 | Last updated: March 24, 2026_
