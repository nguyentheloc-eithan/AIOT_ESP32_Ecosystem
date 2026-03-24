package config

type Config struct {
	Server   ServerConfig
	PocketBase PocketBaseConfig
}

type ServerConfig struct {
	Port string
}

type PocketBaseConfig struct {
	BaseURL string
}