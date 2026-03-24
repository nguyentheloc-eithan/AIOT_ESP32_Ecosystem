import React from 'react';
import { Task } from '../lib/pocketbase';

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#fbbf24'; // yellow
      case 'processing':
        return '#3b82f6'; // blue
      case 'done':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '12px',
        }}>
        <div>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '600',
            }}>
            {task.name}
          </h3>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            <span>
              Type: <strong>{task.type}</strong>
            </span>
            <span style={{ margin: '0 8px' }}>•</span>
            <span>
              Device: <strong>{task.device_id}</strong>
            </span>
          </div>
        </div>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: getStatusColor(task.status) + '20',
            color: getStatusColor(task.status),
            textTransform: 'uppercase',
          }}>
          {task.status}
        </span>
      </div>

      {task.payload && Object.keys(task.payload).length > 0 && (
        <div
          style={{
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
          <strong>Payload:</strong> {JSON.stringify(task.payload)}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        <div>Scheduled: {formatDate(task.scheduled_at)}</div>
        {task.started_at && <div>Started: {formatDate(task.started_at)}</div>}
        {task.completed_at && (
          <div>Completed: {formatDate(task.completed_at)}</div>
        )}
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
          Delete
        </button>
      )}
    </div>
  );
};

export default TaskCard;
