package services

import "smart-garden-server/internal/models"

type TaskService struct {
	pb *PocketBaseService
}

func NewTaskService(pb *PocketBaseService) *TaskService {
	return &TaskService{pb}
}

func (s *TaskService) CreateTask(task map[string]interface{}) {
	s.pb.Create("tasks", task)
}