package main

import (
	"log"
	"os"
	"os/signal"
	"smart_garden_server/config"
	"smart_garden_server/internal/api"
	"smart_garden_server/internal/mqtt"
	"smart_garden_server/internal/pb"
	"smart_garden_server/internal/taskhandler"
	"syscall"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
	}))

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

	// Initialize and start task handler
	taskHandler := taskhandler.NewTaskHandler(pbClient, mqttClient)
	go taskHandler.Start()
	log.Println("✅ Task Handler started")

	// Graceful shutdown handler
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// Health check
	e.GET("/health", func(c *echo.Context) error {
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

	// Start server in a goroutine
	go func() {
		if err := e.Start(":" + port); err != nil {
			log.Printf("Server error: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	<-quit
	log.Println("\n👋 Shutting down gracefully...")

	// Stop task handler
	taskHandler.Stop()
	log.Println("✅ Task Handler stopped")

	log.Println("✅ Server stopped")
}