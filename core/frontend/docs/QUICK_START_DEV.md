# Quick Start: Frontend Plugin System

Get up and running with the Smart Garden frontend plugin system in 5 minutes!

## Prerequisites

- Node.js 18+
- npm or yarn
- PocketBase server running (optional, for default setup)

## Installation

```bash
cd core/frontend
npm install
```

## Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## What You'll See

### 1. Navigation Bar

- Dashboard button
- Smart Pumping button
- Smart Sensing button
- Smart Plugs button

### 2. Dashboard View

- Widget showing task statistics (Smart Pumping)
- Widget showing sensor counts (Smart Sensing)
- Widget showing plug status (Smart Plugs)

### 3. Plugin Views

Click any navigation button to switch to that plugin's full view.

## Project Structure

```
src/
├── core/                  # Plugin system core (don't modify)
├── plugins/               # Your plugins go here
│   ├── smart-pumping/
│   ├── smart-sensing/
│   └── smart-plugs/
├── components/            # Shared components
├── App.tsx               # Main app (register plugins here)
└── main.tsx              # Entry point
```

## Create Your First Plugin

### Step 1: Create Plugin Folder

```bash
mkdir -p src/plugins/my-first-plugin
```

### Step 2: Create Plugin File

```typescript
// src/plugins/my-first-plugin/index.tsx
import React, { useState, useEffect } from 'react';
import type { IPlugin, PluginContext } from '../../core/types/plugin';

// Your plugin component
const MyFirstPluginComponent: React.FC<{ context: PluginContext }> = ({
  context,
}) => {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Example: Fetch data using the data provider
    const fetchData = async () => {
      try {
        // This works with ANY backend!
        const result = await context.dataProvider.getList('tasks', {
          page: 1,
          perPage: 10,
        });
        setMessage(`Found ${result.totalItems} tasks!`);
      } catch (error) {
        setMessage('Error loading data');
      }
    };

    fetchData();
  }, [context.dataProvider]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🚀 My First Plugin</h1>
      <p>{message}</p>
      <p>This plugin is working! 🎉</p>
    </div>
  );
};

// Optional: Dashboard widget
const MyFirstPluginWidget: React.FC<{ context: PluginContext }> = () => {
  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#f9f9f9',
      }}
    >
      <h3>🚀 My First Plugin</h3>
      <p>Status: Active</p>
    </div>
  );
};

// Export your plugin
export const MyFirstPlugin: IPlugin = {
  metadata: {
    id: 'my-first-plugin',
    name: 'My First Plugin',
    version: '1.0.0',
    description: 'My awesome first plugin',
    category: 'custom',
  },
  config: {
    enabled: true,
    route: '/my-plugin',
  },
  component: MyFirstPluginComponent,
  dashboardWidget: MyFirstPluginWidget,
};
```

### Step 3: Export Plugin

```typescript
// src/plugins/index.ts
export { SmartPumpingPlugin } from './smart-pumping';
export { SmartSensingPlugin } from './smart-sensing';
export { SmartPlugsPlugin } from './smart-plugs';
export { MyFirstPlugin } from './my-first-plugin'; // Add this line
```

### Step 4: Register Plugin

```typescript
// src/App.tsx
import {
  SmartPumpingPlugin,
  SmartSensingPlugin,
  SmartPlugsPlugin,
  MyFirstPlugin, // Add this import
} from './plugins';

// Inside the useEffect:
useEffect(() => {
  pluginRegistry.register(SmartPumpingPlugin);
  pluginRegistry.register(SmartSensingPlugin);
  pluginRegistry.register(SmartPlugsPlugin);
  pluginRegistry.register(MyFirstPlugin); // Add this line
  // ...
}, []);
```

### Step 5: See Your Plugin!

1. Save all files
2. The dev server will hot-reload
3. You'll see "My First Plugin" in the navigation
4. Click it to view your plugin
5. Check the dashboard to see your widget

## Common Tasks

### Get Data from Backend

```typescript
// Get a list with pagination
const result = await context.dataProvider.getList('collection', {
  page: 1,
  perPage: 50,
  sort: '-created',
  filter: 'status = "active"',
});

// Get one item
const item = await context.dataProvider.getOne('collection', 'id');

// Create new item
const newItem = await context.dataProvider.create('collection', {
  name: 'New Item',
  status: 'active',
});

// Update item
const updated = await context.dataProvider.update('collection', 'id', {
  status: 'inactive',
});

// Delete item
await context.dataProvider.delete('collection', 'id');
```

