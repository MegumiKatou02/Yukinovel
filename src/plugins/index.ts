/**
 * YUKINOVEL PLUGINS
 * @author: Yukiookii
 * @description: Pre-built plugins for Yukinovel
 */

/**
 * Export all available plugins
 */
export { AnalyticsPlugin } from './analytics-plugin.js';

/**
 * Re-export plugin utilities for convenience
 */
export { PluginBase, createPlugin, PluginRegistryBuilder, validatePlugin, hook } from '../utils/createPlugin.js';

/**
 * Re-export plugin types
 */
export type { 
  PluginMetadata, 
  PluginHooks, 
  PluginHookContext,
  Plugin,
} from '../types/index.js';

/**
 * Re-export PluginManager from core
 */
export { PluginManager } from '../core/PluginManager.js';
