/**
 * Smart Sensing Plugin
 *
 * Monitors sensors and environmental data
 */

import React, { useState, useEffect } from 'react';
import type { IPlugin, PluginContext } from '../../core/types/plugin';

interface Sensor {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive';
  created: string;
  updated: string;
}

interface SmartSensingProps {
  context: PluginContext;
}

const SmartSensingComponent: React.FC<SmartSensingProps> = ({ context }) => {
  const { dataProvider } = context;
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setLoading(true);
        // This assumes a 'sensors' collection exists
        const response = await dataProvider.getList<Sensor>('sensors', {
          page: 1,
          perPage: 50,
          sort: '-updated',
        });
        setSensors(response.items);
      } catch (error) {
        console.error('Error fetching sensors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();

    // Subscribe to real-time updates if available
    let unsubscribe: (() => void) | undefined;
    if (dataProvider.subscribe) {
      dataProvider
        .subscribe<Sensor>('sensors', (event) => {
          if (event.action === 'create') {
            setSensors((prev) => [event.record, ...prev]);
          } else if (event.action === 'update') {
            setSensors((prev) =>
              prev.map((sensor) =>
                sensor.id === event.record.id ? event.record : sensor,
              ),
            );
          } else if (event.action === 'delete') {
            setSensors((prev) =>
              prev.filter((sensor) => sensor.id !== event.record.id),
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Smart Sensing Dashboard</h1>

      {loading ? (
        <p>Loading sensors...</p>
      ) : sensors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No sensors configured yet.</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Sensors will appear here once they're added to the system.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}>
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: sensor.status === 'active' ? '#f0f9ff' : '#f9f9f9',
              }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{sensor.name}</h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <p>Type: {sensor.type}</p>
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '10px 0',
                  }}>
                  {sensor.value} {sensor.unit}
                </p>
                <p>
                  Status:{' '}
                  <span
                    style={{
                      color: sensor.status === 'active' ? 'green' : 'red',
                      fontWeight: 'bold',
                    }}>
                    {sensor.status}
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
const SmartSensingWidget: React.FC<SmartSensingProps> = ({ context }) => {
  const { dataProvider } = context;
  const [sensorCount, setSensorCount] = useState({ active: 0, total: 0 });

  useEffect(() => {
    dataProvider
      .getList<Sensor>('sensors', { page: 1, perPage: 100 })
      .then((response) => {
        const active = response.items.filter(
          (s) => s.status === 'active',
        ).length;
        setSensorCount({ active, total: response.items.length });
      })
      .catch(() => {
        // Collection might not exist yet
        setSensorCount({ active: 0, total: 0 });
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
      <h3>📊 Smart Sensing</h3>
      <p>
        Active Sensors: <strong>{sensorCount.active}</strong>
      </p>
      <p>
        Total Sensors: <strong>{sensorCount.total}</strong>
      </p>
    </div>
  );
};

// Plugin definition
export const SmartSensingPlugin: IPlugin = {
  metadata: {
    id: 'smart-sensing',
    name: 'Smart Sensing',
    version: '1.0.0',
    description: 'Environmental monitoring and sensor data',
    category: 'smart-sensing',
  },
  config: {
    enabled: true,
    route: '/sensing',
  },
  lifecycle: {
    onRegister: () => {
      console.log('Smart Sensing plugin registered');
    },
  },
  component: SmartSensingComponent,
  dashboardWidget: SmartSensingWidget,
};
