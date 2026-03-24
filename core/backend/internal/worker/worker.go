package worker

import (
	"fmt"
	"time"
)

func (w *Worker) Start() {
	go func() {
		for {
			w.poll()
			time.Sleep(5 * time.Second)
		}
	}()
}

func (w *Worker) handle(task models.Task) {

	w.updateStatus(task.ID, "processing")

	switch task.Type {

	case "WATER_PLANT":
		duration := int(task.Payload["duration"].(float64))

		fmt.Println("Watering...")

		time.Sleep(time.Duration(duration) * time.Second)

	case "NOTIFY":
		fmt.Println("Send notification")
	}

	w.updateStatus(task.ID, "done")
}