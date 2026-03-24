package main

import (
	"log"
	"os"
	"smart_garden_server/config"
	"smart_garden_server/internal/api"
	"smart_garden_server/internal/mqtt"
	"smart_garden_server/internal/pb"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize Echo
	e := echo.New()
	e.HidePort = false
	e.HideBanner = false

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Initialize PocketBase client
	pbClient := pb.NewClient(cfg.PocketBaseURL)
	log.Printf("✅ PocketBase client initialized: %s", cfg.PocketBaseURL)

	// Initialize MQTT client
	mqttClient, err := mqtt.NewClient(cfg.MQTTBroker, cfg.MQTTPort)
	if err != nil {
		log.Printf("⚠️  Warning: Failed to connect to MQTT broker: %v", err)
		log.Println("📌 Backend will start without MQTT support")
		mqttClient = nil
	} else {
		defer mqttClient.Disconnect()
		log.Printf("✅ MQTT client connected: %s:%s", cfg.MQTTBroker, cfg.MQTTPort)
	}

	// Initialize API routes
	api.RegisterRoutes(e, pbClient, mqttClient)

	// Health check
	e.GET("/health", func(c echo.Context) error {
		health := map[string]interface{}{
			"status":     "healthy",
			"version":    "1.0.0",
			"pocketbase": cfg.PocketBaseURL,
		}

		if mqttClient != nil && mqttClient.IsConnected() {
			health["mqtt"] = "connected"
		} else {
			health["mqtt"] = "disconnected"
		}

		return c.JSON(200, health)
	})

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Println("🚀 AIOT ESP32 Ecosystem Backend Starting...")
	log.Printf("📡 Server listening on :%s", port)
	log.Printf("🌍 Environment: %s", cfg.Env)
	
	if err := e.Start(":" + port); err != nil {
		log.Fatal(err)
	}
}