/**
 * Dashboard Component
 *
 * Shows all plugin widgets in a grid layout
 */

import React from 'react';
import type { IPlugin, PluginContext } from '../core/types/plugin';
import type { IDataProvider } from '../core/types/data-provider';

interface DashboardProps {
  plugins: IPlugin[];
  dataProvider: IDataProvider;
}

export const Dashboard: React.FC<DashboardProps> = ({
  plugins,
  dataProvider,
}) => {
  const pluginsWithWidgets = plugins.filter(
    (plugin) => plugin.dashboardWidget && plugin.config?.enabled !== false,
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🌱 Smart Garden Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Overview of all your smart garden modules
      </p>

      {pluginsWithWidgets.length === 0 ? (
        <p>No dashboard widgets available.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
          {pluginsWithWidgets.map((plugin) => {
            const Widget = plugin.dashboardWidget!;
            const context: PluginContext = {
              dataProvider,
              config: plugin.config || {},
            };

            return (
              <div key={plugin.metadata.id}>
                <Widget context={context} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
