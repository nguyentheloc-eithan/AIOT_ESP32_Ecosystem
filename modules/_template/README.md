# Module Template

This is a template for creating new modules in the AIOT ESP32 Ecosystem.

## Quick Start

1. **Copy this directory:**

   ```bash
   cp -r modules/_template modules/my-new-module
   ```

2. **Update this README** with your module details

3. **Create firmware** in `firmware/` directory

4. **Add backend handlers** (optional) if you need custom API endpoints

5. **Document hardware requirements** and wiring diagrams

## Module Structure

```
my-new-module/
├── README.md                 # This file - module documentation
├── firmware/                 # M5Stack firmware
│   ├── my-module.ino        # Main Arduino sketch
│   ├── config.h             # Configuration
│   └── ...                  # Additional code files
├── backend/                  # Backend-specific logic (optional)
│   └── handlers.go          # Custom API handlers
├── schema/                   # Database schema (optional)
│   └── migration.js         # PocketBase migration
└── docs/                     # Additional documentation
    ├── api.md               # API documentation
    ├── hardware.md          # Hardware guide
    └── setup.md             # Setup instructions
```

## Module Documentation Template

Copy and customize the sections below:

---

# [Module Name]

[One-sentence description of what this module does]

## Overview

[2-3 paragraphs explaining:

- What problem this module solves
- Key features and capabilities
- How it fits into the AIOT ecosystem]

## Hardware Requirements

| Component              | Qty | Purpose         |
| ---------------------- | --- | --------------- |
| M5Stack Core2 / AtomS3 | 1   | Main controller |
| [Component 1]          | X   | [Purpose]       |
| [Component 2]          | X   | [Purpose]       |

**Wiring Diagram:** See `/hardware/schematics/[module-name]/`

## Firmware

[Describe what the firmware does]

### MQTT Topics

**Subscribe:**

- `aiot/devices/{device_id}/command` - [What commands]

**Publish:**

- `aiot/devices/{device_id}/telemetry` - [What data]
- `aiot/devices/{device_id}/status` - [What status]

### Command Format

```json
{
  "action": "[action-name]",
  "param1": "value1"
}
```

### Telemetry Format

```json
{
  "device_id": "M5STACK_XXX",
  "timestamp": "2026-03-24T10:30:00Z",
  "sensor1": 123,
  "sensor2": 456
}
```

## Backend Integration

[List API endpoints if this module adds custom routes]

- `GET /api/v1/modules/[module-name]/:deviceId/...` - [Description]
- `POST /api/v1/modules/[module-name]/:deviceId/...` - [Description]

## Database Schema

[Document any new PocketBase collections or fields]

### [Collection Name] Table

| Field     | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | Unique ID         |
| device_id | string | M5Stack device ID |
| ...       | ...    | ...               |

## Setup Instructions

1. **Flash firmware**
   - Open `firmware/[module-name].ino`
   - Update Wi-Fi and MQTT settings
   - Upload to M5Stack

2. **Wire hardware**
   - Follow wiring diagram
   - Connect components to M5Stack

3. **Register device**
   ```bash
   curl -X POST http://localhost:8080/api/v1/devices \
     -H "Content-Type: application/json" \
     -d '{
       "id": "M5STACK_XXX",
       "name": "[Device Name]",
       "type": "[module-name]",
       "location": "[Location]"
     }'
   ```

## Development

[Notes for developers working on this module]

## Troubleshooting

[Common issues and solutions]

## Future Enhancements

- [ ] [Feature 1]
- [ ] [Feature 2]

---

## Module Development Guide

### 1. Define Your Module

**Ask yourself:**

- What specific problem does this solve?
- What sensors/actuators does it use?
- How does it integrate with other modules?

### 2. Design MQTT Communication

**Best practices:**

- Use consistent topic structure: `aiot/devices/{id}/{type}`
- Keep payloads JSON and lightweight
- Include timestamps in telemetry
- Use QoS 0 for telemetry, QoS 1 for commands

**Topic naming:**

