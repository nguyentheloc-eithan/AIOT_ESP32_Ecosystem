# Smart Plugs Module

Remote-controlled power outlets with automation rules and energy consumption monitoring.

## Overview

The Smart Plugs module enables:

- Remote on/off control via web app or API
- Real-time energy consumption tracking (kWh)
- Automation rules based on time, sensor values, or manual triggers
- Usage history and cost estimation per plug
- Overload protection and automatic cutoff

## Hardware Requirements

| Component                   | Qty | Purpose                    |
| --------------------------- | --- | -------------------------- |
| M5Stack Core2 / AtomS3      | 1   | Main controller            |
| Relay Unit                  | 1-4 | Switches AC power on/off   |
| Current Sensor (ACS712 30A) | 1-4 | Measures power consumption |
| AC Socket                   | 1-4 | Power outlet               |
| Enclosure (rated for mains) | 1   | Safety housing             |

⚠️ **SAFETY WARNING:** Working with mains voltage (110V/220V AC) is dangerous. Only qualified electricians should wire AC components. Improper wiring can cause fire, shock, or death.

**Wiring Diagram:** See `/hardware/schematics/smart-plugs/`

## Firmware

The firmware provides:

1. Subscribe to on/off commands via MQTT
2. Control relay states for each plug
3. Monitor current consumption per plug
4. Calculate and publish energy usage (W, kWh)
5. Display current status on M5Stack screen

### Topics

**Subscribe:**

- `aiot/devices/{device_id}/command` - On/off commands

**Publish:**

- `aiot/devices/{device_id}/status` - Plug state and power usage
- `aiot/devices/{device_id}/telemetry` - Energy consumption data
- `aiot/devices/{device_id}/alert` - Overload alerts

### Command Format

```json
{
  "action": "plug",
  "plug_id": 1, // Which plug (1-4)
  "state": "on" // "on" or "off"
}
```

### Status Format

```json
{
  "device_id": "M5STACK003",
  "timestamp": "2026-03-24T10:30:00Z",
  "plugs": [
    {
      "plug_id": 1,
      "state": "on",
      "current": 2.5, // Amperes
      "voltage": 220, // Volts
      "power": 550, // Watts
      "consumption": 1.2 // kWh (cumulative)
    },
    {
      "plug_id": 2,
      "state": "off",
      "current": 0,
      "voltage": 220,
      "power": 0,
      "consumption": 0.8
    }
  ],
  "total_power": 550,
  "total_consumption": 2.0
}
```

### Alert Format

```json
{
  "device_id": "M5STACK003",
  "plug_id": 1,
  "alert_type": "overload",
  "current": 28.5,
  "limit": 25,
  "action": "auto_cutoff",
  "timestamp": "2026-03-24T10:30:00Z"
}
```

## Backend Integration

The backend provides REST API endpoints for:

- `POST /api/v1/modules/plugs/:deviceId/on` - Turn plug on
- `POST /api/v1/modules/plugs/:deviceId/off` - Turn plug off
- `GET /api/v1/modules/plugs/:deviceId/status` - Get current status
- `GET /api/v1/modules/plugs/:deviceId/energy` - Get energy usage history

## Database Schema

### Plug States Table

| Field      | Type      | Description       |
| ---------- | --------- | ----------------- |
| id         | string    | Unique state ID   |
| device_id  | string    | M5Stack device ID |
| plug_id    | integer   | Plug number (1-4) |
| state      | string    | "on" or "off"     |
| updated_at | timestamp | Last state change |

### Energy Logs Table

| Field       | Type      | Description                |
| ----------- | --------- | -------------------------- |
| id          | string    | Unique log ID              |
| device_id   | string    | M5Stack device ID          |
| plug_id     | integer   | Plug number (1-4)          |
| timestamp   | timestamp | When measurement was taken |
| current     | float     | Current in Amperes         |
| voltage     | float     | Voltage in Volts           |
| power       | float     | Power in Watts             |
| consumption | float     | Cumulative kWh             |

### Automation Rules Table

| Field         | Type    | Description                |
| ------------- | ------- | -------------------------- |
| id            | string  | Unique rule ID             |
| device_id     | string  | M5Stack device ID          |
| plug_id       | integer | Plug number                |
| trigger_type  | string  | "time", "sensor", "manual" |
| trigger_value | string  | Condition details          |
| action        | string  | "on" or "off"              |
| enabled       | boolean | Active/inactive            |

## Setup Instructions

1. **⚠️ Safety First**
   - Disconnect all power before wiring
   - Use appropriate gauge wire for current rating
   - Ensure proper grounding
   - Test with low voltage first
   - Have work inspected if unsure

