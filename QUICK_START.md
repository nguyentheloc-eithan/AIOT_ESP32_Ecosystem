# Smart Pumping Module - Quick Start Guide

This guide will help you test the Smart Pumping module implementation end-to-end.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend)
- Go 1.25+ (for backend)
- MQTTX (optional, for simulating devices)

## Step 1: Start Infrastructure Services

```bash
cd core/infra/docker
docker-compose up -d
```

This starts:

- PocketBase on `http://localhost:8090`
- MQTT Broker on `localhost:1883`

## Step 2: Apply PocketBase Migrations

1. Open PocketBase Admin: `http://localhost:8090/_/`
2. Create an admin account if prompted
3. Go to Settings → Import collections
4. Copy the migration content from `server/pocketbase/pb_migrations/1774321400_smart_pumping_tasks.js`
5. Or manually run migrations:

```bash
cd server/pocketbase
./pocketbase migrate up
```

## Step 3: Start Backend Server

```bash
cd core/backend
go run main.go
```

You should see:

```
✅ PocketBase client initialized: http://localhost:8090
✅ MQTT client connected: localhost:1883
✅ Task Handler started
🚀 AIOT ESP32 Ecosystem Backend Starting...
📡 Server listening on :8080
```

## Step 4: Start Frontend Dashboard

```bash
cd core/frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Step 5: Test the Flow

### A. Create a Task via Dashboard

1. Open `http://localhost:5173` in your browser
2. Fill in the task form:
   - **Task Name**: "Water tomato plants"
   - **Device ID**: "m5stack-001"
   - **Task Type**: "Water Plant"
   - **Duration**: 30 seconds
3. Click "Create Task"

### B. Observe Real-time Updates

You should see:

1. Task appears in dashboard with status "pending" (yellow)
2. Within 5 seconds, backend picks up the task
3. Status changes to "processing" (blue)
4. MQTT command is published to `aiot/devices/m5stack-001/command`
5. After duration, status changes to "done" (green)

Check backend logs:

```
📋 Found 1 pending task(s)
👉 Processing task: ...
💧 Watering plant for 30 seconds
✅ Task completed: ...
```

### C. Check MQTT Messages (Optional)

If you have MQTTX installed:

1. Connect to `localhost:1883`
2. Subscribe to topic: `aiot/devices/+/command`
3. Create a task in the dashboard
4. You should see JSON payload:

```json
{
  "action": "pump",
  "state": "on",
  "duration": 30
}
```

## Testing Different Task Types

### 1. Water Plant (with duration)

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "m5stack-001",
    "name": "Water roses",
    "type": "WATER_PLANT",
    "payload": {
      "duration": 60
    }
  }'
```

### 2. Manual Pump On

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "m5stack-001",
    "name": "Manual pump activation",
    "type": "MANUAL_PUMP_ON",
    "payload": {
      "duration": 10
    }
  }'
```

### 3. Manual Pump Off

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "m5stack-001",
    "name": "Emergency stop",
    "type": "MANUAL_PUMP_OFF",
    "payload": {}
  }'
```

## Verify End-to-End Flow

### 1. Check PocketBase

- Open: `http://localhost:8090/_/`
- Navigate to Collections → tasks
- You should see all created tasks with their status

### 2. Check Backend Health

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "pocketbase": "http://localhost:8090",
  "mqtt": "connected"
}
```

### 3. List All Tasks

```bash
curl http://localhost:8080/api/v1/tasks
```

### 4. Filter Tasks by Status

```bash
# Pending tasks
curl "http://localhost:8080/api/v1/tasks?filter=status='pending'"

# Done tasks
curl "http://localhost:8080/api/v1/tasks?filter=status='done'"
```

## Dev Mode Notes

- **No Authentication**: All API endpoints are open for development
- **Real-time Polling**: Backend polls PocketBase every 5 seconds
- **MQTT Optional**: Backend starts even if MQTT is unavailable
- **Task Processing**: Simulated device execution (sleeps for duration)

## Production Setup (Future)

For production deployment:

1. Enable PocketBase authentication
2. Update task handler to use WebSocket subscriptions instead of polling
3. Configure MQTT TLS/SSL
4. Add proper error handling and retry logic
5. Deploy with proper environment variables

## Troubleshooting

### Frontend can't connect to PocketBase

- Ensure PocketBase is running on port 8090
- Check `.env` file: `VITE_POCKETBASE_URL=http://localhost:8090`
- Check browser console for CORS errors

### Tasks stuck in "pending"

- Check backend logs - task handler should be running
- Verify PocketBase connection
- Check tasks collection exists and has correct schema

### MQTT not working

- Backend will start without MQTT (logs warning)
- Check Docker Compose logs: `docker-compose logs mqtt`
- Verify port 1883 is available

### Real-time updates not working

- Check WebSocket connection in browser DevTools (Network tab)
- PocketBase must be accessible from frontend
- Refresh the page to re-establish connection

## Next Steps

1. **Add Device Firmware**: Flash M5Stack with MQTT client code
2. **Implement Scheduling**: Add cron-like scheduling for recurring tasks
3. **Add Monitoring**: Create telemetry collection and display
4. **Enhance UI**: Add charts, better styling, mobile responsive design
5. **Add Authentication**: Implement user login and multi-tenancy

## Resources

- [PocketBase API Docs](https://pocketbase.io/docs/api-records/)
- [Echo Framework Docs](https://echo.labstack.com/)
- [React PocketBase SDK](https://github.com/pocketbase/js-sdk)
- [M5Stack Docs](https://docs.m5stack.com/)
- [MQTT Protocol](https://mqtt.org/)

---

**Happy Testing! 🚀💧**
