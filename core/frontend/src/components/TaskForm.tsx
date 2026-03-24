import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (task: {
    device_id: string;
    name: string;
    type: string;
    payload: Record<string, any>;
  }) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [deviceId, setDeviceId] = useState('');
  const [name, setName] = useState('');
  const [taskType, setTaskType] = useState('WATER_PLANT');
  const [duration, setDuration] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deviceId || !name) {
      alert('Please fill in all required fields');
      return;
    }

    const payload: Record<string, any> = {};

    if (taskType === 'WATER_PLANT' || taskType === 'MANUAL_PUMP_ON') {
      payload.duration = duration;
    }

    onSubmit({
      device_id: deviceId,
      name,
      type: taskType,
      payload,
    });

    // Reset form
    setDeviceId('');
    setName('');
    setTaskType('WATER_PLANT');
    setDuration(30);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
      <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
        Create New Task
      </h2>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Task Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Water tomato plants"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Device ID *
        </label>
        <input
          type="text"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="e.g., m5stack-001"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Task Type *
        </label>
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
          <option value="WATER_PLANT">Water Plant</option>
          <option value="MANUAL_PUMP_ON">Manual Pump On</option>
          <option value="MANUAL_PUMP_OFF">Manual Pump Off</option>
          <option value="SCHEDULE_WATERING">Schedule Watering</option>
        </select>
      </div>

      {(taskType === 'WATER_PLANT' || taskType === 'MANUAL_PUMP_ON') && (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: '500',
            }}>
            Duration (seconds)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            min="1"
            max="300"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
      )}

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
        }}>
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
