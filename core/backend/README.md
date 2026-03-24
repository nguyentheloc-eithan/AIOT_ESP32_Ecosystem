# AIOT ESP32 Ecosystem - Backend

Go-based backend server using Echo framework for the AIOT ESP32 Ecosystem.

## Architecture

This backend follows a modular architecture that supports multiple IoT modules (Smart Pumping, Smart Sensing, Smart Plugs, etc.) through a unified API and MQTT communication layer.

### Directory Structure

```
backend/
├── main.go                 # Application entry point
├── go.mod                  # Go module dependencies
├── go.sum                  # Dependency checksums
├── config/                 # Configuration management
│   ├── config.go
│   └── env.go
└── internal/               # Internal packages
    ├── api/                # REST API handlers
    │   ├── routes.go       # Route registration
    │   ├── devices.go      # Device management
    │   ├── pumping.go      # Smart Pumping module
    │   ├── sensing.go      # Smart Sensing module
    │   ├── plugs.go        # Smart Plugs module
    │   └── tasks.go        # Task & log management
    ├── mqtt/               # MQTT client
    │   └── client.go
    ├── pb/                 # PocketBase client
    │   └── client.go
    ├── models/             # Data models
    ├── services/           # Business logic
    ├── scheduler/          # Job scheduler
    └── worker/             # Background workers
```

## Features

### Core Infrastructure

- ✅ Echo v5 web framework
- ✅ MQTT client integration (Eclipse Paho)
- ✅ PocketBase client for data persistence
- ✅ Environment-based configuration
- ✅ CORS support
- ✅ Request logging
- ✅ Error recovery middleware

### API Endpoints

#### Health Check

- `GET /health` - Server health status

#### Devices

- `GET /api/v1/devices` - List all devices
- `GET /api/v1/devices/:id` - Get device details
- `POST /api/v1/devices` - Register new device
- `PUT /api/v1/devices/:id` - Update device
- `DELETE /api/v1/devices/:id` - Remove device

#### Smart Pumping Module

- `POST /api/v1/modules/pumping/:deviceId/activate` - Activate pump
- `POST /api/v1/modules/pumping/:deviceId/deactivate` - Deactivate pump
- `GET /api/v1/modules/pumping/:deviceId/schedules` - Get watering schedules
- `POST /api/v1/modules/pumping/:deviceId/schedules` - Create schedule
- `PUT /api/v1/modules/pumping/schedules/:id` - Update schedule
- `DELETE /api/v1/modules/pumping/schedules/:id` - Delete schedule

#### Smart Sensing Module

- `GET /api/v1/modules/sensing/:deviceId/telemetry` - Get telemetry history
- `GET /api/v1/modules/sensing/:deviceId/telemetry/latest` - Get latest readings
- `POST /api/v1/modules/sensing/:deviceId/telemetry` - Record telemetry data

#### Smart Plugs Module

- `POST /api/v1/modules/plugs/:deviceId/on` - Turn plug on
- `POST /api/v1/modules/plugs/:deviceId/off` - Turn plug off
- `GET /api/v1/modules/plugs/:deviceId/status` - Get plug status
- `GET /api/v1/modules/plugs/:deviceId/energy` - Get energy usage

#### Tasks & Logs

- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/:id` - Get task details
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/logs` - Get system logs
- `POST /api/v1/logs` - Create log entry

## Setup

### Prerequisites

- Go 1.25 or higher
- Running MQTT broker (see `../infra/docker`)
- Running PocketBase instance (see `../infra/pocketbase`)

### Installation

1. **Install dependencies:**

   ```bash
   cd core/backend
   go mod download
   ```

2. **Configure environment:**

   Create a `.env` file (or set environment variables):

   ```bash
   # Server
   PORT=8080
   BACKEND_ENV=development

   # PocketBase
   POCKETBASE_URL=http://localhost:8090

   # MQTT
   MQTT_HOST=localhost
   MQTT_PORT=1883

   # Module Settings
   DEFAULT_PUMP_DURATION=300
   MOISTURE_ALERT_THRESHOLD=20
   TEMP_MIN_THRESHOLD=10
   TEMP_MAX_THRESHOLD=35
   ```

