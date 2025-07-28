import { Plugin, PluginRegistry, PluginHooks, PluginHookContext, PluginEventType, PluginMetadata } from '../types/index.js';
import { Game } from './Game.js';

export class PluginManager {
  private plugins: PluginRegistry = {};
  private game: Game;
  private isInitialized = false;

  constructor(game: any) {
    this.game = game;
  }

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins[plugin.metadata.name]) {
      throw new Error(`Plugin "${plugin.metadata.name}" is already registered`);
    }

    this.validatePlugin(plugin);

    await this.checkDependencies(plugin);

    if (this.isInitialized && plugin.initialize) {
      await plugin.initialize(this.game, this);
    }

    this.plugins[plugin.metadata.name] = plugin;

    console.log(`Plugin "${plugin.metadata.name}" v${plugin.metadata.version} registered successfully`);
  }

  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins[pluginName];
    if (!plugin) {
      console.warn(`Plugin "${pluginName}" is not registered`);
      return;
    }

    const dependentPlugins = Object.values(this.plugins).filter(p => 
      p.metadata.dependencies?.includes(pluginName)
    );

    if (dependentPlugins.length > 0) {
      const dependentNames = dependentPlugins.map(p => p.metadata.name).join(', ');
      throw new Error(`Cannot unregister plugin "${pluginName}" because it is required by: ${dependentNames}`);
    }

    if (plugin.dispose) {
      await plugin.dispose();
    }

    delete this.plugins[pluginName];
    console.log(`Plugin "${pluginName}" unregistered successfully`);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('PluginManager is already initialized');
      return;
    }

    const pluginList = Object.values(this.plugins);
    
    pluginList.sort((a, b) => (b.metadata.priority || 0) - (a.metadata.priority || 0));

    for (const plugin of pluginList) {
      if (plugin.initialize) {
        try {
          await plugin.initialize(this.game, this);
          console.log(`Plugin "${plugin.metadata.name}" initialized`);
        } catch (error) {
          console.error(`Failed to initialize plugin "${plugin.metadata.name}":`, error);
        }
      }
    }

    this.isInitialized = true;
    console.log('All plugins initialized successfully');
  }

  async executeHooks(eventType: PluginEventType, context: PluginHookContext): Promise<void> {
    const pluginList = Object.values(this.plugins);
    
    pluginList.sort((a, b) => (b.metadata.priority || 0) - (a.metadata.priority || 0));

    for (const plugin of pluginList) {
      if (plugin.hooks && plugin.hooks[eventType as keyof PluginHooks]) {
        try {
          const hook = plugin.hooks[eventType as keyof PluginHooks] as any;
          await hook(context);
        } catch (error) {
          console.error(`Error in plugin "${plugin.metadata.name}" hook "${eventType}":`, error);
        }
      }
    }
  }

  async executeCustomHooks(eventName: string, context: PluginHookContext): Promise<void> {
    const customContext = { ...context, eventName };
    
    for (const plugin of Object.values(this.plugins)) {
      if (plugin.hooks?.onCustomEvent) {
        try {
          await plugin.hooks.onCustomEvent(customContext);
        } catch (error) {
          console.error(`Error in plugin "${plugin.metadata.name}" custom hook "${eventName}":`, error);
        }
      }
    }
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins[name];
  }

  getAllPlugins(): PluginRegistry {
    return { ...this.plugins };
  }

  getPluginAPI(name: string): any {
    const plugin = this.plugins[name];
    return plugin?.api || {};
  }

  hasPlugin(name: string): boolean {
    return !!this.plugins[name];
  }

  getPluginMetadata(name: string): PluginMetadata | undefined {
    return this.plugins[name]?.metadata;
  }

  getPluginNames(): string[] {
    return Object.keys(this.plugins);
  }

  async dispose(): Promise<void> {
    for (const plugin of Object.values(this.plugins)) {
      if (plugin.dispose) {
        try {
          await plugin.dispose();
        } catch (error) {
          console.error(`Error disposing plugin "${plugin.metadata.name}":`, error);
        }
      }
    }
    
    this.plugins = {};
    this.isInitialized = false;
    console.log('All plugins disposed');
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.metadata) {
      throw new Error('Plugin must have metadata');
    }

    if (!plugin.metadata.name) {
      throw new Error('Plugin must have a name');
    }

    if (!plugin.metadata.version) {
      throw new Error('Plugin must have a version');
    }

    const versionRegex = /^\d+\.\d+\.\d+/;
    if (!versionRegex.test(plugin.metadata.version)) {
      console.warn(`Plugin "${plugin.metadata.name}" has invalid version format. Expected semantic versioning (x.y.z)`);
    }
  }

  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.metadata.dependencies) {
      return;
    }

    for (const dependency of plugin.metadata.dependencies) {
      if (!this.plugins[dependency]) {
        throw new Error(`Plugin "${plugin.metadata.name}" requires dependency "${dependency}" which is not registered`);
      }
    }
  }

  createHookContext(additionalContext: Partial<PluginHookContext> = {}): PluginHookContext {
    return {
      game: this.game,
      state: this.game.getState(),
      ...additionalContext
    };
  }
} 