/**
 * Main Plugin Container
 *
 * Renders plugins with their context
 */

import React, { useState, useMemo } from 'react';
import type { IPlugin, PluginContext } from '../core/types/plugin';
import type { IDataProvider } from '../core/types/data-provider';

interface PluginContainerProps {
  plugin: IPlugin;
  dataProvider: IDataProvider;
}

export const PluginContainer: React.FC<PluginContainerProps> = ({
  plugin,
  dataProvider,
}) => {
  const [sharedState, setSharedState] = useState<Record<string, any>>({});

  const updateSharedState = (key: string, value: any) => {
    setSharedState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const context: PluginContext = useMemo(
    () => ({
      dataProvider,
      config: plugin.config || {},
      sharedState,
      updateSharedState,
    }),
    [dataProvider, plugin.config, sharedState],
  );

  React.useEffect(() => {
    if (plugin.lifecycle?.onMount) {
      const result = plugin.lifecycle.onMount();
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(
            `Error in onMount for plugin "${plugin.metadata.id}":`,
            error,
          );
        });
      }
    }

    return () => {
      if (plugin.lifecycle?.onUnmount) {
        const result = plugin.lifecycle.onUnmount();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(
              `Error in onUnmount for plugin "${plugin.metadata.id}":`,
              error,
            );
          });
        }
      }
    };
  }, [plugin]);

  const Component = plugin.component;

  return <Component context={context} />;
};
