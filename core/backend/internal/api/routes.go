package api

import (
	"smart_garden_server/internal/mqtt"
	"smart_garden_server/internal/pb"

	"github.com/labstack/echo/v5"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(e *echo.Echo, pbClient *pb.Client, mqttClient *mqtt.Client) {
	// API v1 group
	api := e.Group("/api/v1")

	// Devices routes
	devices := api.Group("/devices")
	devices.GET("", ListDevices(pbClient))
	devices.GET("/:id", GetDevice(pbClient))
	devices.POST("", CreateDevice(pbClient))
	devices.PUT("/:id", UpdateDevice(pbClient))
	devices.DELETE("/:id", DeleteDevice(pbClient))

	// Modules routes
	modules := api.Group("/modules")

	// Smart Pumping module
	pumping := modules.Group("/pumping")
	pumping.POST("/:deviceId/activate", ActivatePump(pbClient, mqttClient))
	pumping.POST("/:deviceId/deactivate", DeactivatePump(pbClient, mqttClient))
	pumping.GET("/:deviceId/schedules", GetPumpSchedules(pbClient))
	pumping.POST("/:deviceId/schedules", CreatePumpSchedule(pbClient))
	pumping.PUT("/schedules/:id", UpdatePumpSchedule(pbClient))
	pumping.DELETE("/schedules/:id", DeletePumpSchedule(pbClient))

	// Smart Sensing module
	sensing := modules.Group("/sensing")
	sensing.GET("/:deviceId/telemetry", GetTelemetry(pbClient))
	sensing.GET("/:deviceId/telemetry/latest", GetLatestTelemetry(pbClient))
	sensing.POST("/:deviceId/telemetry", CreateTelemetry(pbClient))

	// Smart Plugs module
	plugs := modules.Group("/plugs")
	plugs.POST("/:deviceId/on", TurnPlugOn(pbClient, mqttClient))
	plugs.POST("/:deviceId/off", TurnPlugOff(pbClient, mqttClient))
	plugs.GET("/:deviceId/status", GetPlugStatus(pbClient))
	plugs.GET("/:deviceId/energy", GetEnergyUsage(pbClient))

	// Tasks routes
	tasks := api.Group("/tasks")
	tasks.GET("", ListTasks(pbClient))
	tasks.GET("/:id", GetTask(pbClient))
	tasks.POST("", CreateTask(pbClient))
	tasks.PUT("/:id", UpdateTask(pbClient))
	tasks.DELETE("/:id", DeleteTask(pbClient))

	// Logs routes
	logs := api.Group("/logs")
	logs.GET("", GetLogs(pbClient))
	logs.GET("/:id", GetLog(pbClient))
	logs.POST("", CreateLog(pbClient))
}
