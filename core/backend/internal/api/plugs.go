package api

import (
	"encoding/json"
	"net/http"
	"smart_garden_server/internal/mqtt"
	"smart_garden_server/internal/pb"

	"github.com/labstack/echo/v5"
)

// TurnPlugOn turns on a smart plug
func TurnPlugOn(pbClient *pb.Client, mqttClient *mqtt.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		deviceID := c.Param("deviceId")

		// Publish MQTT command to device
		topic := "aiot/devices/" + deviceID + "/command"
		payload := map[string]interface{}{
			"action": "plug",
			"state":  "on",
		}

		payloadBytes, _ := json.Marshal(payload)
		if err := mqttClient.Publish(topic, payloadBytes); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to send command to device",
			})
		}

		// TODO: Update plug state in PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"state":     "on",
			"message":   "Plug turned on",
		})
	}
}

// TurnPlugOff turns off a smart plug
func TurnPlugOff(pbClient *pb.Client, mqttClient *mqtt.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		deviceID := c.Param("deviceId")

		// Publish MQTT command to device
		topic := "aiot/devices/" + deviceID + "/command"
		payload := map[string]interface{}{
			"action": "plug",
			"state":  "off",
		}

		payloadBytes, _ := json.Marshal(payload)
		if err := mqttClient.Publish(topic, payloadBytes); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to send command to device",
			})
		}

		// TODO: Update plug state in PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"state":     "off",
			"message":   "Plug turned off",
		})
	}
}

// GetPlugStatus returns the current status of a plug
func GetPlugStatus(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		deviceID := c.Param("deviceId")
		// TODO: Fetch plug status from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"state":     "unknown",
			"message":   "Plug status fetch not yet implemented",
		})
	}
}

// GetEnergyUsage returns energy usage data for a plug
func GetEnergyUsage(pbClient *pb.Client) echo.HandlerFunc {
	return func(c *echo.Context) error {
		deviceID := c.Param("deviceId")
		// TODO: Fetch energy usage from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"usage":     0,
			"unit":      "kWh",
			"message":   "Energy usage fetch not yet implemented",
		})
	}
}
