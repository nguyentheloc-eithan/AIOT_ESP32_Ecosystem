package config

import (
	"os"
	"strconv"
)

type Config struct {
	// Server
	Port string
	Env  string

	// PocketBase
	PocketBaseURL string

	// MQTT
	MQTTBroker string
	MQTTPort   string

	// Modules
	DefaultPumpDuration    int
	MoistureAlertThreshold int
	TempMinThreshold       int
	TempMaxThreshold       int
}

func LoadConfig() *Config {
	return &Config{
		// Server
		Port: getEnv("PORT", "8080"),
		Env:  getEnv("BACKEND_ENV", "development"),

		// PocketBase
		PocketBaseURL: getEnv("POCKETBASE_URL", "http://localhost:8090"),

		// MQTT
		MQTTBroker: getEnv("MQTT_HOST", "localhost"),
		MQTTPort:   getEnv("MQTT_PORT", "1883"),

		// Module defaults
		DefaultPumpDuration:    getEnvInt("DEFAULT_PUMP_DURATION", 300),
		MoistureAlertThreshold: getEnvInt("MOISTURE_ALERT_THRESHOLD", 20),
		TempMinThreshold:       getEnvInt("TEMP_MIN_THRESHOLD", 10),
		TempMaxThreshold:       getEnvInt("TEMP_MAX_THRESHOLD", 35),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if valueStr := os.Getenv(key); valueStr != "" {
		if value, err := strconv.Atoi(valueStr); err == nil {
			return value
		}
	}
	return fallback
}