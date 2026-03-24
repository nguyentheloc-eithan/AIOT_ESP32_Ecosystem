package models

type Task struct {
	ID      string                 `json:"id"`
	Name    string                 `json:"name"`
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
	Status  string                 `json:"status"`
	RunAt   string                 `json:"run_at"`
}