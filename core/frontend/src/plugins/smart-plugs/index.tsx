/**
 * Smart Plugs Plugin
 *
 * Controls smart power outlets and devices
 */

import React, { useState, useEffect } from 'react';
import type { IPlugin, PluginContext } from '../../core/types/plugin';

interface SmartPlug {
  id: string;
  name: string;
  status: 'on' | 'off';
  power_consumption?: number; // watts
  location?: string;
  created: string;
  updated: string;
}

interface SmartPlugsProps {
  context: PluginContext;
}

const SmartPlugsComponent: React.FC<SmartPlugsProps> = ({ context }) => {
  const { dataProvider } = context;
  const [plugs, setPlugs] = useState<SmartPlug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlugs = async () => {
      try {
        setLoading(true);
        // This assumes a 'smart_plugs' or 'devices' collection exists
        const response = await dataProvider.getList<SmartPlug>('devices', {
          page: 1,
          perPage: 50,
          filter: "type = 'smart-plug'",
          sort: '-updated',
        });
        setPlugs(response.items);
      } catch (error) {
        console.error('Error fetching smart plugs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugs();

    // Subscribe to real-time updates
    let unsubscribe: (() => void) | undefined;
    if (dataProvider.subscribe) {
      dataProvider
        .subscribe<SmartPlug>('devices', (event) => {
          if (event.action === 'create') {
            setPlugs((prev) => [event.record, ...prev]);
          } else if (event.action === 'update') {
            setPlugs((prev) =>
              prev.map((plug) =>
                plug.id === event.record.id ? event.record : plug,
              ),
            );
          } else if (event.action === 'delete') {
            setPlugs((prev) =>
              prev.filter((plug) => plug.id !== event.record.id),
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
  }, [dataProvider]);

  const togglePlug = async (plugId: string, currentStatus: 'on' | 'off') => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      await dataProvider.update('devices', plugId, { status: newStatus });
      console.log(`Plug ${plugId} toggled to ${newStatus}`);
    } catch (error) {
      console.error('Error toggling plug:', error);
      alert('Failed to toggle plug');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔌 Smart Plugs Control</h1>

      {loading ? (
        <p>Loading smart plugs...</p>
      ) : plugs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No smart plugs configured yet.</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Smart plugs will appear here once they're added to the system.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}>
          {plugs.map((plug) => (
            <div
              key={plug.id}
              style={{
                padding: '20px',
                border: '2px solid',
                borderColor: plug.status === 'on' ? '#4caf50' : '#ccc',
                borderRadius: '8px',
                background: plug.status === 'on' ? '#f1f8f4' : '#f9f9f9',
              }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                }}>
                <h3 style={{ margin: 0 }}>{plug.name}</h3>
                <button
                  onClick={() => togglePlug(plug.id, plug.status)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    background: plug.status === 'on' ? '#f44336' : '#4caf50',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}>
                  {plug.status === 'on' ? 'Turn Off' : 'Turn On'}
                </button>
              </div>

              <div style={{ fontSize: '14px', color: '#666' }}>
                {plug.location && <p>📍 Location: {plug.location}</p>}
                {plug.power_consumption !== undefined && (
                  <p>⚡ Power: {plug.power_consumption}W</p>
                )}
                <p>
                  Status:{' '}
                  <span
                    style={{
                      color: plug.status === 'on' ? 'green' : 'gray',
                      fontWeight: 'bold',
                    }}>
                    {plug.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Dashboard widget
const SmartPlugsWidget: React.FC<SmartPlugsProps> = ({ context }) => {
  const { dataProvider } = context;
  const [plugStats, setPlugStats] = useState({ on: 0, total: 0 });

  useEffect(() => {
    dataProvider
      .getList<SmartPlug>('devices', {
        page: 1,
        perPage: 100,
        filter: "type = 'smart-plug'",
      })
      .then((response) => {
        const on = response.items.filter((p) => p.status === 'on').length;
        setPlugStats({ on, total: response.items.length });
      })
      .catch(() => {
        setPlugStats({ on: 0, total: 0 });
      });
  }, [dataProvider]);

  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#f9f9f9',
      }}>
      <h3>🔌 Smart Plugs</h3>
      <p>
        Active: <strong>{plugStats.on}</strong>
      </p>
      <p>
        Total: <strong>{plugStats.total}</strong>
      </p>
    </div>
  );
};

// Plugin definition
export const SmartPlugsPlugin: IPlugin = {
  metadata: {
    id: 'smart-plugs',
    name: 'Smart Plugs',
    version: '1.0.0',
    description: 'Smart power outlet control and monitoring',
    category: 'smart-plugs',
  },
  config: {
    enabled: true,
    route: '/plugs',
  },
  lifecycle: {
    onRegister: () => {
      console.log('Smart Plugs plugin registered');
    },
  },
  component: SmartPlugsComponent,
  dashboardWidget: SmartPlugsWidget,
};
