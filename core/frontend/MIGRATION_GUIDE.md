# Migration Guide: From Monolithic to Plugin Architecture

This guide helps you migrate existing code to the new plugin-based architecture.

## Quick Overview

**Before (Monolithic):**

- Tightly coupled to PocketBase
- Single-page application
- Hard to extend or modify
- Direct API calls throughout code

**After (Plugin-based):**

- Backend-agnostic data provider
- Modular plugin system
- Easy to add/remove features
- Centralized data access

## Step-by-Step Migration

### Step 1: Understand the Old Code

The old `SmartPumping.tsx` was a standalone page:

```typescript
// OLD: src/pages/SmartPumping.tsx
import pb from '../lib/pocketbase';

const SmartPumping = () => {
  const records = await pb.collection('tasks').getList();
  await pb.collection('tasks').create(data);
  // ... more direct PocketBase calls
};
```

### Step 2: Convert to Plugin

The new plugin-based version:

```typescript
// NEW: src/plugins/smart-pumping/index.tsx
import { IPlugin, PluginContext } from '../../core/types/plugin';

const SmartPumpingComponent = ({ context }: { context: PluginContext }) => {
  const { dataProvider } = context;

  // Backend-agnostic calls
  const records = await dataProvider.getList('tasks');
  await dataProvider.create('tasks', data);
};

export const SmartPumpingPlugin: IPlugin = {
  metadata: { id: 'smart-pumping', name: 'Smart Pumping', version: '1.0.0' },
  component: SmartPumpingComponent,
};
```

### Step 3: Replace Direct API Calls

Find and replace patterns:

| Old Pattern                                        | New Pattern                                              |
| -------------------------------------------------- | -------------------------------------------------------- |
| `pb.collection(X).getList(page, perPage, options)` | `dataProvider.getList(X, { page, perPage, ...options })` |
| `pb.collection(X).getOne(id)`                      | `dataProvider.getOne(X, id)`                             |
| `pb.collection(X).create(data)`                    | `dataProvider.create(X, data)`                           |
| `pb.collection(X).update(id, data)`                | `dataProvider.update(X, id, data)`                       |
| `pb.collection(X).delete(id)`                      | `dataProvider.delete(X, id)`                             |
| `pb.collection(X).subscribe('*', callback)`        | `dataProvider.subscribe(X, callback)`                    |

### Step 4: Update Subscriptions

**Old:**

```typescript
pb.collection('tasks').subscribe<Task>('*', (e: any) => {
  if (e.action === 'create') {
    setTasks([e.record, ...tasks]);
  }
});

return () => {
  pb.collection('tasks').unsubscribe('*');
};
```

**New:**

```typescript
const unsubscribe = await dataProvider.subscribe<Task>('tasks', (event) => {
  if (event.action === 'create') {
    setTasks([event.record, ...tasks]);
  }
});

return () => {
  unsubscribe();
};
```

### Step 5: Migration Checklist

For each existing page/component:

- [ ] Create new plugin folder in `src/plugins/[name]/`
- [ ] Create `index.tsx` implementing `IPlugin`
- [ ] Move component code to plugin component
- [ ] Replace `pb` imports with `context.dataProvider`
- [ ] Update API calls to use data provider methods
- [ ] Add plugin metadata
- [ ] Export plugin from `src/plugins/index.ts`
- [ ] Register plugin in `App.tsx`
- [ ] Test functionality
- [ ] Remove old page file

## Complete Example

### Before: Monolithic Component

```typescript
// src/pages/DeviceList.tsx
import React, { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

interface Device {
  id: string;
  name: string;
  status: string;
}

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const records = await pb.collection('devices').getList<Device>(1, 50, {
          sort: '-created',
        });
        setDevices(records.items);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchDevices();

    pb.collection('devices').subscribe<Device>('*', (e) => {
      if (e.action === 'create') {
        setDevices((prev) => [e.record, ...prev]);
      } else if (e.action === 'update') {
        setDevices((prev) =>
          prev.map((d) => (d.id === e.record.id ? e.record : d))
        );
      }
    });

    return () => {
      pb.collection('devices').unsubscribe('*');
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('devices').delete(id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Devices</h1>
      {devices.map((device) => (
        <div key={device.id}>
          <span>{device.name} - {device.status}</span>
          <button onClick={() => handleDelete(device.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default DeviceList;
```

### After: Plugin-based

