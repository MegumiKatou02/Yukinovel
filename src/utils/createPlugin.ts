import { Game } from '../core/Game.js';
import { PluginManager } from '../core/PluginManager.js';
import { Plugin, PluginMetadata, PluginHooks } from '../types/index.js';

/**
 * Helper function để tạo plugin dễ dàng hơn
 */
export function createPlugin(options: {
  metadata: PluginMetadata;
  hooks?: PluginHooks;
  initialize?: (game: any, pluginManager: any) => void | Promise<void>;
  dispose?: () => void | Promise<void>;
  api?: { [key: string]: any };
}): Plugin {
  return {
    metadata: {
      priority: 0,
      ...options.metadata
    },
    hooks: options.hooks,
    initialize: options.initialize,
    dispose: options.dispose,
    api: options.api
  };
}

/**
 * Decorator để đánh dấu plugin method hooks
 */
export function hook(eventType: keyof PluginHooks) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!target._hooks) {
      target._hooks = {};
    }
    target._hooks[eventType] = descriptor.value;
  };
}

/**
 * Class-based Plugin helper
 */
export abstract class PluginBase implements Plugin {
  abstract metadata: PluginMetadata;
  hooks?: PluginHooks;
  api?: { [key: string]: any };

  constructor() {
    this.collectHooks();
  }

  private collectHooks(): void {
    const proto = Object.getPrototypeOf(this);
    if (proto._hooks) {
      this.hooks = { ...proto._hooks };
      
      if (this.hooks) {
        for (const [eventType, method] of Object.entries(this.hooks)) {
          if (typeof method === 'function') {
            (this.hooks as any)[eventType] = method.bind(this);
          }
        }
      }
    }
  }

  // Optional lifecycle methods
  async initialize?(game: Game, pluginManager: PluginManager): Promise<void>;
  async dispose?(): Promise<void>;
}

/**
 * Plugin Registry Builder để quản lý nhiều plugins :v
 */
export class PluginRegistryBuilder {
  private plugins: Plugin[] = [];

  add(plugin: Plugin): this {
    this.plugins.push(plugin);
    return this;
  }

  addMultiple(plugins: Plugin[]): this {
    this.plugins.push(...plugins);
    return this;
  }

  build(): Plugin[] {
    return [...this.plugins];
  }

  async registerAll(game: Game): Promise<void> {
    for (const plugin of this.plugins) {
      await game.registerPlugin(plugin);
    }
  }
}

/**
 * Validation helper cho plugin
 */
export function validatePlugin(plugin: Plugin): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plugin.metadata) {
    errors.push('Plugin must have metadata');
  } else {
    if (!plugin.metadata.name) {
      errors.push('Plugin must have a name');
    }
    if (!plugin.metadata.version) {
      errors.push('Plugin must have a version');
    }
    if (plugin.metadata.name && !/^[a-zA-Z0-9_-]+$/.test(plugin.metadata.name)) {
      errors.push('Plugin name must contain only alphanumeric characters, hyphens, and underscores');
    }
    if (plugin.metadata.version && !/^\d+\.\d+\.\d+/.test(plugin.metadata.version)) {
      errors.push('Plugin version must follow semantic versioning (x.y.z)');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 