```
aiot/
└── devices/
    └── {device_id}/
        ├── command       # Backend → Device
        ├── telemetry     # Device → Backend (data)
        ├── status        # Device → Backend (state)
        └── alert         # Device → Backend (urgent)
```

### 3. Create Firmware

**Required components:**

```cpp
// 1. Wi-Fi connection
WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

// 2. MQTT client
PubSubClient mqttClient(espClient);

// 3. Subscribe to commands
mqttClient.subscribe("aiot/devices/" + deviceId + "/command");

// 4. Publish telemetry
String payload = createTelemetryJSON();
mqttClient.publish("aiot/devices/" + deviceId + "/telemetry", payload);

// 5. Handle disconnections gracefully
if (!mqttClient.connected()) {
  reconnect();
}
```

**Display UI (M5Stack Core2):**

- Show current sensor values
- Display connection status
- Provide manual override buttons
- Include settings menu

### 4. Backend Integration (Optional)

If your module needs custom backend logic:

1. **Create API handler:**

   ```go
   // core/backend/internal/api/mymodule.go
   package api

   func MyModuleAction(pbClient *pb.Client, mqttClient *mqtt.Client) echo.HandlerFunc {
       return func(c echo.Context) error {
           deviceID := c.Param("deviceId")
           // Your logic here
           return c.JSON(http.StatusOK, response)
       }
   }
   ```

2. **Register routes:**
   ```go
   // In core/backend/internal/api/routes.go
   mymodule := modules.Group("/mymodule")
   mymodule.POST("/:deviceId/action", MyModuleAction(pbClient, mqttClient))
   ```

### 5. Database Schema

If you need custom data storage:

1. **Create PocketBase migration:**

   ```javascript
   // core/infra/pocketbase/pb_migrations/123456_mymodule.js
   migrate((db) => {
     const collection = new Collection({
       name: 'my_module_data',
       type: 'base',
       schema: [
         {
           name: 'device_id',
           type: 'text',
           required: true,
         },
         {
           name: 'custom_field',
           type: 'number',
         },
       ],
     });
     return db.saveCollection(collection);
   });
   ```

2. **Access in backend:**
   ```go
   filter := "device_id = '" + deviceID + "'"
   records, err := pbClient.GetRecords("my_module_data", filter)
   ```

### 6. Hardware Documentation

Create wiring diagram showing:

- M5Stack GPIO pins used
- Power requirements
- Sensor/actuator connections
- Safety considerations

**Tools:** Fritzing, KiCad, or even hand-drawn diagrams

### 7. Testing

**Test checklist:**

- [ ] Device connects to Wi-Fi
- [ ] MQTT connection established
- [ ] Commands received and executed
- [ ] Telemetry published correctly
- [ ] Reconnection after network loss
- [ ] Power cycle recovery
- [ ] Multiple devices don't interfere

### 8. Documentation

**Include:**

- Clear README with all sections
- Code comments explaining non-obvious logic
- Example payload formats
- Troubleshooting guide
- Photos of finished hardware

## Integration Checklist

Before submitting your module:

- [ ] README.md complete and follows template
- [ ] Firmware compiles without errors
- [ ] MQTT topics follow naming convention
- [ ] Backend API documented (if added)
- [ ] Database schema migration created (if needed)
- [ ] Wiring diagram created
- [ ] Setup instructions tested
- [ ] Code is commented
- [ ] Safety warnings included (if applicable)
- [ ] Tested with existing modules (no conflicts)

## Contributing Your Module

1. Fork the repository
2. Create your module in `modules/your-module-name/`
3. Test thoroughly
4. Create pull request with:
   - Module description
   - Hardware requirements
   - Setup instructions
   - Photos/videos (optional but appreciated)

## Example Modules

Study existing modules for reference:

- `modules/smart-pumping/` - Actuator control with scheduling
- `modules/smart-sensing/` - Passive data collection
- `modules/smart-plugs/` - Power control with energy monitoring

## Support

Questions about module development?

- Check existing module code
- Join the community forum
- Open an issue on GitHub

---

**Happy Building! 🚀**
