package config

type Config struct {
	PocketBaseURL string
	Port          string
}

func LoadConfig() Config {
	return Config{
		PocketBaseURL: "http://127.0.0.1:8090/api",
		Port:          "8080",
	}
}