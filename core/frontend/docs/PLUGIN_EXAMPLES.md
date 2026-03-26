# Plugin Development Examples

This guide provides practical examples for common plugin development scenarios.

## Example 1: Simple Read-Only Plugin

A plugin that displays data without any write operations:

```typescript
// src/plugins/device-monitor/index.tsx
import React, { useState, useEffect } from 'react';
import { IPlugin, PluginContext } from '../../core/types/plugin';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  last_seen: string;
}

const DeviceMonitorComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const result = await context.dataProvider.getList<Device>('devices', {
          page: 1,
          perPage: 100,
          sort: '-last_seen',
        });
        setDevices(result.items);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [context.dataProvider]);

  if (loading) return <div>Loading devices...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Device Monitor</h1>
      <div style={{ display: 'grid', gap: '10px' }}>
        {devices.map((device) => (
          <div
            key={device.id}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: device.status === 'online' ? '#e8f5e9' : '#ffebee',
            }}
          >
            <h3>{device.name}</h3>
            <p>Status: {device.status}</p>
            <p>Last seen: {new Date(device.last_seen).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DeviceMonitorPlugin: IPlugin = {
  metadata: {
    id: 'device-monitor',
    name: 'Device Monitor',
    version: '1.0.0',
    description: 'Real-time device status monitoring',
    category: 'monitoring',
  },
  config: {
    enabled: true,
    route: '/devices',
  },
  component: DeviceMonitorComponent,
};
```

## Example 2: CRUD Plugin with Forms

A full CRUD plugin with create, update, and delete operations:

```typescript
// src/plugins/schedule-manager/index.tsx
import React, { useState, useEffect } from 'react';
import { IPlugin, PluginContext } from '../../core/types/plugin';

interface Schedule {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  next_run?: string;
}

const ScheduleManagerComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', cron: '', enabled: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      const result = await context.dataProvider.getList<Schedule>('schedules', {
        page: 1,
        perPage: 100,
      });
      setSchedules(result.items);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();

    // Subscribe to real-time updates
    let unsubscribe: (() => void) | undefined;
    if (context.dataProvider.subscribe) {
      context.dataProvider.subscribe<Schedule>('schedules', (event) => {
        if (event.action === 'create') {
          setSchedules((prev) => [...prev, event.record]);
        } else if (event.action === 'update') {
          setSchedules((prev) =>
            prev.map((s) => (s.id === event.record.id ? event.record : s))
          );
        } else if (event.action === 'delete') {
          setSchedules((prev) => prev.filter((s) => s.id !== event.record.id));
        }
      }).then((unsub) => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [context.dataProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await context.dataProvider.update('schedules', editingId, formData);
      } else {
        await context.dataProvider.create('schedules', formData);
      }
      setFormData({ name: '', cron: '', enabled: true });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setFormData({ name: schedule.name, cron: schedule.cron, enabled: schedule.enabled });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this schedule?')) {
      try {
        await context.dataProvider.delete('schedules', id);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Schedule Manager</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', cron: '', enabled: true });
          }}
          style={{ padding: '10px 20px' }}
        >
          {showForm ? 'Cancel' : 'New Schedule'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Cron Expression:</label>
            <input
              type="text"
              value={formData.cron}
              onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
              required
              placeholder="0 8 * * *"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
              Enabled
            </label>
          </div>
          <button type="submit" style={{ padding: '10px 20px' }}>
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
        {schedules.map((schedule) => (
          <div key={schedule.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>{schedule.name}</h3>
            <p>Cron: {schedule.cron}</p>
            <p>Status: {schedule.enabled ? 'Enabled' : 'Disabled'}</p>
            {schedule.next_run && <p>Next run: {new Date(schedule.next_run).toLocaleString()}</p>}
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleEdit(schedule)} style={{ marginRight: '10px', padding: '5px 15px' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(schedule.id)} style={{ padding: '5px 15px' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ScheduleManagerPlugin: IPlugin = {
  metadata: {
    id: 'schedule-manager',
    name: 'Schedule Manager',
    version: '1.0.0',
    description: 'Manage automated schedules',
    category: 'automation',
  },
  config: {
    enabled: true,
    route: '/schedules',
  },
  component: ScheduleManagerComponent,
};
```

## Example 3: Plugin with Shared State

Plugins can communicate using shared state:

```typescript
// src/plugins/notification-center/index.tsx
import React, { useEffect } from 'react';
import { IPlugin, PluginContext } from '../../core/types/plugin';

const NotificationCenterComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const { sharedState, updateSharedState } = context;
  const notifications = sharedState?.notifications || [];

  // Other plugins can add notifications by calling:
  // context.updateSharedState('notifications', [...prev, newNotification])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div>
          {notifications.map((notif: any, i: number) => (
            <div key={i} style={{ padding: '10px', border: '1px solid #ddd', margin: '10px 0' }}>
              {notif.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NotificationCenterPlugin: IPlugin = {
  metadata: {
    id: 'notification-center',
    name: 'Notification Center',
    version: '1.0.0',
    description: 'Centralized notification system',
  },
  config: {
    enabled: true,
    route: '/notifications',
  },
  component: NotificationCenterComponent,
};
```