3. **Run the server:**

   ```bash
   go run main.go
   ```

   Or build and run:

   ```bash
   go build -o aiot-backend
   ./aiot-backend
   ```

## Development

### Adding a New Module

1. **Create handler file:**

   ```go
   // internal/api/mymodule.go
   package api

   import (
       "net/http"
       "smart_garden_server/internal/pb"
       "smart_garden_server/internal/mqtt"
       "github.com/labstack/echo/v5"
   )

   func MyModuleHandler(pbClient *pb.Client, mqttClient *mqtt.Client) echo.HandlerFunc {
       return func(c echo.Context) error {
           // Your logic here
           return c.JSON(http.StatusOK, map[string]string{
               "message": "Hello from my module",
           })
       }
   }
   ```

2. **Register routes:**
   ```go
   // internal/api/routes.go
   mymodule := modules.Group("/mymodule")
   mymodule.GET("/:deviceId/action", MyModuleHandler(pbClient, mqttClient))
   ```

### MQTT Communication

**Publishing to devices:**

```go
topic := "aiot/devices/" + deviceID + "/command"
payload := map[string]interface{}{
    "action": "your_action",
    "param": "value",
}
payloadBytes, _ := json.Marshal(payload)
mqttClient.Publish(topic, payloadBytes)
```

**Subscribing to topics:**

```go
mqttClient.Subscribe("aiot/devices/+/telemetry", func(client mqtt.Client, msg mqtt.Message) {
    // Handle incoming message
    log.Printf("Topic: %s, Message: %s", msg.Topic(), msg.Payload())
})
```

### Testing

**Test health endpoint:**

```bash
curl http://localhost:8080/health
```

**Test pump activation:**

```bash
curl -X POST http://localhost:8080/api/v1/modules/pumping/M5STACK001/activate \
  -H "Content-Type: application/json" \
  -d '{"duration": 30}'
```

**Test telemetry submission:**

```bash
curl -X POST http://localhost:8080/api/v1/modules/sensing/M5STACK001/telemetry \
  -H "Content-Type: application/json" \
  -d '{"temperature": 25.5, "humidity": 65, "moisture": 45}'
```

## Configuration Reference

| Variable                   | Default                 | Description                          |
| -------------------------- | ----------------------- | ------------------------------------ |
| `PORT`                     | `8080`                  | Server port                          |
| `BACKEND_ENV`              | `development`           | Environment (development/production) |
| `POCKETBASE_URL`           | `http://localhost:8090` | PocketBase API URL                   |
| `MQTT_HOST`                | `localhost`             | MQTT broker host                     |
| `MQTT_PORT`                | `1883`                  | MQTT broker port                     |
| `DEFAULT_PUMP_DURATION`    | `300`                   | Default watering duration (seconds)  |
| `MOISTURE_ALERT_THRESHOLD` | `20`                    | Low moisture alert threshold (%)     |
| `TEMP_MIN_THRESHOLD`       | `10`                    | Minimum temperature threshold (°C)   |
| `TEMP_MAX_THRESHOLD`       | `35`                    | Maximum temperature threshold (°C)   |

## Production Deployment

### Build for production:

```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o aiot-backend .
```

### Docker deployment:

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o aiot-backend .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/aiot-backend .
EXPOSE 8080
CMD ["./aiot-backend"]
```

## Troubleshooting

### MQTT Connection Issues

- Verify MQTT broker is running: `docker-compose ps mqtt`
- Check MQTT logs: `docker-compose logs mqtt`
- Test MQTT connectivity: `telnet localhost 1883`

### PocketBase Connection Issues

- Verify PocketBase is running: `curl http://localhost:8090/api/health`
- Check PocketBase admin panel: http://localhost:8090/\_/

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 <PID>
```

## License

Part of the AIOT ESP32 Ecosystem open source project.
