package main

import (
	"fmt"
	"time"

	"github.com/go-resty/resty/v2"
)

type Task struct {
	ID      string                 `json:"id"`
	Name    string                 `json:"name"`
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
	Status  string                 `json:"status"`
}

// ================== CONFIG ==================
var pbURL = "http://127.0.0.1:8090/api"

// ================== MAIN ==================
func main() {
	fmt.Println("🚀 Worker started...")

	for {
		pollTasks()
		time.Sleep(5 * time.Second)
	}
}

// ================== POLL TASK ==================
func pollTasks() {
	client := resty.New()

	var tasks []Task

	resp, err := client.R().
		SetQueryParam("filter", "status='pending'").
		SetResult(&tasks).
		Get(pbURL + "/collections/tasks/records")

	if err != nil {
		fmt.Println("❌ error:", err)
		return
	}

	if resp.IsError() {
		fmt.Println("❌ API error:", resp.Status())
		return
	}

	for _, task := range tasks {
		go handleTask(task)
	}
}

// ================== HANDLE TASK ==================
func handleTask(task Task) {
	fmt.Println("👉 Processing:", task.ID, "-", task.Name)

	updateTaskStatus(task.ID, "processing")

	switch task.Type {

	case "WATER_PLANT":
		durationVal, ok := task.Payload["duration"].(float64)
		if !ok {
			fmt.Println("❌ invalid payload")
			updateTaskStatus(task.ID, "failed")
			return
		}

		duration := int(durationVal)

		fmt.Println("💧 Watering for", duration, "seconds")
		time.Sleep(time.Duration(duration) * time.Second)

	case "NOTIFY":
		fmt.Println("🔔 Send notification")

	default:
		fmt.Println("❌ Unknown task:", task.Type)
		updateTaskStatus(task.ID, "failed")
		return
	}

	updateTaskStatus(task.ID, "done")
}

// ================== UPDATE STATUS ==================
func updateTaskStatus(id, status string) {
	client := resty.New()

	_, err := client.R().
		SetBody(map[string]string{
			"status": status,
		}).
		Patch(pbURL + "/collections/tasks/records/" + id)

	if err != nil {
		fmt.Println("❌ update error:", err)
	}
}