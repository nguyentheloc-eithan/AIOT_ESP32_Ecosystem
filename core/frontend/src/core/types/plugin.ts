/**
 * Plugin System Type Definitions
 *
 * This defines the contract that all plugins must follow
 */

import type { ComponentType } from 'react';
import type { IDataProvider } from './data-provider';

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique identifier for the plugin */
  id: string;
  /** Display name */
  name: string;
  /** Plugin version */
  version: string;
  /** Short description */
  description: string;
  /** Plugin author */
  author?: string;
  /** Icon for the plugin (can be a component or URL) */
  icon?: ComponentType | string;
  /** Module category (e.g., 'smart-pumping', 'smart-sensing') */
  category?: string;
}

/**
 * Plugin configuration options
 */
export interface PluginConfig {
  /** Whether the plugin is enabled */
  enabled?: boolean;
  /** Custom settings for the plugin */
  settings?: Record<string, any>;
  /** Route path for the plugin (if it has a dedicated page) */
  route?: string;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  /** Called when the plugin is registered */
  onRegister?: () => void | Promise<void>;
  /** Called when the plugin is mounted */
  onMount?: () => void | Promise<void>;
  /** Called when the plugin is unmounted */
  onUnmount?: () => void | Promise<void>;
  /** Called when the plugin is destroyed */
  onDestroy?: () => void | Promise<void>;
}

/**
 * Plugin context provided to all plugins
 */
export interface PluginContext {
  /** Data provider instance */
  dataProvider: IDataProvider;
  /** Plugin configuration */
  config: PluginConfig;
  /** Shared state (can be used for inter-plugin communication) */
  sharedState?: Record<string, any>;
  /** Method to update shared state */
  updateSharedState?: (key: string, value: any) => void;
}

/**
 * Main plugin interface
 */
export interface IPlugin {
  /** Plugin metadata */
  metadata: PluginMetadata;
  /** Plugin configuration */
  config?: PluginConfig;
  /** Lifecycle hooks */
  lifecycle?: PluginLifecycle;
  /** Main component to render */
  component: ComponentType<{ context: PluginContext }>;
  /** Optional dashboard widget component */
  dashboardWidget?: ComponentType<{ context: PluginContext }>;
  /** Optional settings component */
  settingsComponent?: ComponentType<{ context: PluginContext }>;
}

/**
 * Plugin registry
 */
export interface IPluginRegistry {
  /** Register a plugin */
  register(plugin: IPlugin): void;
  /** Unregister a plugin */
  unregister(pluginId: string): void;
  /** Get a plugin by ID */
  getPlugin(pluginId: string): IPlugin | undefined;
  /** Get all registered plugins */
  getAllPlugins(): IPlugin[];
  /** Get plugins by category */
  getPluginsByCategory(category: string): IPlugin[];
  /** Check if a plugin is registered */
  hasPlugin(pluginId: string): boolean;
}
