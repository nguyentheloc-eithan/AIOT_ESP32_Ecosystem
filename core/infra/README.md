# Infrastructure Setup

This directory contains the core infrastructure configuration for the AIOT ESP32 Ecosystem.

## Directory Structure

```
infra/
├── docker/              # Docker Compose configuration
│   └── docker-compose.yml
├── mqtt/                # MQTT Broker configuration
│   └── mosquitto.conf
├── pocketbase/          # PocketBase database & auth
│   ├── pb_data/
│   └── pb_migrations/
└── migrations/          # Additional database migrations
```

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- MQTTX (optional, for testing MQTT messages)

### Starting the Infrastructure

1. **Start all services:**

   ```bash
   cd core/infra/docker
   docker-compose up -d
   ```

2. **Check service status:**

   ```bash
   docker-compose ps
   ```

3. **View logs:**

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f mqtt
   docker-compose logs -f pocketbase
   ```

### Stopping Services

```bash
cd core/infra/docker
docker-compose down
```

To remove volumes (delete data):

```bash
docker-compose down -v
```

## Service Details

### MQTT Broker (Eclipse Mosquitto)

- **Port 1883:** Standard MQTT protocol
- **Port 9001:** MQTT over WebSocket (for web clients)
- **Configuration:** `mqtt/mosquitto.conf`

**Connection Details:**

- Host: `localhost` (or your server IP)
- Port: `1883`
- WebSocket Port: `9001`
- Username/Password: Not required (development mode)

**Testing with MQTTX:**

1. Download MQTTX from https://mqttx.app/
2. Connect to `mqtt://localhost:1883`
3. Subscribe to topics: `aiot/#` (all messages)
4. Publish test messages

**Topic Structure:**

```
aiot/
├── devices/{device_id}/
│   ├── telemetry        # Sensor readings
│   ├── command          # Commands to device
│   └── status           # Device status updates
├── modules/
│   ├── pumping/{device_id}/
│   ├── sensing/{device_id}/
│   └── plugs/{device_id}/
└── system/
    └── alerts           # System-wide alerts
```

### PocketBase

- **Port 8090:** Admin UI and REST API
- **Admin UI:** http://localhost:8090/\_/
- **API Base:** http://localhost:8090/api/

**Initial Setup:**

1. Access http://localhost:8090/\_/
2. Create an admin account (first time only)
3. Collections are auto-created from migrations in `pb_migrations/`

**Collections:**

- `tasks` - Background tasks and schedules
- `tenants` - Multi-tenant support
- `tags` - Tagging system for devices/modules
- `logs` - System and device logs

## Development Tips

### MQTT Message Examples

**Publish sensor data:**

```bash
Topic: aiot/devices/M5STACK001/telemetry
Payload: {"temperature": 25.5, "humidity": 65, "moisture": 45}
```

**Send pump command:**

```bash
Topic: aiot/devices/M5STACK001/command
Payload: {"action": "pump", "duration": 30}
```

**Device status:**

```bash
Topic: aiot/devices/M5STACK001/status
Payload: {"online": true, "ip": "192.168.1.100"}
```

### Environment Variables

Create a `.env` file in the `infra/docker` directory:

```env
# MQTT Settings
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_WS_PORT=9001

# PocketBase Settings
POCKETBASE_PORT=8090

# Backend Settings
BACKEND_PORT=8080
```

## Production Deployment

For production deployment:

1. **Enable MQTT authentication:**
   - Uncomment authentication settings in `mqtt/mosquitto.conf`
   - Create password file: `mosquitto_passwd -c password.txt username`

2. **Enable SSL/TLS:**
   - Generate certificates
   - Update `mosquitto.conf` with cert paths
   - Change MQTT port to 8883

3. **Secure PocketBase:**
   - Set strong admin password
   - Enable HTTPS
   - Configure backup strategy

4. **Network Configuration:**
   - Use reverse proxy (Nginx/Traefik)
   - Configure firewall rules
   - Set up proper DNS

## Troubleshooting

### MQTT Connection Issues

```bash
# Check if MQTT port is open
telnet localhost 1883

# View MQTT logs
docker-compose logs mqtt

# Test MQTT with mosquitto_pub/sub
mosquitto_sub -h localhost -t "aiot/#" -v
mosquitto_pub -h localhost -t "aiot/test" -m "Hello"
```

### PocketBase Issues

```bash
# View PocketBase logs
docker-compose logs pocketbase

# Access PocketBase shell
docker exec -it aiot-pocketbase /bin/sh

# Reset PocketBase (WARNING: deletes all data)
docker-compose down
rm -rf ../pocketbase/pb_data/*
docker-compose up -d
```

## Additional Resources

- [Eclipse Mosquitto Documentation](https://mosquitto.org/documentation/)
- [MQTTX Documentation](https://mqttx.app/docs)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