### Subscribe to Real-time Updates

```typescript
useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  if (context.dataProvider.subscribe) {
    context.dataProvider
      .subscribe('collection', (event) => {
        if (event.action === 'create') {
          console.log('New item:', event.record);
        } else if (event.action === 'update') {
          console.log('Updated item:', event.record);
        } else if (event.action === 'delete') {
          console.log('Deleted item:', event.record);
        }
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [context.dataProvider]);
```

### Share Data Between Plugins

```typescript
// Plugin A - Set shared data
context.updateSharedState?.('currentUser', { id: '123', name: 'John' });

// Plugin B - Read shared data
const currentUser = context.sharedState?.currentUser;
```

## Switch Backend

### Using PocketBase (Default)

```typescript
// src/App.tsx
import { PocketBaseProvider } from './core/providers/pocketbase-provider';

const [dataProvider] = useState(
  () => new PocketBaseProvider('http://localhost:8090'),
);
```

### Using REST API

```typescript
// src/App.tsx
import { RestApiProvider } from './core/providers/rest-api-provider';

const [dataProvider] = useState(
  () =>
    new RestApiProvider({
      baseUrl: 'https://api.example.com',
      headers: {
        Authorization: 'Bearer your-token',
      },
    }),
);
```

### Using Custom Backend

```typescript
// src/core/providers/my-provider.ts
import type { IDataProvider } from '../types/data-provider';

export class MyCustomProvider implements IDataProvider {
  // Implement all required methods
  async getOne(collection, id) {
    // Your implementation
  }
  // ... etc
}

// src/App.tsx
import { MyCustomProvider } from './core/providers/my-provider';

const [dataProvider] = useState(() => new MyCustomProvider());
```

## Disable a Plugin

```typescript
// src/plugins/my-plugin/index.tsx
export const MyPlugin: IPlugin = {
  // ... metadata
  config: {
    enabled: false, // Plugin won't appear in UI
  },
  // ... rest
};
```

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to any static hosting:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Your own server

## Environment Variables

Create `.env` file:

```env
# PocketBase URL
VITE_POCKETBASE_URL=http://localhost:8090

# Or your REST API
VITE_API_URL=https://api.example.com

# Any other variables
VITE_APP_NAME=Smart Garden
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Next Steps

1. **Read the docs**: Check out [PLUGIN_SYSTEM.md](./PLUGIN_SYSTEM.md)
2. **See examples**: Look at [PLUGIN_EXAMPLES.md](./PLUGIN_EXAMPLES.md)
3. **Understand architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Create custom provider**: See [DATA_PROVIDER_GUIDE.md](./DATA_PROVIDER_GUIDE.md)
5. **Migrate old code**: Follow [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## Troubleshooting

### Port already in use

```bash
# Change port in vite.config.ts or:
npm run dev -- --port 3000
```

### TypeScript errors

```bash
# Check for type errors
npm run build
```

### Plugin not appearing

1. Check plugin is exported in `src/plugins/index.ts`
2. Check plugin is registered in `src/App.tsx`
3. Check `config.enabled` is `true`
4. Check console for errors

### Data not loading

1. Check backend is running
2. Check `VITE_POCKETBASE_URL` in `.env`
3. Check browser console for network errors
4. Check dataProvider is passed to plugin

## Tips

✅ **Start simple**: Create a basic plugin first  
✅ **Use TypeScript**: It catches errors early  
✅ **Check examples**: Look at existing plugins  
✅ **Use dev tools**: Browser console is your friend  
✅ **Read docs**: They have all the details  
✅ **Ask for help**: Check the team chat

## Common Patterns

### Loading State

```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const result = await context.dataProvider.getList('items');
      setData(result.items);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);

if (loading) return <div>Loading...</div>;
```

### Error Handling

```typescript
const [error, setError] = useState<string | null>(null);

try {
  await context.dataProvider.create('items', data);
} catch (err) {
  setError(err.message);
}

{error && <div style={{ color: 'red' }}>{error}</div>}
```

### Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await context.dataProvider.create('items', formData);
    setFormData({}); // Reset form
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## That's It!

You now know how to:

- ✅ Set up the development environment
- ✅ Create a new plugin
- ✅ Use the data provider
- ✅ Subscribe to real-time updates
- ✅ Switch backends
- ✅ Build for production

Happy coding! 🚀

For more details, check the full documentation files in this directory.
