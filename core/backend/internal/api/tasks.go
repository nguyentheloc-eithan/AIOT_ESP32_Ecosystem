package api

import (
	"net/http"
	"smart_garden_server/internal/pb"
	"time"

	"github.com/labstack/echo/v5"
)

// TaskRequest represents the request body for creating/updating tasks
type TaskRequest struct {
	DeviceID    string                 `json:"device_id"`
	Name        string                 `json:"name"`
	Type        string                 `json:"type"`
	Payload     map[string]interface{} `json:"payload"`
	ScheduledAt string                 `json:"scheduled_at,omitempty"`
}

// ListTasks returns all tasks
func ListTasks(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		filter := c.QueryParam("filter")
		
		tasks, err := pbClient.GetTasks(filter, 1, 100)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"tasks": tasks,
			"count": len(tasks),
		})
	}
}

// GetTask returns a specific task
func GetTask(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		taskID := c.Param("id")
		
		// Get single task (using filter)
		tasks, err := pbClient.GetTasks("id = '"+taskID+"'", 1, 1)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}

		if len(tasks) == 0 {
			return c.JSON(http.StatusNotFound, map[string]interface{}{
				"error": "Task not found",
			})
		}

		return c.JSON(http.StatusOK, tasks[0])
	}
}

// CreateTask creates a new task
func CreateTask(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		var req TaskRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "Invalid request body",
			})
		}

		// Validate required fields
		if req.DeviceID == "" || req.Name == "" || req.Type == "" {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "device_id, name, and type are required",
			})
		}

		// Create task data
		task := map[string]interface{}{
			"device_id": req.DeviceID,
			"name":      req.Name,
			"type":      req.Type,
			"status":    "pending",
			"payload":   req.Payload,
		}

		// Add scheduled_at if provided, otherwise set to now
		if req.ScheduledAt != "" {
			task["scheduled_at"] = req.ScheduledAt
		} else {
			task["scheduled_at"] = time.Now().Format(time.RFC3339)
		}

		result, err := pbClient.CreateTask(task)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, result)
	}
}

// UpdateTask updates a task
func UpdateTask(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		taskID := c.Param("id")
		
		var updates map[string]interface{}
		if err := c.Bind(&updates); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "Invalid request body",
			})
		}

		err := pbClient.UpdateTask(taskID, updates)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "Task updated successfully",
			"task_id": taskID,
		})
	}
}

// DeleteTask deletes a task
func DeleteTask(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		taskID := c.Param("id")
		
		err := pbClient.DeleteTask(taskID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": err.Error(),
			})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "Task deleted successfully",
			"task_id": taskID,
		})
	}
}

// GetLogs returns system logs
func GetLogs(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		// TODO: Fetch logs from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"logs":    []map[string]interface{}{},
			"message": "Log listing not yet implemented",
		})
	}
}

// GetLog returns a specific log entry
func GetLog(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		logID := c.Param("id")
		// TODO: Fetch log from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"log_id":  logID,
			"message": "Log fetch not yet implemented",
		})
	}
}

// CreateLog creates a new log entry
func CreateLog(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		// TODO: Create log in PocketBase
		return c.JSON(http.StatusCreated, map[string]interface{}{
			"message": "Log creation not yet implemented",
		})
	}
}
