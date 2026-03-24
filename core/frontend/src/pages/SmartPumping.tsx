import React, { useState, useEffect } from 'react';
import pb, { type Task } from '../lib/pocketbase';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const SmartPumping: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'processing' | 'done' | 'failed'
  >('all');

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const filterQuery = filter !== 'all' ? `status = '${filter}'` : '';

      const records = await pb.collection('tasks').getList<Task>(1, 50, {
        filter: filterQuery,
        sort: '-created',
      });

      setTasks(records.items);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks. Make sure PocketBase is running.');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchTasks();

    // Subscribe to tasks collection changes
    pb.collection('tasks').subscribe<Task>('*', (e: any) => {
      console.log('Real-time update:', e.action, e.record);

      if (e.action === 'create') {
        setTasks((prev) => [e.record, ...prev]);
      } else if (e.action === 'update') {
        setTasks((prev) =>
          prev.map((task) => (task.id === e.record.id ? e.record : task)),
        );
      } else if (e.action === 'delete') {
        setTasks((prev) => prev.filter((task) => task.id !== e.record.id));
      }
    });

    // Cleanup subscription on unmount
    return () => {
      pb.collection('tasks').unsubscribe('*');
    };
  }, [filter]);

  // Create new task
  const handleCreateTask = async (taskData: {
    device_id: string;
    name: string;
    type: string;
    payload: Record<string, any>;
  }) => {
    try {
      const data = {
        ...taskData,
        status: 'pending',
        scheduled_at: new Date().toISOString(),
      };

      await pb.collection('tasks').create(data);
      console.log('Task created successfully');
      // Real-time subscription will handle adding it to the list
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Check console for details.');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await pb.collection('tasks').delete(taskId);
      console.log('Task deleted successfully');
      // Real-time subscription will handle removing it from the list
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task.');
    }
  };

  // Get task counts by status
  const getTaskCounts = () => {
    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      processing: tasks.filter((t) => t.status === 'processing').length,
      done: tasks.filter((t) => t.status === 'done').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    };
  };

  const counts = getTaskCounts();

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      <header style={{ marginBottom: '32px' }}>
        <h1
          style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          💧 Smart Pumping Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Manage and monitor your watering tasks in real-time
        </p>
      </header>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
        <div
          style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fef3c7',
          }}>
          <div
            style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            {counts.pending}
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>Pending</div>
        </div>
        <div
          style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#dbeafe',
          }}>
          <div
            style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
            {counts.processing}
          </div>
          <div style={{ fontSize: '14px', color: '#1e3a8a' }}>Processing</div>
        </div>
        <div
          style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#d1fae5',
          }}>
          <div
            style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {counts.done}
          </div>
          <div style={{ fontSize: '14px', color: '#064e3b' }}>Done</div>
        </div>
        <div
          style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
          }}>
          <div
            style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
            {counts.failed}
          </div>
          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>Failed</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}>
        {/* Task Form */}
        <div>
          <TaskForm onSubmit={handleCreateTask} />
        </div>

        {/* Task List */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              Tasks
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}>
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="done">Done</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
              }}>
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
              }}>
              No tasks found. Create one to get started!
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div
        style={{
          marginTop: '32px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
        }}>
        🔗 Connected to PocketBase • Real-time updates enabled
      </div>
    </div>
  );
};

export default SmartPumping;
