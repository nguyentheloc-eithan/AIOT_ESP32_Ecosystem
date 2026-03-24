# Smart Sensing Module

Passive environmental monitoring module that continuously collects sensor data and feeds it into the shared data pipeline.

## Overview

The Smart Sensing module provides:

- Continuous monitoring of soil moisture, temperature, humidity, and air quality
- Time-series data storage for historical trend analysis
- Threshold-based alerts configurable per sensor
- Data sharing with other modules (e.g., Smart Pumping uses moisture readings)

## Hardware Requirements

| Component                   | Qty          | Purpose                          |
| --------------------------- | ------------ | -------------------------------- |
| M5Stack Core2 / AtomS3      | 1            | Main controller                  |
| Earth Unit                  | 1-4          | Capacitive soil moisture sensors |
| ENV Unit (III/IV)           | 1            | Temperature & humidity sensor    |
| TVOC/eCO₂ Unit              | 1 (optional) | Air quality monitoring           |
| Any Grove-compatible sensor | -            | Extensible to any sensor         |

**Wiring Diagram:** See `/hardware/schematics/smart-sensing/`

## Firmware

The firmware:

1. Reads from all connected sensors at regular intervals
2. Publishes telemetry data via MQTT
3. Displays current readings on M5Stack screen (if Core2)
4. Stores data locally if MQTT is unavailable (queue for sync)

### Topics

**Subscribe:**

- `aiot/devices/{device_id}/command` - Configuration commands

**Publish:**

- `aiot/devices/{device_id}/telemetry` - Sensor readings
- `aiot/devices/{device_id}/status` - Device online/offline status

### Telemetry Format

```json
{
  "device_id": "M5STACK002",
  "timestamp": "2026-03-24T10:30:00Z",
  "sensors": {
    "temperature": 25.5, // °C
    "humidity": 65, // %
    "moisture_1": 45, // %
    "moisture_2": 38, // %
    "tvoc": 120, // ppb (optional)
    "eco2": 450 // ppm (optional)
  },
  "battery": 85, // % (if battery-powered)
  "signal_strength": -45 // dBm
}
```

### Command Format

```json
{
  "action": "config",
  "interval": 60, // Reading interval in seconds
  "sensors": {
    "enabled": ["temp", "humidity", "moisture"],
    "disabled": ["tvoc"]
  }
}
```

## Backend Integration

The backend provides REST API endpoints for:

- `GET /api/v1/modules/sensing/:deviceId/telemetry` - Get telemetry history
- `GET /api/v1/modules/sensing/:deviceId/telemetry/latest` - Get latest readings
- `POST /api/v1/modules/sensing/:deviceId/telemetry` - Record telemetry (from device)

## Database Schema

### Telemetry Table

| Field           | Type      | Description              |
| --------------- | --------- | ------------------------ |
| id              | string    | Unique record ID         |
| device_id       | string    | M5Stack device ID        |
| timestamp       | timestamp | When reading was taken   |
| temperature     | float     | Temperature in °C        |
| humidity        | float     | Humidity in %            |
| moisture_1      | integer   | First moisture sensor %  |
| moisture_2      | integer   | Second moisture sensor % |
| tvoc            | integer   | TVOC in ppb (optional)   |
| eco2            | integer   | eCO₂ in ppm (optional)   |
| battery         | integer   | Battery level %          |
| signal_strength | integer   | Wi-Fi signal in dBm      |

### Alert Rules Table

| Field        | Type    | Description            |
| ------------ | ------- | ---------------------- |
| id           | string  | Unique rule ID         |
| device_id    | string  | M5Stack device ID      |
| sensor       | string  | Sensor name            |
| condition    | string  | "above" or "below"     |
| threshold    | float   | Threshold value        |
| enabled      | boolean | Active/inactive        |
| notification | boolean | Send push notification |

## Setup Instructions

1. **Flash firmware to M5Stack**
   - Open `firmware/smart-sensing.ino` in Arduino IDE
   - Update Wi-Fi credentials
   - Update MQTT broker IP
   - Configure sensor pins
   - Upload to device

2. **Wire sensors**
   - Connect Earth Unit(s) to Grove ports
   - Connect ENV Unit to I2C port
   - Follow wiring diagram in `/hardware/schematics/smart-sensing/`

3. **Register device**

   ```bash
   curl -X POST http://localhost:8080/api/v1/devices \
     -H "Content-Type: application/json" \
     -d '{
       "id": "M5STACK002",
       "name": "Garden Sensors",
       "type": "smart-sensing",
       "location": "Zone A"
     }'
   ```

4. **Configure alert rules**

   ```bash
   # Low moisture alert
   curl -X POST http://localhost:8080/api/v1/alerts \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "M5STACK002",
       "sensor": "moisture_1",
       "condition": "below",
       "threshold": 20,
       "notification": true
     }'

   # High temperature alert
   curl -X POST http://localhost:8080/api/v1/alerts \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "M5STACK002",
       "sensor": "temperature",
       "condition": "above",
       "threshold": 35,
       "notification": true
     }'
   ```

## Data Visualization

The collected data can be visualized in the frontend PWA:

- Real-time gauges for current readings
- Line charts for historical trends (24h, 7d, 30d)
- Correlation graphs (temp vs humidity vs moisture)
- Alert history timeline

## Sensor Calibration

### Moisture Sensors (Earth Unit)

Calibrate in dry and wet conditions:

```cpp
// In air (dry)
int dryValue = analogRead(MOISTURE_PIN); // ~2800

// In water (wet)
int wetValue = analogRead(MOISTURE_PIN); // ~1400

// Map to percentage
int moisturePercent = map(rawValue, wetValue, dryValue, 100, 0);
```

### Temperature Calibration

If readings are offset:

```cpp
float calibratedTemp = rawTemp + TEMP_OFFSET; // e.g., -2.0
```

## Power Modes

**Continuous Mode** (powered):

- Read sensors every 60 seconds
- Always connected to Wi-Fi and MQTT

**Battery Mode** (portable):

- Read sensors every 5 minutes
- Deep sleep between readings
- Wake on alert threshold crossing

## Development

Firmware structure:

```
firmware/
├── smart-sensing.ino         # Main sketch
├── config.h                  # Configuration
├── sensors.h                 # Sensor reading functions
├── mqtt_handler.h            # MQTT communication
└── display.h                 # M5Stack display UI
```

## Troubleshooting

**No sensor readings:**

- Check Grove port connections
- Verify I2C address (for ENV Unit)
- View serial output for sensor errors
- Test sensors individually

**Inconsistent moisture values:**

- Recalibrate sensors (dry/wet)
- Check sensor placement in soil
- Ensure proper soil-sensor contact
- Clean sensor probe

**MQTT publish failures:**

- Check Wi-Fi signal strength
- Verify MQTT broker status
- Reduce publish frequency
- Check payload size limits

## Future Enhancements

- [ ] Support for more sensor types (pH, light, EC)
- [ ] On-device data aggregation (min/max/avg per hour)
- [ ] Predictive alerts using ML (trend analysis)
- [ ] Battery optimization (adaptive sampling)
- [ ] Multi-point averaging (multiple sensors per zone)
- [ ] LoRa support for remote locations
