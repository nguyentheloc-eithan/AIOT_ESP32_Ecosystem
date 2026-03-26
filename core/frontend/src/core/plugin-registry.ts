/**
 * Plugin Registry Implementation
 *
 * Manages plugin registration, lifecycle, and retrieval
 */

import type { IPlugin, IPluginRegistry } from './types/plugin';

export class PluginRegistry implements IPluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();

  /**
   * Register a new plugin
   */
  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(
        `Plugin "${plugin.metadata.id}" is already registered. Overwriting...`,
      );
    }

    // Call onRegister lifecycle hook
    if (plugin.lifecycle?.onRegister) {
      try {
        const result = plugin.lifecycle.onRegister();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(
              `Error in onRegister for plugin "${plugin.metadata.id}":`,
              error,
            );
          });
        }
      } catch (error) {
        console.error(
          `Error in onRegister for plugin "${plugin.metadata.id}":`,
          error,
        );
      }
    }

    this.plugins.set(plugin.metadata.id, plugin);
    console.log(`Plugin "${plugin.metadata.name}" registered successfully`);
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin "${pluginId}" not found`);
      return;
    }

    // Call onDestroy lifecycle hook
    if (plugin.lifecycle?.onDestroy) {
      try {
        const result = plugin.lifecycle.onDestroy();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(
              `Error in onDestroy for plugin "${pluginId}":`,
              error,
            );
          });
        }
      } catch (error) {
        console.error(`Error in onDestroy for plugin "${pluginId}":`, error);
      }
    }

    this.plugins.delete(pluginId);
    console.log(`Plugin "${plugin.metadata.name}" unregistered`);
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): IPlugin[] {
    return this.getAllPlugins().filter(
      (plugin) => plugin.metadata.category === category,
    );
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get enabled plugins only
   */
  getEnabledPlugins(): IPlugin[] {
    return this.getAllPlugins().filter(
      (plugin) => plugin.config?.enabled !== false,
    );
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.getAllPlugins().forEach((plugin) => {
      this.unregister(plugin.metadata.id);
    });
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();
