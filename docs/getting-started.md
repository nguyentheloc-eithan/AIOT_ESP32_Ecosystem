# Getting Started

Quick start guide for the AIOT ESP32 Ecosystem.

## Prerequisites

Before you begin, ensure you have the following installed:

### Software

- **Docker & Docker Compose** - For running infrastructure
- **Go 1.25+** - For backend development
- **Node.js 20+** - For frontend development
- **Arduino IDE** or **PlatformIO** - For firmware development
- **Git** - Version control

### Hardware (for full deployment)

- M5Stack Core2 or AtomS3
- USB-C cable for programming
- Sensors/actuators for your chosen module
- 12V power supply (if using actuators)

### Optional Tools

- **MQTTX** - MQTT client for testing
- **Postman** - API testing
- **VS Code** - Recommended IDE

---

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/aiot-esp32-ecosystem.git
cd aiot-esp32-ecosystem
```

### 2. Start Infrastructure

```bash
cd core/infra/docker
docker-compose up -d
```

This starts:

- MQTT Broker on port 1883
- PocketBase on port 8090

**Verify services:**

```bash
docker-compose ps
```

### 3. Configure PocketBase

1. Open http://localhost:8090/\_/
2. Create admin account (first time only)
3. Collections are auto-created from migrations

### 4. Start Backend

```bash
cd core/backend
go mod download
go run main.go
```

Backend runs on http://localhost:8080

**Test it:**

```bash
curl http://localhost:8080/health
```

### 5. Start Frontend

```bash
cd core/frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

**Open in browser:** http://localhost:5173

---

## Your First Device

### Option A: Simulated Device (No Hardware)

For testing without physical hardware:

1. **Install MQTTX** from https://mqttx.app/

2. **Connect to broker:**
   - Host: `localhost`
   - Port: `1883`

3. **Simulate telemetry:**
   - Topic: `aiot/devices/TEST001/telemetry`
   - Payload:
     ```json
     {
       "device_id": "TEST001",
       "timestamp": "2026-03-24T10:30:00Z",
       "temperature": 25.5,
       "humidity": 65,
       "moisture": 45
     }
     ```

4. **Listen for commands:**
   - Subscribe to: `aiot/devices/TEST001/command`

### Option B: Real M5Stack Device

1. **Prepare hardware:**
   - M5Stack Core2
   - USB-C cable
   - Optional: Earth Unit (moisture sensor)

2. **Install Arduino IDE:**
   - Download from https://www.arduino.cc/
   - Add ESP32 board support:
     - File → Preferences → Additional Board Manager URLs
     - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Install "ESP32"

3. **Install M5Stack library:**
   - Sketch → Include Library → Manage Libraries
   - Search and install: "M5Core2"

4. **Open example firmware:**

   ```
   modules/smart-sensing/firmware/smart-sensing.ino
   ```

5. **Configure Wi-Fi and MQTT:**

   ```cpp
   const char* WIFI_SSID = "Your_WiFi_Name";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";
   const char* MQTT_BROKER = "192.168.1.100"; // Your computer's IP
   ```

6. **Upload to M5Stack:**
   - Tools → Board → ESP32 Arduino → M5Stack-Core2
   - Tools → Port → Select your M5Stack port
   - Sketch → Upload

7. **Monitor serial output:**
   - Tools → Serial Monitor
   - Set baud rate to 115200
   - Watch for connection messages

---

## Development Workflow

### Backend Development

1. **Make code changes** in `core/backend/`

2. **Run locally:**

   ```bash
   go run main.go
   ```

3. **Build for production:**
   ```bash
   go build -o aiot-backend
   ```

### Frontend Development

1. **Make changes** in `core/frontend/src/`

2. **Hot reload** is automatic with Vite

3. **Build for production:**
   ```bash
   npm run build
   ```

### Firmware Development

1. **Edit firmware** in `modules/{module-name}/firmware/`

2. **Verify/compile:**
   - Arduino: Sketch → Verify/Compile
   - PlatformIO: `pio run`

3. **Upload:**
   - Arduino: Sketch → Upload
   - PlatformIO: `pio run --target upload`

4. **Monitor serial:**
   - Arduino: Tools → Serial Monitor
   - PlatformIO: `pio device monitor`

---

## Project Structure Overview

```
aiot-esp32-ecosystem/
├── README.md                   # Main project docs
├── core/                       # Core platform
│   ├── backend/                # Go backend
│   ├── frontend/               # React PWA
│   └── infra/                  # Infrastructure
│       ├── docker/             # Docker Compose
│       ├── mqtt/               # MQTT config
│       └── pocketbase/         # Database
├── modules/                    # IoT modules
│   ├── smart-pumping/
│   ├── smart-sensing/
│   ├── smart-plugs/
│   └── _template/              # Module template
├── hardware/                   # Hardware docs
│   ├── schematics/
│   └── enclosures/
└── docs/                       # Documentation
    ├── architecture.md
    ├── api-reference.md
    └── getting-started.md      # This file
```

