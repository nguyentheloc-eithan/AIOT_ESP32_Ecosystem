package api

import (
	"encoding/json"
	"net/http"
	"smart_garden_server/internal/mqtt"
	"smart_garden_server/internal/pb"

	"github.com/labstack/echo/v5"
)

// ActivatePump activates the pump for a device
func ActivatePump(pbClient *pb.Client, mqttClient *mqtt.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")

		// Parse request body
		var req struct {
			Duration int `json:"duration"` // Duration in seconds
		}
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": "Invalid request body",
			})
		}

		// Publish MQTT command to device
		topic := "aiot/devices/" + deviceID + "/command"
		payload := map[string]interface{}{
			"action":   "pump",
			"duration": req.Duration,
			"state":    "on",
		}

		payloadBytes, _ := json.Marshal(payload)
		if err := mqttClient.Publish(topic, payloadBytes); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to send command to device",
			})
		}

		// TODO: Log the action in PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"action":    "activate",
			"duration":  req.Duration,
			"message":   "Pump activation command sent",
		})
	}
}

// DeactivatePump deactivates the pump for a device
func DeactivatePump(pbClient *pb.Client, mqttClient *mqtt.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")

		// Publish MQTT command to device
		topic := "aiot/devices/" + deviceID + "/command"
		payload := map[string]interface{}{
			"action": "pump",
			"state":  "off",
		}

		payloadBytes, _ := json.Marshal(payload)
		if err := mqttClient.Publish(topic, payloadBytes); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to send command to device",
			})
		}

		// TODO: Log the action in PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"action":    "deactivate",
			"message":   "Pump deactivation command sent",
		})
	}
}

// GetPumpSchedules returns all schedules for a device
func GetPumpSchedules(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")
		// TODO: Fetch schedules from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"schedules": []map[string]interface{}{},
			"message":   "Schedule fetch not yet implemented",
		})
	}
}

// CreatePumpSchedule creates a new schedule
func CreatePumpSchedule(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")
		// TODO: Create schedule in PocketBase
		return c.JSON(http.StatusCreated, map[string]interface{}{
			"device_id": deviceID,
			"message":   "Schedule creation not yet implemented",
		})
	}
}

// UpdatePumpSchedule updates a schedule
func UpdatePumpSchedule(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		scheduleID := c.Param("id")
		// TODO: Update schedule in PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"schedule_id": scheduleID,
			"message":     "Schedule update not yet implemented",
		})
	}
}

// DeletePumpSchedule deletes a schedule
func DeletePumpSchedule(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		scheduleID := c.Param("id")
		// TODO: Delete schedule from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"schedule_id": scheduleID,
			"message":     "Schedule deletion not yet implemented",
		})
	}
}
