/**
 * Main Application Component
 *
 * Sets up the plugin system and routing
 */

import React, { useState, useEffect } from 'react';
import { pluginRegistry } from './core/plugin-registry';
import { PocketBaseProvider } from './core/providers/pocketbase-provider';
import { IDataProvider } from './core/types/data-provider';
import { IPlugin } from './core/types/plugin';
import { PluginContainer } from './components/PluginContainer';
import { Dashboard } from './components/Dashboard';

// Import all plugins
import {
  SmartPumpingPlugin,
  SmartSensingPlugin,
  SmartPlugsPlugin,
} from './plugins';

import './App.css';

function App() {
  const [dataProvider] = useState<IDataProvider>(
    () => new PocketBaseProvider(),
  );
  const [currentView, setCurrentView] = useState<'dashboard' | string>(
    'dashboard',
  );
  const [plugins, setPlugins] = useState<IPlugin[]>([]);

  // Register all plugins on mount
  useEffect(() => {
    // Register plugins
    pluginRegistry.register(SmartPumpingPlugin);
    pluginRegistry.register(SmartSensingPlugin);
    pluginRegistry.register(SmartPlugsPlugin);

    // Get all enabled plugins
    const enabledPlugins = pluginRegistry.getEnabledPlugins();
    setPlugins(enabledPlugins);

    console.log(
      `Registered ${enabledPlugins.length} plugins:`,
      enabledPlugins.map((p) => p.metadata.name),
    );

    // Cleanup on unmount
    return () => {
      pluginRegistry.clear();
    };
  }, []);

  const currentPlugin = plugins.find(
    (p) => p.config?.route === `/${currentView}`,
  );

  return (
    <div className="app">
      {/* Navigation */}
      <nav
        style={{
          background: '#2c3e50',
          padding: '15px 20px',
          color: 'white',
        }}>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
          }}>
          <h2 style={{ margin: 0 }}>🌱 Smart Garden</h2>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background:
                  currentView === 'dashboard' ? '#3498db' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontWeight: currentView === 'dashboard' ? 'bold' : 'normal',
              }}>
              Dashboard
            </button>
            {plugins.map((plugin) => {
              const viewName = plugin.config?.route?.replace('/', '') || '';
              return (
                <button
                  key={plugin.metadata.id}
                  onClick={() => setCurrentView(viewName)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    background:
                      currentView === viewName ? '#3498db' : 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: currentView === viewName ? 'bold' : 'normal',
                  }}>
                  {plugin.metadata.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'dashboard' ? (
          <Dashboard
            plugins={plugins}
            dataProvider={dataProvider}
          />
        ) : currentPlugin ? (
          <PluginContainer
            plugin={currentPlugin}
            dataProvider={dataProvider}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Page not found</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