## Example 4: Plugin with Settings

A plugin that has its own configuration:

```typescript
// src/plugins/settings-example/index.tsx
import React, { useState } from 'react';
import { IPlugin, PluginContext } from '../../core/types/plugin';

const SettingsExampleComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const settings = context.config.settings || { theme: 'light', refreshRate: 30 };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings Example</h1>
      <p>Theme: {settings.theme}</p>
      <p>Refresh Rate: {settings.refreshRate}s</p>
    </div>
  );
};

const SettingsComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const [settings, setSettings] = useState(context.config.settings || {});

  const handleSave = () => {
    // In a real app, you'd save this to localStorage or backend
    console.log('Saving settings:', settings);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Plugin Settings</h2>
      <div>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Refresh Rate (seconds):
          <input
            type="number"
            value={settings.refreshRate}
            onChange={(e) => setSettings({ ...settings, refreshRate: parseInt(e.target.value) })}
          />
        </label>
      </div>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export const SettingsExamplePlugin: IPlugin = {
  metadata: {
    id: 'settings-example',
    name: 'Settings Example',
    version: '1.0.0',
    description: 'Example plugin with configurable settings',
  },
  config: {
    enabled: true,
    route: '/settings-example',
    settings: {
      theme: 'light',
      refreshRate: 30,
    },
  },
  component: SettingsExampleComponent,
  settingsComponent: SettingsComponent,
};
```

## Example 5: Dashboard Widget Only

A plugin that only provides a dashboard widget:

```typescript
// src/plugins/quick-stats/index.tsx
import React, { useState, useEffect } from 'react';
import { IPlugin, PluginContext } from '../../core/types/plugin';

const QuickStatsWidget: React.FC<{ context: PluginContext }> = ({ context }) => {
  const [stats, setStats] = useState({ devices: 0, tasks: 0, alerts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [devices, tasks, alerts] = await Promise.all([
          context.dataProvider.getList('devices', { page: 1, perPage: 1 }),
          context.dataProvider.getList('tasks', { page: 1, perPage: 1 }),
          context.dataProvider.getList('alerts', { page: 1, perPage: 1 }),
        ]);

        setStats({
          devices: devices.totalItems,
          tasks: tasks.totalItems,
          alerts: alerts.totalItems,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [context.dataProvider]);

  return (
    <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📊 Quick Stats</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.devices}</p>
          <p>Devices</p>
        </div>
        <div>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.tasks}</p>
          <p>Tasks</p>
        </div>
        <div>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.alerts}</p>
          <p>Alerts</p>
        </div>
      </div>
    </div>
  );
};

// No main component needed, only widget
const PlaceholderComponent: React.FC = () => <div>Quick Stats is a widget-only plugin</div>;

export const QuickStatsPlugin: IPlugin = {
  metadata: {
    id: 'quick-stats',
    name: 'Quick Stats',
    version: '1.0.0',
    description: 'Quick statistics overview',
  },
  config: {
    enabled: true,
  },
  component: PlaceholderComponent,
  dashboardWidget: QuickStatsWidget,
};
```

## Tips for Plugin Development

1. **Use TypeScript**: Full type safety helps catch errors early
2. **Error Handling**: Always wrap async operations in try-catch
3. **Real-time Updates**: Use subscriptions for live data when available
4. **Cleanup**: Always return cleanup functions from useEffect
5. **Loading States**: Show loading indicators during data fetching
6. **Responsive Design**: Use flexible layouts (grid, flexbox)
7. **Accessibility**: Add proper labels and ARIA attributes
8. **Performance**: Use React.memo and useMemo for expensive operations
9. **Code Splitting**: Large plugins can be code-split for better performance
10. **Testing**: Write tests for your plugin logic

## Testing Plugins

```typescript
// src/plugins/my-plugin/index.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyPlugin } from './index';

describe('MyPlugin', () => {
  const mockDataProvider = {
    getList: vi.fn(),
    create: vi.fn(),
    // ... other methods
  };

  const mockContext = {
    dataProvider: mockDataProvider,
    config: {},
  };

  it('renders correctly', () => {
    const Component = MyPlugin.component;
    render(<Component context={mockContext} />);
    expect(screen.getByText('My Plugin')).toBeInTheDocument();
  });

  it('fetches data on mount', async () => {
    mockDataProvider.getList.mockResolvedValue({
      items: [],
      page: 1,
      perPage: 50,
      totalItems: 0,
      totalPages: 0,
    });

    const Component = MyPlugin.component;
    render(<Component context={mockContext} />);

    expect(mockDataProvider.getList).toHaveBeenCalledWith('my_collection', expect.any(Object));
  });
});
```
