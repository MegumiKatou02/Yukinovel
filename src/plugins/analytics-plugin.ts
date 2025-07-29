import { PluginBase } from "../utils/createPlugin";
import type { Game, PluginHookContext, PluginHooks, PluginManager, PluginMetadata } from '../index.js'

/**
 * Analytics Plugin
 * Theo dõi hành vi người chơi và gửi analytics data
 */
export class AnalyticsPlugin extends PluginBase {
  metadata: PluginMetadata = {
    name: 'analytics',
    version: '1.0.0',
    author: 'Yukiookii',
    description: 'Plugin để theo dõi analytics và metrics của game',
    priority: 10
  };

  private analytics: {
    sessionStart: Date;
    sceneViews: Record<string, number>;
    choicesMade: {
      text: string;
      action: string;
      target?: string;
      timestamp: Date;
      sceneId: string;
    }[];
    playtime: number;
  };
  private timeInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.analytics = {
      sessionStart: new Date(),
      sceneViews: {},
      choicesMade: [],
      playtime: 0,
    }
  }

  api = {
    getAnalytics: () => {
      return this.analytics;
    },
    
    getPlaytime: () => {
      if (!this.analytics) return 0;
      return Math.floor((new Date().getTime() - this.analytics.sessionStart.getTime()) / 1000);
    },

    exportData: () => {
      return JSON.stringify(this.analytics, null, 2);
    }
  };

  async initialize(_game: Game, _pluginManager: PluginManager): Promise<void> {
    console.log('Analytics Plugin initialized');
    
    this.analytics = {
      sessionStart: new Date(),
      sceneViews: {},
      choicesMade: [],
      playtime: 0
    };

    this.startTimeTracking();
  }

  hooks: PluginHooks = {
    onStart: async (_context: PluginHookContext) => {
      console.log('🎮 Game started!');
    },

    onSceneStarted: async (context: PluginHookContext) => {
      const sceneId = context.scene?.id;
      if (sceneId && this.analytics) {
        console.log(`📺 Scene started: ${sceneId}`);
        
        if (!this.analytics.sceneViews[sceneId]) {
          this.analytics.sceneViews[sceneId] = 0;
        }
        this.analytics.sceneViews[sceneId]++;
      }
    },

    onChoiceSelected: async (context: PluginHookContext) => {
      const choice = context.choice;
      if (choice && this.analytics) {
        console.log(`🎯 Choice selected: ${choice.text}`);
        
        this.analytics.choicesMade.push({
          text: typeof choice.text === 'string' ? choice.text : choice.text?.en || 'Unknown',
          action: choice.action,
          target: choice.target,
          timestamp: new Date(),
          sceneId: context.state.currentScene
        });
      }
    },

    onSaved: async (context: PluginHookContext) => {
      console.log(`💾 Game saved to slot ${context.slot}`);
    },

    onLoaded: async (context: PluginHookContext) => {
      console.log(`📂 Game loaded from slot ${context.slot}`);
    },

    onEnd: async (_context: PluginHookContext) => {
      console.log('🏁 Game ended!');
      console.log('📊 Session Analytics:', this.analytics);
      
      this.saveAnalytics();
    }
  };

  private startTimeTracking(): void {
    this.timeInterval = setInterval(() => {
      if (this.analytics) {
        this.analytics.playtime++;
      }
    }, 1000);
  }

  private saveAnalytics(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  async dispose(): Promise<void> {
    console.log('Analytics Plugin disposed');
    this.saveAnalytics();
  }
} 