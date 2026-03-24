package pb

import (
	"encoding/json"
	"fmt"

	"github.com/go-resty/resty/v2"
)

// Client wraps PocketBase HTTP client
type Client struct {
	client  *resty.Client
	baseURL string
}

// NewClient creates a new PocketBase client
func NewClient(baseURL string) *Client {
	return &Client{
		client:  resty.New().SetBaseURL(baseURL),
		baseURL: baseURL,
	}
}

// ListResponse represents PocketBase list response
type ListResponse struct {
	Page       int                      `json:"page"`
	PerPage    int                      `json:"perPage"`
	TotalItems int                      `json:"totalItems"`
	TotalPages int                      `json:"totalPages"`
	Items      []map[string]interface{} `json:"items"`
}

// GetTasks fetches tasks with optional filter
func (c *Client) GetTasks(filter string, page int, perPage int) ([]map[string]interface{}, error) {
	var result ListResponse

	resp, err := c.client.R().
		SetQueryParams(map[string]string{
			"filter":  filter,
			"page":    fmt.Sprintf("%d", page),
			"perPage": fmt.Sprintf("%d", perPage),
			"sort":    "created",
		}).
		SetResult(&result).
		Get("/api/collections/tasks/records")

	if err != nil {
		return nil, fmt.Errorf("failed to fetch tasks: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode())
	}

	return result.Items, nil
}

// CreateTask creates a new task
func (c *Client) CreateTask(task map[string]interface{}) (map[string]interface{}, error) {
	var result map[string]interface{}

	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(task).
		SetResult(&result).
		Post("/api/collections/tasks/records")

	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("unexpected status code: %d - %s", resp.StatusCode(), resp.String())
	}

	return result, nil
}

// UpdateTask updates a task by ID
func (c *Client) UpdateTask(id string, updates map[string]interface{}) error {
	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(updates).
		Patch(fmt.Sprintf("/api/collections/tasks/records/%s", id))

	if err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	if resp.StatusCode() != 200 {
		return fmt.Errorf("unexpected status code: %d - %s", resp.StatusCode(), resp.String())
	}

	return nil
}

// DeleteTask deletes a task by ID
func (c *Client) DeleteTask(id string) error {
	resp, err := c.client.R().
		Delete(fmt.Sprintf("/api/collections/tasks/records/%s", id))

	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	if resp.StatusCode() != 204 {
		return fmt.Errorf("unexpected status code: %d - %s", resp.StatusCode(), resp.String())
	}

	return nil
}

// GetDevices fetches all devices
func (c *Client) GetDevices() ([]map[string]interface{}, error) {
	var result ListResponse

	resp, err := c.client.R().
		SetResult(&result).
		Get("/api/collections/devices/records")

	if err != nil {
		return nil, fmt.Errorf("failed to fetch devices: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode())
	}

	return result.Items, nil
}

// CreateLog creates a new log entry
func (c *Client) CreateLog(log map[string]interface{}) error {
	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(log).
		Post("/api/collections/logs/records")

	if err != nil {
		return fmt.Errorf("failed to create log: %w", err)
	}

	if resp.StatusCode() != 200 {
		return fmt.Errorf("unexpected status code: %d - %s", resp.StatusCode(), resp.String())
	}

	return nil
}

// Helper function to convert interface{} to JSON string for payload fields
func ToPayloadJSON(data interface{}) string {
	bytes, _ := json.Marshal(data)
	return string(bytes)
}