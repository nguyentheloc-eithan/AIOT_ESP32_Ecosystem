# Frontend Plugin System

A modular, extensible plugin architecture for the Smart Garden frontend. This system allows each module (smart-pumping, smart-sensing, smart-plugs) to function as an independent plugin that can be easily added, removed, or modified without affecting other parts of the application.

## Architecture Overview

The plugin system consists of three main layers:

### 1. Core Plugin System (`src/core/`)

**Plugin Types** (`types/plugin.ts`)

- `IPlugin`: Main plugin interface that all plugins must implement
- `PluginMetadata`: Plugin identification and information
- `PluginContext`: Runtime context provided to plugins
- `PluginLifecycle`: Hooks for plugin lifecycle events

**Plugin Registry** (`plugin-registry.ts`)

- Singleton registry for managing all plugins
- Handles plugin registration, unregistration, and retrieval
- Manages plugin lifecycle hooks

### 2. Data Provider Abstraction (`src/core/providers/`)

**Interface** (`types/data-provider.ts`)

- `IDataProvider`: Universal data access interface
- Supports CRUD operations, pagination, filtering, and real-time subscriptions
- Backend-agnostic design

**Implementations:**

- `PocketBaseProvider`: PocketBase backend integration
- `RestApiProvider`: Generic REST API integration
- Easily extensible for GraphQL, gRPC, etc.

### 3. Plugin Modules (`src/plugins/`)

Each module is a self-contained plugin:

- **Smart Pumping**: Irrigation and watering control
- **Smart Sensing**: Environmental monitoring
- **Smart Plugs**: Power outlet management

## Creating a New Plugin

### Step 1: Define Your Plugin

```typescript
// src/plugins/my-plugin/index.tsx
import { IPlugin, PluginContext } from '../../core/types/plugin';

const MyPluginComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const { dataProvider } = context;

  // Your plugin logic here
  return (
    <div>
      <h1>My Plugin</h1>
      {/* Plugin UI */}
    </div>
  );
};

export const MyPlugin: IPlugin = {
  metadata: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'My awesome plugin',
    category: 'my-category',
  },
  config: {
    enabled: true,
    route: '/my-plugin',
  },
  component: MyPluginComponent,
};
```

### Step 2: Register Your Plugin

```typescript
// src/App.tsx
import { MyPlugin } from './plugins/my-plugin';

useEffect(() => {
  pluginRegistry.register(MyPlugin);
}, []);
```

### Step 3: Export Your Plugin

```typescript
// src/plugins/index.ts
export { MyPlugin } from './my-plugin';
```

## Using the Data Provider

The data provider abstracts all backend communication:

```typescript
const MyComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const { dataProvider } = context;

  // Get a list
  const items = await dataProvider.getList('my_collection', {
    page: 1,
    perPage: 50,
    filter: 'status = "active"',
    sort: '-created',
  });

  // Create a record
  await dataProvider.create('my_collection', { name: 'New Item' });

  // Update a record
  await dataProvider.update('my_collection', 'id', { name: 'Updated' });

  // Delete a record
  await dataProvider.delete('my_collection', 'id');

  // Subscribe to real-time updates
  const unsubscribe = await dataProvider.subscribe('my_collection', (event) => {
    console.log(event.action, event.record);
  });

  return () => unsubscribe();
};
```

## Plugin Lifecycle Hooks

Plugins can implement lifecycle hooks:

```typescript
export const MyPlugin: IPlugin = {
  // ... metadata and config
  lifecycle: {
    onRegister: () => {
      console.log('Plugin registered');
    },
    onMount: () => {
      console.log('Plugin mounted');
    },
    onUnmount: () => {
      console.log('Plugin unmounted');
    },
    onDestroy: () => {
      console.log('Plugin destroyed');
    },
  },
  component: MyComponent,
};
```

## Dashboard Widgets

Plugins can provide a dashboard widget:

```typescript
const MyWidget: React.FC<{ context: PluginContext }> = ({ context }) => {
  return (
    <div>
      <h3>My Plugin Summary</h3>
      <p>Quick stats here</p>
    </div>
  );
};

export const MyPlugin: IPlugin = {
  // ... other config
  dashboardWidget: MyWidget,
};
```

## Switching Data Providers

To use a different backend, simply swap the provider:

```typescript
// Using PocketBase (default)
const dataProvider = new PocketBaseProvider();

// Using REST API
const dataProvider = new RestApiProvider({
  baseUrl: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token',
  },
});

// Using a custom provider
class MyCustomProvider implements IDataProvider {
  // Implement all IDataProvider methods
}
const dataProvider = new MyCustomProvider();
```

## Benefits

✅ **Modularity**: Each plugin is independent and self-contained  
✅ **Flexibility**: Easy to add, remove, or modify plugins  
✅ **Backend Agnostic**: Switch backends without changing plugin code  
✅ **Type Safety**: Full TypeScript support  
✅ **Real-time Support**: Built-in subscription mechanism  
✅ **Scalability**: Add unlimited plugins without core changes  
✅ **Reusability**: Plugins can be shared across projects

## Project Structure

```
src/
├── core/                      # Core plugin system
│   ├── types/
│   │   ├── plugin.ts         # Plugin interfaces
│   │   └── data-provider.ts  # Data provider interfaces
│   ├── providers/
│   │   ├── pocketbase-provider.ts
│   │   └── rest-api-provider.ts
│   ├── plugin-registry.ts    # Plugin registry
│   └── index.ts              # Core exports
├── plugins/                   # Plugin modules
│   ├── smart-pumping/
│   │   └── index.tsx
│   ├── smart-sensing/
│   │   └── index.tsx
│   ├── smart-plugs/
│   │   └── index.tsx
│   └── index.ts              # Plugin exports
├── components/
│   ├── PluginContainer.tsx   # Plugin wrapper
│   └── Dashboard.tsx         # Dashboard view
└── App.tsx                    # Main application
```

## Development Workflow

1. **Create a new plugin** in `src/plugins/your-plugin/`
2. **Implement the IPlugin interface** with your component
3. **Use the dataProvider** from context for all data operations
4. **Register your plugin** in `App.tsx`
5. **Export your plugin** in `src/plugins/index.ts`
6. **Test** your plugin independently

## Next Steps

- Add routing library (React Router) for better navigation
- Implement plugin settings/configuration UI
- Add plugin marketplace/discovery
- Create plugin development CLI tool
- Add inter-plugin communication mechanism
- Implement plugin permissions system
