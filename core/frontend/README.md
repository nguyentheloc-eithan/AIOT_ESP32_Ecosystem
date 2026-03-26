# Smart Garden Frontend

A modular, plugin-based frontend application for managing smart garden devices and automation.

## 🎯 Features

- **Modular Plugin Architecture**: Each module (pumping, sensing, plugs) is an independent plugin
- **Backend Agnostic**: Swap backends without changing plugin code (PocketBase, REST API, GraphQL, etc.)
- **Type-Safe**: Full TypeScript support throughout
- **Real-time Updates**: Built-in subscription support for live data
- **Dashboard**: Overview of all modules in one place
- **Extensible**: Easy to add new plugins and features

## 🏗️ Architecture

### Plugin System

The frontend uses a sophisticated plugin system that allows modules to be:

- **Independent**: Each plugin is self-contained
- **Hot-swappable**: Enable/disable plugins without rebuilding
- **Reusable**: Share plugins across projects
- **Type-safe**: Full TypeScript interfaces

### Data Provider Abstraction

All backend communication goes through a unified `IDataProvider` interface:

- Switch backends without changing plugin code
- Built-in providers for PocketBase and REST APIs
- Easy to create custom providers for any backend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PocketBase server running (or any compatible backend)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env
# Edit .env with your settings
```

### Environment Variables

Create a `.env` file:

```env
VITE_POCKETBASE_URL=http://localhost:8090
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── core/                          # Core plugin system
│   ├── types/
│   │   ├── plugin.ts             # Plugin interfaces
│   │   └── data-provider.ts      # Data provider interfaces
│   ├── providers/
│   │   ├── pocketbase-provider.ts # PocketBase implementation
│   │   └── rest-api-provider.ts   # REST API implementation
│   ├── plugin-registry.ts         # Plugin management
│   └── index.ts
├── plugins/                       # Plugin modules
│   ├── smart-pumping/            # Irrigation control
│   ├── smart-sensing/            # Sensor monitoring
│   ├── smart-plugs/              # Power management
│   └── index.ts
├── components/                    # Shared components
│   ├── PluginContainer.tsx       # Plugin wrapper
│   ├── Dashboard.tsx             # Dashboard view
│   ├── TaskCard.tsx              # Task display
│   └── TaskForm.tsx              # Task creation
├── lib/                          # Utilities
│   └── pocketbase.ts             # PocketBase client
├── App.tsx                       # Main application
└── main.tsx                      # Entry point
```

## 🔌 Plugin System

Each module is an independent plugin. To create a new plugin:

```typescript
// src/plugins/my-plugin/index.tsx
import { IPlugin, PluginContext } from '../../core/types/plugin';

const MyPluginComponent: React.FC<{ context: PluginContext }> = ({ context }) => {
  const { dataProvider } = context;

  // Use dataProvider for all backend operations
  const fetchData = async () => {
    const items = await dataProvider.getList('my_collection', {
      page: 1,
      perPage: 50,
    });
  };

  return <div><h1>My Plugin</h1></div>;
};

export const MyPlugin: IPlugin = {
  metadata: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'My custom plugin',
  },
  config: { enabled: true, route: '/my-plugin' },
  component: MyPluginComponent,
};
```

Register in `App.tsx`:

```typescript
pluginRegistry.register(MyPlugin);
```

## 🎨 Available Plugins

### Smart Pumping

- Manage watering tasks
- Schedule irrigation
- Monitor pump status
- Real-time task updates

### Smart Sensing

- View sensor data
- Monitor environmental conditions
- Track sensor status

### Smart Plugs

- Control power outlets
- Monitor power consumption
- Remote device control

## 🔄 Data Provider Interface

All plugins interact with backends through the `IDataProvider` interface:

```typescript
interface IDataProvider {
  getOne<T>(collection: string, id: string): Promise<T>;
  getList<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<PaginatedResponse<T>>;
  create<T>(collection: string, data: Partial<T>): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<boolean>;
  subscribe?<T>(
    collection: string,
    callback: SubscriptionCallback<T>,
  ): Promise<UnsubscribeFn>;
}
```

### Switching Backends

```typescript
// PocketBase (default)
const dataProvider = new PocketBaseProvider('http://localhost:8090');

// REST API
const dataProvider = new RestApiProvider({
  baseUrl: 'https://api.example.com',
  headers: { Authorization: 'Bearer token' },
});

// Custom provider
class MyProvider implements IDataProvider {
  /* ... */
}
const dataProvider = new MyProvider();
```

## 📚 Documentation

- [Plugin System Guide](./PLUGIN_SYSTEM.md) - Detailed plugin system documentation
- [Data Provider Guide](./DATA_PROVIDER_GUIDE.md) - Creating custom data providers

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Real-time Updates

The system uses real-time subscriptions through the data provider:

```typescript
const unsubscribe = await dataProvider.subscribe('tasks', (event) => {
  if (event.action === 'create') {
    // Handle new record
  } else if (event.action === 'update') {
    // Handle update
  }
});

// Cleanup on unmount
return () => {
  pb.collection('tasks').unsubscribe('*');
};
```

## 🐛 Troubleshooting

### PocketBase Connection Failed

- Ensure PocketBase is running: `cd server/pocketbase && ./pocketbase serve`
- Check `VITE_POCKETBASE_URL` in `.env`
- Open browser console for detailed errors

### Tasks Not Appearing

- Check PocketBase migrations are applied
- Verify tasks collection exists in PocketBase Admin UI
- Check network tab for API errors

### Real-time Updates Not Working

- Ensure WebSocket connection is established (check browser console)
- PocketBase needs to be running on HTTP (not HTTPS in dev)
- Check CORS settings in PocketBase

## 📱 Future Enhancements

- [ ] Add authentication with PocketBase
- [ ] Implement device management page
- [ ] Add charts and analytics (Chart.js/Recharts)
- [ ] Create Smart Sensing module dashboard
- [ ] Create Smart Plugs module dashboard
- [ ] PWA support for mobile devices
- [ ] Dark mode
- [ ] Multi-language support

## 🧪 Testing

```bash
# Run tests (when test suite is added)
npm test

# E2E tests (when Playwright/Cypress is added)
npm run test:e2e
```

## 🚢 Production Build

```bash
npm run build
```

Output will be in `dist/` folder. Serve with any static file server:

```bash
npm run preview    # Preview locally
# Or use nginx, Apache, Vercel, Netlify, etc.
```

## 📚 Related Documentation

- [Backend README](../backend/README.md)
- [Smart Pumping Module](../../modules/smart-pumping/README.md)
- [API Reference](../../docs/api-reference.md)
- [Architecture](../../docs/architecture.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - See [LICENSE](../../LICENSE) for details
