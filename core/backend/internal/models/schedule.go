package models

import "time"

type Schedule struct {
	ID         string     `json:"id"`
	TaskID     string     `json:"task"`
	StartTime  time.Time  `json:"start_time"`
	Recurrence string     `json:"recurrence"`
	Interval   int        `json:"interval"`
	DaysOfWeek []int      `json:"days_of_week"`
	LastRunAt  *time.Time `json:"last_run_at"`
}