2. **Flash firmware to M5Stack**
   - Open `firmware/smart-plugs.ino` in Arduino IDE
   - Update Wi-Fi credentials
   - Update MQTT broker IP
   - Configure number of plugs
   - Upload to device

3. **Wire hardware**
   - Follow wiring diagram carefully
   - Connect relays to M5Stack GPIO
   - Connect current sensors (ACS712)
   - Wire AC circuit through relay contacts
   - Mount in rated enclosure

4. **Register device**

   ```bash
   curl -X POST http://localhost:8080/api/v1/devices \
     -H "Content-Type: application/json" \
     -d '{
       "id": "M5STACK003",
       "name": "Workshop Plugs",
       "type": "smart-plugs",
       "location": "Workshop",
       "plug_count": 4
     }'
   ```

5. **Create automation rule**

   ```bash
   # Turn on at 6 AM
   curl -X POST http://localhost:8080/api/v1/automations \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "M5STACK003",
       "plug_id": 1,
       "trigger_type": "time",
       "trigger_value": "06:00",
       "action": "on"
     }'

   # Turn off at 10 PM
   curl -X POST http://localhost:8080/api/v1/automations \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "M5STACK003",
       "plug_id": 1,
       "trigger_type": "time",
       "trigger_value": "22:00",
       "action": "off"
     }'
   ```

## Energy Monitoring

### Calibration

ACS712 sensors need calibration:

```cpp
// No load (zero current)
int zeroOffset = analogRead(CURRENT_PIN); // e.g., 512

// Known load (e.g., 5A appliance)
int loadReading = analogRead(CURRENT_PIN); // e.g., 612
float sensitivity = (loadReading - zeroOffset) / 5.0; // ~20 per amp

// Calculate current
float current = (analogRead(CURRENT_PIN) - zeroOffset) / sensitivity;
```

### Power Calculation

```cpp
float voltage = 220.0; // or 110.0 for US
float power = voltage * current; // Watts
float energy = power * (interval / 3600000.0); // kWh (interval in ms)
```

### Cost Estimation

```cpp
float costPerKWh = 0.12; // Your local electricity rate
float cost = consumption * costPerKWh;
```

## Automation Examples

**Time-based:**

- Turn on grow lights at 6 AM, off at 8 PM
- Night ventilation (on at sunset, off at sunrise)

**Sensor-based:**

- Turn on heater when temp < 15°C
- Turn on fan when humidity > 80%
- Turn on pump when moisture < 20%

**Manual override:**

- All automations can be overridden manually
- Manual state persists until next automation trigger

## Safety Features

**Overload Protection:**

- Monitor current continuously
- Auto-cutoff if current exceeds limit (default 25A)
- Send alert notification
- Require manual reset

**Fault Detection:**

- Monitor for relay failures
- Detect unexpected state changes
- Alert on abnormal power consumption

**Manual Cutoff:**

- Physical button on M5Stack to disable all plugs
- Emergency stop functionality

## Development

Firmware structure:

```
firmware/
├── smart-plugs.ino           # Main sketch
├── config.h                  # Configuration
├── relays.h                  # Relay control functions
├── current_sensor.h          # Power monitoring
├── mqtt_handler.h            # MQTT communication
├── automation.h              # Rule engine
└── display.h                 # M5Stack display UI
```

## Troubleshooting

**Relay not switching:**

- Check GPIO pin configuration
- Verify relay power supply (some need 5V)
- Test relay manually (jumper wire)
- Check relay LED indicator

**No current reading:**

- Verify ACS712 connection
- Check sensor power (5V)
- Calibrate zero offset
- Test with known load

**Inaccurate power measurement:**

- Recalibrate current sensor
- Verify voltage setting (110V vs 220V)
- Check for electromagnetic interference
- Use shielded cables

**Unexpected state changes:**

- Check for electrical noise
- Add debouncing in code
- Inspect relay contacts
- Verify MQTT command source

## Future Enhancements

- [ ] PID control for heaters/coolers
- [ ] Power factor measurement
- [ ] Historical power usage graphs
- [ ] Smart scheduling (learn usage patterns)
- [ ] Integration with weather API
- [ ] Voice control (Alexa, Google Home)
- [ ] Energy goal tracking and recommendations
- [ ] Multi-plug scenes (preset combinations)

## Legal & Safety Disclaimer

⚠️ This module involves working with potentially lethal mains voltage. The developers assume NO LIABILITY for injury, death, fire, or property damage resulting from the construction or use of this module.

- Only qualified electricians should perform mains wiring
- Comply with all local electrical codes
- Use proper safety equipment
- Test thoroughly before live use
- Obtain necessary permits if required

**DO NOT PROCEED unless you are qualified and understand the risks.**
