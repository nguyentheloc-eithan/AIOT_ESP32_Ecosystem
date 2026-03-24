package api

import (
	"net/http"
	"smart_garden_server/internal/pb"

	"github.com/labstack/echo/v5"
)

// GetTelemetry returns telemetry data for a device
func GetTelemetry(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")
		// TODO: Fetch telemetry from PocketBase with pagination
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"telemetry": []map[string]interface{}{},
			"message":   "Telemetry fetch not yet implemented",
		})
	}
}

// GetLatestTelemetry returns the latest telemetry reading
func GetLatestTelemetry(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")
		// TODO: Fetch latest telemetry from PocketBase
		return c.JSON(http.StatusOK, map[string]interface{}{
			"device_id": deviceID,
			"telemetry": nil,
			"message":   "Latest telemetry fetch not yet implemented",
		})
	}
}

// CreateTelemetry creates a new telemetry entry
func CreateTelemetry(pbClient *pb.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		deviceID := c.Param("deviceId")
		
		var req struct {
			Temperature float64 `json:"temperature"`
			Humidity    float64 `json:"humidity"`
			Moisture    int     `json:"moisture"`
		}
		
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": "Invalid request body",
			})
		}

		// TODO: Save telemetry to PocketBase
		return c.JSON(http.StatusCreated, map[string]interface{}{
			"device_id":   deviceID,
			"telemetry":   req,
			"message":     "Telemetry saved (mock)",
		})
	}
}
