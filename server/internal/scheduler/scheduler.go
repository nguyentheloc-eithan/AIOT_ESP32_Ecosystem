package scheduler

import (
	"time"
	"smart-garden-server/internal/models"
)

func ShouldRunNow(s models.Schedule, now time.Time) bool {

	if s.Recurrence == "DAILY" {
		return now.Hour() == s.StartTime.Hour() &&
			now.Minute() == s.StartTime.Minute()
	}

	return false
}