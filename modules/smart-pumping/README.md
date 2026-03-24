# Smart Pumping Module

Automated water pump management with scheduling, manual override, and water consumption tracking.

## Overview

The Smart Pumping module enables users to:

- Define recurring watering schedules (time + duration per session)
- Manually control the pump on/off from the web app in real-time
- Track cumulative water consumption per session and over time
- Receive dry-soil alerts when moisture is critically low

## Hardware Requirements

| Component                       | Qty | Purpose                        |
| ------------------------------- | --- | ------------------------------ |
| M5Stack Core2                   | 1   | Main controller with display   |
| Relay Unit                      | 1   | Triggers the solenoid valve    |
| Solenoid Valve (12V)            | 1   | Mechanical water on/off        |
| Earth Unit (Moisture Sensor)    | 1-2 | Soil moisture monitoring       |
| Switching Power Supply (12V 5A) | 1   | Powers the system              |
| Step-down converter (12V → 5V)  | 1   | Powers M5Stack from 12V supply |

**Wiring Diagram:** See `/hardware/schematics/smart-pumping/`

## Firmware

The firmware connects to your Wi-Fi network and MQTT broker to:

1. Subscribe to pump commands from the backend
2. Publish moisture sensor readings periodically
3. Execute scheduled or manual watering sessions
4. Display current status on M5Stack screen

### Topics

**Subscribe:**

- `aiot/devices/{device_id}/command` - Receives pump commands

**Publish:**

- `aiot/devices/{device_id}/telemetry` - Sends moisture readings
- `aiot/devices/{device_id}/status` - Device online/offline status

### Command Format

```json
{
  "action": "pump",
  "state": "on", // "on" or "off"
  "duration": 30 // Duration in seconds (for "on" command)
}
```

### Telemetry Format

```json
{
  "device_id": "M5STACK001",
  "moisture": 45,
  "pump_state": "on",
  "timestamp": "2026-03-24T10:30:00Z"
}
```

## Backend Integration

The backend provides REST API endpoints for:

- `POST /api/v1/modules/pumping/:deviceId/activate` - Activate pump
- `POST /api/v1/modules/pumping/:deviceId/deactivate` - Deactivate pump
- `GET /api/v1/modules/pumping/:deviceId/schedules` - Get schedules
- `POST /api/v1/modules/pumping/:deviceId/schedules` - Create schedule
- `PUT /api/v1/modules/pumping/schedules/:id` - Update schedule
- `DELETE /api/v1/modules/pumping/schedules/:id` - Delete schedule

## Database Schema

### Schedules Table

| Field     | Type    | Description            |
| --------- | ------- | ---------------------- |
| id        | string  | Unique schedule ID     |
| device_id | string  | M5Stack device ID      |
| time      | time    | Time of day (HH:MM)    |
| duration  | integer | Duration in seconds    |
| enabled   | boolean | Active/inactive        |
| days      | array   | Days of week (Mon-Sun) |

### Watering Logs Table

| Field           | Type      | Description            |
| --------------- | --------- | ---------------------- |
| id              | string    | Unique log ID          |
| device_id       | string    | M5Stack device ID      |
| started_at      | timestamp | When watering started  |
| ended_at        | timestamp | When watering ended    |
| duration        | integer   | Actual duration        |
| moisture_before | integer   | Moisture % before      |
| moisture_after  | integer   | Moisture % after       |
| triggered_by    | string    | "schedule" or "manual" |

## Setup Instructions

1. **Flash firmware to M5Stack Core2**
   - Open `firmware/smart-pumping.ino` in Arduino IDE
   - Update Wi-Fi credentials
   - Update MQTT broker IP
   - Upload to device

2. **Wire hardware components**
   - Follow wiring diagram in `/hardware/schematics/smart-pumping/`
   - Ensure 12V power supply is properly connected
   - Test relay operation before connecting to valve

3. **Register device in backend**

   ```bash
   curl -X POST http://localhost:8080/api/v1/devices \
     -H "Content-Type: application/json" \
     -d '{
       "id": "M5STACK001",
       "name": "Garden Pump",
       "type": "smart-pumping",
       "location": "Front Yard"
     }'
   ```

4. **Create watering schedule**
   ```bash
   curl -X POST http://localhost:8080/api/v1/modules/pumping/M5STACK001/schedules \
     -H "Content-Type: application/json" \
     -d '{
       "time": "06:00",
       "duration": 300,
       "days": ["Mon", "Wed", "Fri"]
     }'
   ```

## Development

See `firmware/` directory for:

- Arduino sketch (.ino file)
- Platform.io configuration
- Development notes

## Troubleshooting

**Pump not activating:**

- Check relay connections
- Verify 12V power supply
- Test relay manually via M5Stack menu

**No moisture readings:**

- Check Earth Unit connection (Grove port)
- Verify sensor is inserted in soil
- Check sensor calibration values

**MQTT connection issues:**

- Verify Wi-Fi connection
- Check MQTT broker IP and port
- View M5Stack serial output for errors

## Future Enhancements

- [ ] Flow meter integration for actual water volume tracking
- [ ] Multi-zone support (multiple valves per device)
- [ ] Weather API integration (skip watering if rain forecast)
- [ ] Soil moisture trend analysis
- [ ] Adaptive scheduling based on historical data