---

## Common Tasks

### View MQTT Messages

**Using MQTTX:**

1. Connect to `localhost:1883`
2. Subscribe to `aiot/#` (all topics)
3. Watch messages in real-time

**Using mosquitto_sub:**

```bash
mosquitto_sub -h localhost -t "aiot/#" -v
```

### Publish Test Command

**Using MQTTX:**

- Topic: `aiot/devices/M5STACK001/command`
- Payload:
  ```json
  { "action": "pump", "state": "on", "duration": 5 }
  ```

**Using mosquitto_pub:**

```bash
mosquitto_pub -h localhost -t "aiot/devices/M5STACK001/command" \
  -m '{"action":"pump","state":"on","duration":5}'
```

### Check PocketBase Data

1. Open http://localhost:8090/\_/
2. Navigate to Collections
3. View data in tables
4. Use API preview for queries

### View Backend Logs

```bash
# If running with go run
# Logs print to console

# If running as systemd service
sudo journalctl -u aiot-backend -f
```

### View Frontend Console

Open browser DevTools:

- Chrome/Edge: F12
- Firefox: F12
- Safari: Cmd+Option+I (Mac)

---

## Troubleshooting

### Services Not Starting

**Problem:** Docker containers fail to start

**Solution:**

```bash
cd core/infra/docker
docker-compose down
docker-compose up -d
docker-compose logs -f
```

### Backend Can't Connect to MQTT

**Problem:** "Failed to connect to MQTT broker"

**Check:**

1. MQTT broker running: `docker-compose ps`
2. Correct MQTT_HOST in environment
3. Port 1883 not blocked by firewall

### M5Stack Won't Connect

**Problem:** Device shows "Wi-Fi connection failed"

**Check:**

1. Correct SSID and password
2. 2.4GHz Wi-Fi (ESP32 doesn't support 5GHz)
3. Network in range
4. View serial monitor for errors

### Frontend API Calls Fail

**Problem:** CORS errors or connection refused

**Check:**

1. Backend is running on port 8080
2. VITE_API_URL in `.env` is correct
3. Browser console for exact error

### No Telemetry Data

**Problem:** Frontend shows no data

**Debug:**

1. Check device is online (serial monitor)
2. Verify MQTT messages (MQTTX subscribe to `aiot/#`)
3. Check backend logs for errors
4. Inspect PocketBase collections

---

## Next Steps

### Build Your First Module

1. **Read module documentation:**
   - [Smart Pumping](../modules/smart-pumping/README.md)
   - [Smart Sensing](../modules/smart-sensing/README.md)
   - [Smart Plugs](../modules/smart-plugs/README.md)

2. **Follow module setup guide**

3. **Test with real hardware**

### Create a Custom Module

1. **Copy template:**

   ```bash
   cp -r modules/_template modules/my-module
   ```

2. **Read template README:**

   ```
   modules/_template/README.md
   ```

3. **Implement firmware, backend, frontend**

4. **Share with community!**

### Deploy to Production

1. **Read architecture docs:**

   ```
   docs/architecture.md
   ```

2. **Set up production server:**
   - VPS or Raspberry Pi
   - Domain name
   - SSL certificate (Let's Encrypt)

3. **Configure for production:**
   - Enable authentication
   - HTTPS only
   - MQTT over TLS
   - Firewall rules

### Join the Community

- GitHub Discussions
- Discord Server
- Submit issues and PRs
- Share your builds!

---

## Resources

### Documentation

- [Architecture](architecture.md) - System design
- [API Reference](api-reference.md) - REST API docs
- [Module Template](../modules/_template/README.md) - Create modules

### Hardware

- [M5Stack Official Store](https://shop.m5stack.com/)
- [M5Stack Documentation](https://docs.m5stack.com/)
- [ESP32 Reference](https://docs.espressif.com/projects/esp-idf/)

### Software

- [Echo Framework](https://echo.labstack.com/)
- [PocketBase Docs](https://pocketbase.io/docs/)
- [MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)
- [React Documentation](https://react.dev/)

---

## Getting Help

**Have questions?**

1. Check documentation first
2. Search existing GitHub issues
3. Ask in Discussions
4. Open new issue with details:
   - What you tried
   - Error messages
   - System info (OS, versions)
   - Logs

---

**Ready to build? Let's go! 🚀**
