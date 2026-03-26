/**
 * Smart Pumping Plugin
 *
 * Manages pumping tasks and device control
 */

import React, { useState, useEffect } from 'react';
import type { IPlugin, PluginContext } from '../../core/types/plugin';
import TaskCard from '../../components/TaskCard';
import TaskForm from '../../components/TaskForm';
import type { Task } from '../../lib/pocketbase';

interface SmartPumpingProps {
  context: PluginContext;
}

const SmartPumpingComponent: React.FC<SmartPumpingProps> = ({ context }) => {
  const { dataProvider } = context;
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

      const response = await dataProvider.getList<Task>('tasks', {
        page: 1,
        perPage: 50,
        filter: filterQuery,
        sort: '-created',
      });

      setTasks(response.items);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchTasks();

    let unsubscribe: (() => void) | undefined;

    if (dataProvider.subscribe) {
      dataProvider
        .subscribe<Task>('tasks', (event) => {
          console.log('Real-time update:', event.action, event.record);

          if (event.action === 'create') {
            setTasks((prev) => [event.record, ...prev]);
          } else if (event.action === 'update') {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === event.record.id ? event.record : task,
              ),
            );
          } else if (event.action === 'delete') {
            setTasks((prev) =>
              prev.filter((task) => task.id !== event.record.id),
            );
          }
        })
        .then((unsub) => {
          unsubscribe = unsub;
        });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [filter, dataProvider]);

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
        status: 'pending' as const,
        scheduled_at: new Date().toISOString(),
      };

      await dataProvider.create('tasks', data);
      console.log('Task created successfully');
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
      await dataProvider.delete('tasks', taskId);
      console.log('Task deleted successfully');
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

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🌊 Smart Pumping Control</h1>

      {/* Task Creation Form */}
      <TaskForm onSubmit={handleCreateTask} />

      {/* Filter Tabs */}
      <div style={{ margin: '30px 0' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {(['all', 'pending', 'processing', 'done', 'failed'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  background: filter === status ? '#007bff' : 'white',
                  color: filter === status ? 'white' : 'black',
                  cursor: 'pointer',
                  fontWeight: filter === status ? 'bold' : 'normal',
                }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${counts[status]})`}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Dashboard widget (shows summary)
const SmartPumpingWidget: React.FC<SmartPumpingProps> = ({ context }) => {
  const { dataProvider } = context;
  const [taskCount, setTaskCount] = useState({ pending: 0, total: 0 });

  useEffect(() => {
    dataProvider
      .getList<Task>('tasks', { page: 1, perPage: 100 })
      .then((response) => {
        const pending = response.items.filter(
          (t) => t.status === 'pending',
        ).length;
        setTaskCount({ pending, total: response.items.length });
      })
      .catch(console.error);
  }, [dataProvider]);

  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#f9f9f9',
      }}>
      <h3>🌊 Smart Pumping</h3>
      <p>
        Pending Tasks: <strong>{taskCount.pending}</strong>
      </p>
      <p>
        Total Tasks: <strong>{taskCount.total}</strong>
      </p>
    </div>
  );
};

// Plugin definition
export const SmartPumpingPlugin: IPlugin = {
  metadata: {
    id: 'smart-pumping',
    name: 'Smart Pumping',
    version: '1.0.0',
    description: 'Automated watering and irrigation control',
    category: 'smart-pumping',
  },
  config: {
    enabled: true,
    route: '/pumping',
  },
  lifecycle: {
    onRegister: () => {
      console.log('Smart Pumping plugin registered');
    },
    onMount: () => {
      console.log('Smart Pumping plugin mounted');
    },
  },
  component: SmartPumpingComponent,
  dashboardWidget: SmartPumpingWidget,
};
