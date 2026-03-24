package taskhandler

import (
	"encoding/json"
	"fmt"
	"log"
	"smart_garden_server/internal/mqtt"
	"smart_garden_server/internal/pb"
	"time"
)

// Task represents a task from PocketBase
type Task struct {
	ID          string                 `json:"id"`
	DeviceID    string                 `json:"device_id"`
	Name        string                 `json:"name"`
	Type        string                 `json:"type"`
	Status      string                 `json:"status"`
	Payload     map[string]interface{} `json:"payload"`
	ScheduledAt string                 `json:"scheduled_at"`
	StartedAt   string                 `json:"started_at"`
	CompletedAt string                 `json:"completed_at"`
	Created     string                 `json:"created"`
	Updated     string                 `json:"updated"`
}

// TaskHandler manages task processing
type TaskHandler struct {
	pbClient   *pb.Client
	mqttClient *mqtt.Client
	stopChan   chan bool
}

// NewTaskHandler creates a new task handler
func NewTaskHandler(pbClient *pb.Client, mqttClient *mqtt.Client) *TaskHandler {
	return &TaskHandler{
		pbClient:   pbClient,
		mqttClient: mqttClient,
		stopChan:   make(chan bool),
	}
}

// Start begins processing tasks
func (th *TaskHandler) Start() {
	log.Println("🔄 Task Handler started")

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			th.processPendingTasks()
		case <-th.stopChan:
			log.Println("👋 Task Handler stopped")
			return
		}
	}
}

// Stop stops the task handler
func (th *TaskHandler) Stop() {
	th.stopChan <- true
}

// processPendingTasks fetches and processes pending tasks
func (th *TaskHandler) processPendingTasks() {
	tasks, err := th.fetchPendingTasks()
	if err != nil {
		log.Printf("❌ Error fetching tasks: %v", err)
		return
	}

	if len(tasks) == 0 {
		return
	}

	log.Printf("📋 Found %d pending task(s)", len(tasks))

	for _, task := range tasks {
		go th.processTask(task)
	}
}

// fetchPendingTasks gets pending tasks from PocketBase
func (th *TaskHandler) fetchPendingTasks() ([]Task, error) {
	// Fetch tasks with status 'pending'
	filter := "status = 'pending'"
	
	items, err := th.pbClient.GetTasks(filter, 1, 10)
	if err != nil {
		return nil, err
	}

	tasks := make([]Task, 0, len(items))
	for _, item := range items {
		task := Task{}
		
		// Map fields from PocketBase response
		if id, ok := item["id"].(string); ok {
			task.ID = id
		}
		if deviceID, ok := item["device_id"].(string); ok {
			task.DeviceID = deviceID
		}
		if name, ok := item["name"].(string); ok {
			task.Name = name
		}
		if taskType, ok := item["type"].(string); ok {
			task.Type = taskType
		}
		if status, ok := item["status"].(string); ok {
			task.Status = status
		}
		if payload, ok := item["payload"].(map[string]interface{}); ok {
			task.Payload = payload
		}
		if scheduledAt, ok := item["scheduled_at"].(string); ok {
			task.ScheduledAt = scheduledAt
		}
		if startedAt, ok := item["started_at"].(string); ok {
			task.StartedAt = startedAt
		}
		if completedAt, ok := item["completed_at"].(string); ok {
			task.CompletedAt = completedAt
		}
		if created, ok := item["created"].(string); ok {
			task.Created = created
		}
		if updated, ok := item["updated"].(string); ok {
			task.Updated = updated
		}
		
		tasks = append(tasks, task)
	}

	return tasks, nil
}

