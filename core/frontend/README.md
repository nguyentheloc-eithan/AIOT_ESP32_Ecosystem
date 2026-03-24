# AIOT ESP32 Ecosystem - Frontend

React-based web dashboard for managing and monitoring the AIOT ESP32 Ecosystem, with a focus on the Smart Pumping module.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PocketBase running on `http://localhost:8090`
- Backend server running on `http://localhost:8080` (optional)

### Installation

1. **Install dependencies**

   ```bash
   cd core/frontend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   VITE_POCKETBASE_URL=http://localhost:8090
   VITE_BACKEND_URL=http://localhost:8080
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## 📦 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 8** - Build tool and dev server
- **PocketBase SDK** - Real-time database client
- **Inline Styles** - Simple styling (can be replaced with Tailwind/MUI later)

## 🏗️ Project Structure

```
src/
├── pages/
│   └── SmartPumping.tsx      # Smart Pumping dashboard page
├── components/
│   ├── TaskCard.tsx           # Task display component
│   └── TaskForm.tsx           # Task creation form
├── lib/
│   └── pocketbase.ts          # PocketBase client setup
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

## 💧 Smart Pumping Dashboard

The Smart Pumping dashboard provides:

- **Real-time Task Monitoring** - See task status updates instantly
- **Task Creation** - Create watering tasks with custom parameters
- **Task Management** - View, filter, and delete tasks
- **Statistics** - See counts by status (pending, processing, done, failed)
- **Live Updates** - PocketBase real-time subscriptions for instant updates

### Task Types

1. **WATER_PLANT** - Water plants for a specific duration
2. **MANUAL_PUMP_ON** - Manually turn pump on
3. **MANUAL_PUMP_OFF** - Manually turn pump off
4. **SCHEDULE_WATERING** - Create recurring watering schedule

### Task Flow

```
Frontend → PocketBase (tasks collection) → Backend Task Handler → MQTT → M5Stack Device
```

1. User creates task in the dashboard
2. Task is saved to PocketBase with status `pending`
3. Backend task handler polls PocketBase for pending tasks
4. Backend processes task and publishes MQTT command
5. M5Stack device receives command and executes action
6. Status updates are reflected in real-time in the dashboard

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

1. **New Component**: Create in `src/components/`
2. **New Page**: Create in `src/pages/`
3. **New Data Type**: Add to `src/lib/pocketbase.ts`

### Real-time Updates

The dashboard uses PocketBase real-time subscriptions:

```typescript
// Subscribe to tasks collection
pb.collection('tasks').subscribe<Task>('*', (e) => {
  if (e.action === 'create') {
    // Handle new task
  } else if (e.action === 'update') {
    // Handle task update
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