```typescript
// src/plugins/device-list/index.tsx
import React, { useState, useEffect } from 'react';
import { IPlugin, PluginContext } from '../../core/types/plugin';

interface Device {
  id: string;
  name: string;
  status: string;
}

const DeviceListComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const { dataProvider } = context;
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const result = await dataProvider.getList<Device>('devices', {
          page: 1,
          perPage: 50,
          sort: '-created',
        });
        setDevices(result.items);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchDevices();

    let unsubscribe: (() => void) | undefined;

    if (dataProvider.subscribe) {
      dataProvider.subscribe<Device>('devices', (event) => {
        if (event.action === 'create') {
          setDevices((prev) => [event.record, ...prev]);
        } else if (event.action === 'update') {
          setDevices((prev) =>
            prev.map((d) => (d.id === event.record.id ? event.record : d))
          );
        }
      }).then((unsub) => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dataProvider]);

  const handleDelete = async (id: string) => {
    try {
      await dataProvider.delete('devices', id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Devices</h1>
      {devices.map((device) => (
        <div key={device.id}>
          <span>{device.name} - {device.status}</span>
          <button onClick={() => handleDelete(device.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export const DeviceListPlugin: IPlugin = {
  metadata: {
    id: 'device-list',
    name: 'Device List',
    version: '1.0.0',
    description: 'Manage all devices',
    category: 'devices',
  },
  config: {
    enabled: true,
    route: '/devices',
  },
  component: DeviceListComponent,
};
```

### Register the Plugin

```typescript
// src/plugins/index.ts
export { DeviceListPlugin } from './device-list';

// src/App.tsx
import { DeviceListPlugin } from './plugins';

useEffect(() => {
  pluginRegistry.register(DeviceListPlugin);
}, []);
```

## Key Changes Summary

1. **Component Props**: Added `{ context: PluginContext }` prop
2. **Data Access**: Changed from `pb.collection()` to `context.dataProvider`
3. **API Methods**: Updated method signatures to match IDataProvider
4. **Subscriptions**: Changed from `subscribe/unsubscribe` to `subscribe` returning unsubscribe function
5. **Plugin Structure**: Wrapped in IPlugin interface with metadata
6. **Registration**: Plugin must be registered in App.tsx

## Testing After Migration

Verify each migrated plugin:

1. **Data Loading**: Does it fetch data correctly?
2. **Create/Update/Delete**: Do mutations work?
3. **Real-time Updates**: Do subscriptions work?
4. **Error Handling**: Are errors caught and displayed?
5. **Type Safety**: No TypeScript errors?
6. **UI Rendering**: Does it display correctly?

## Benefits After Migration

✅ **Backend Flexibility**: Switch from PocketBase to REST API easily  
✅ **Code Organization**: Clear plugin structure  
✅ **Reusability**: Plugins can be shared  
✅ **Testability**: Easier to test with mock providers  
✅ **Scalability**: Add features without touching core  
✅ **Type Safety**: Better TypeScript support

## Troubleshooting

### Issue: TypeScript errors after migration

**Solution**: Ensure you're using the correct types:

```typescript
import { IPlugin, PluginContext } from '../../core/types/plugin';
```

### Issue: Data not loading

**Solution**: Check dataProvider is passed correctly:

```typescript
const { dataProvider } = context;
console.log('DataProvider:', dataProvider);
```

### Issue: Subscriptions not working

**Solution**: Check if provider supports subscriptions:

```typescript
if (dataProvider.subscribe) {
  // Use subscriptions
} else {
  // Fall back to polling
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}
```

### Issue: Plugin not appearing

**Solution**: Verify registration:

```typescript
// In App.tsx
pluginRegistry.register(MyPlugin);
console.log('Registered plugins:', pluginRegistry.getAllPlugins());
```

## Gradual Migration

You don't have to migrate everything at once:

1. **Phase 1**: Set up core plugin system (✅ Done)
2. **Phase 2**: Migrate one plugin (e.g., Smart Pumping) (✅ Done)
3. **Phase 3**: Migrate remaining plugins one by one
4. **Phase 4**: Remove old code
5. **Phase 5**: Add new plugins as needed

The system supports both old and new code during migration!

## Need Help?

- See [PLUGIN_SYSTEM.md](./PLUGIN_SYSTEM.md) for plugin documentation
- See [PLUGIN_EXAMPLES.md](./PLUGIN_EXAMPLES.md) for more examples
- See [DATA_PROVIDER_GUIDE.md](./DATA_PROVIDER_GUIDE.md) for custom providers
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