// processTask processes a single task
func (th *TaskHandler) processTask(task Task) {
	log.Printf("👉 Processing task: %s - %s (Type: %s)", task.ID, task.Name, task.Type)

	// Update status to processing
	if err := th.updateTaskStatus(task.ID, "processing"); err != nil {
		log.Printf("❌ Failed to update task status: %v", err)
		return
	}

	// Set started_at timestamp
	th.updateTaskTimestamp(task.ID, "started_at", time.Now().Format(time.RFC3339))

	// Process based on task type
	var err error
	switch task.Type {
	case "WATER_PLANT":
		err = th.handleWaterPlant(task)
	case "MANUAL_PUMP_ON":
		err = th.handleManualPumpOn(task)
	case "MANUAL_PUMP_OFF":
		err = th.handleManualPumpOff(task)
	case "SCHEDULE_WATERING":
		err = th.handleScheduleWatering(task)
	default:
		log.Printf("❌ Unknown task type: %s", task.Type)
		th.updateTaskStatus(task.ID, "failed")
		return
	}

	// Update task status based on result
	if err != nil {
		log.Printf("❌ Task failed: %v", err)
		th.updateTaskStatus(task.ID, "failed")
	} else {
		log.Printf("✅ Task completed: %s", task.ID)
		th.updateTaskStatus(task.ID, "done")
	}

	// Set completed_at timestamp
	th.updateTaskTimestamp(task.ID, "completed_at", time.Now().Format(time.RFC3339))
}

// handleWaterPlant handles WATER_PLANT task
func (th *TaskHandler) handleWaterPlant(task Task) error {
	duration, ok := task.Payload["duration"].(float64)
	if !ok {
		return fmt.Errorf("invalid duration in payload")
	}

	log.Printf("💧 Watering plant for %d seconds", int(duration))

	// Publish MQTT command to device
	topic := fmt.Sprintf("aiot/devices/%s/command", task.DeviceID)
	command := map[string]interface{}{
		"action":   "pump",
		"state":    "on",
		"duration": int(duration),
	}

	payload, _ := json.Marshal(command)
	if th.mqttClient != nil {
		if err := th.mqttClient.Publish(topic, payload); err != nil {
			return fmt.Errorf("MQTT publish failed: %v", err)
		}
	} else {
		log.Println("⚠️  MQTT client not available (dev mode)")
	}

	// Simulate watering duration (in production, device handles this)
	time.Sleep(time.Duration(duration) * time.Second)

	return nil
}

// handleManualPumpOn handles MANUAL_PUMP_ON task
func (th *TaskHandler) handleManualPumpOn(task Task) error {
	duration, ok := task.Payload["duration"].(float64)
	if !ok {
		duration = 30 // Default 30 seconds
	}

	log.Printf("🔛 Turning pump ON for %d seconds", int(duration))

	topic := fmt.Sprintf("aiot/devices/%s/command", task.DeviceID)
	command := map[string]interface{}{
		"action":   "pump",
		"state":    "on",
		"duration": int(duration),
	}

	payload, _ := json.Marshal(command)
	if th.mqttClient != nil {
		return th.mqttClient.Publish(topic, payload)
	}

	log.Println("⚠️  MQTT client not available (dev mode)")
	return nil
}

// handleManualPumpOff handles MANUAL_PUMP_OFF task
func (th *TaskHandler) handleManualPumpOff(task Task) error {
	log.Printf("🔴 Turning pump OFF")

	topic := fmt.Sprintf("aiot/devices/%s/command", task.DeviceID)
	command := map[string]interface{}{
		"action": "pump",
		"state":  "off",
	}

	payload, _ := json.Marshal(command)
	if th.mqttClient != nil {
		return th.mqttClient.Publish(topic, payload)
	}

	log.Println("⚠️  MQTT client not available (dev mode)")
	return nil
}

// handleScheduleWatering handles SCHEDULE_WATERING task
func (th *TaskHandler) handleScheduleWatering(task Task) error {
	// This would create a recurring schedule
	// For now, just log it
	log.Printf("📅 Schedule watering task created: %s", task.Name)
	return nil
}

// updateTaskStatus updates the status of a task
func (th *TaskHandler) updateTaskStatus(taskID, status string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	return th.pbClient.UpdateTask(taskID, updates)
}

// updateTaskTimestamp updates a timestamp field for a task
func (th *TaskHandler) updateTaskTimestamp(taskID, field, timestamp string) error {
	updates := map[string]interface{}{
		field: timestamp,
	}
	return th.pbClient.UpdateTask(taskID, updates)
}
