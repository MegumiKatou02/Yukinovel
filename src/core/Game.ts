import { GameScript, GameState, GameEvent, GameEventHandler, Scene, DialogueEntry, Choice, Plugin, PluginHookContext } from '../types/index.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { UIRenderer } from './UIRenderer.js';
import { LanguageManager } from './LanguageManager.js';
import { PluginManager } from './PluginManager.js';

export class Game {
  private script: GameScript;
  private state: GameState;
  private container!: HTMLElement;
  private audioManager: AudioManager;
  private saveManager: SaveManager;
  private uiRenderer: UIRenderer;
  private languageManager: LanguageManager;
  private pluginManager: PluginManager;
  private eventHandlers: { [key: string]: GameEventHandler[] } = {};
  private currentSceneDialogueHistory: DialogueEntry[] = [];
  private globalDialogueHistory: Array<{dialogue: DialogueEntry, sceneId: string, timestamp: Date}> = [];
  private isGameStarted = false;

  constructor(script: GameScript) {
    this.script = script;
    this.state = {
      currentScene: script.scenes[0]?.id || '',
      currentDialogue: 0,
      variables: {},
      history: []
    };
    this.audioManager = new AudioManager();
    this.saveManager = new SaveManager();
    this.uiRenderer = new UIRenderer(this);
    this.languageManager = new LanguageManager();
    this.pluginManager = new PluginManager(this);
  }

  // Mount game to DOM element
  mount(selector: string): void {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    this.container = element as HTMLElement;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.languageManager.initialize(this.script);
    
    // Setup container
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = typeof this.script.settings?.width === 'string' ? this.script.settings.width : `${this.script.settings?.width || 800}px`;
    this.container.style.height = typeof this.script.settings?.height === 'string' ? this.script.settings.height : `${this.script.settings?.height || 600}px`;
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#000';
    this.container.style.fontFamily = 'Arial, sans-serif';

    // Initialize plugins
    await this.pluginManager.initialize();

    // Execute onStart hook
    if (!this.isGameStarted) {
      await this.pluginManager.executeHooks('onStart', this.pluginManager.createHookContext());
      this.isGameStarted = true;
    }

    // Render initial UI
    this.uiRenderer.render(this.container);
    
    if (this.script.settings?.mainMenu) {
      this.showMainMenu();
    } else {
      this.startScene(this.state.currentScene);
    }
  }

  // Scene management
  async startScene(sceneId: string, fadeOptions?: { backgroundFade?: boolean; backgroundAnimation?: any }): Promise<void> {
    const scene = this.script.scenes.find(s => s.id === sceneId);
    if (!scene) {
      console.error(`Scene "${sceneId}" not found`);
      return;
    }

    // Execute onSceneWillStart hook
    const context = this.pluginManager.createHookContext({ scene });
    await this.pluginManager.executeHooks('onSceneWillStart', context);

    this.state.currentScene = sceneId;
    this.state.currentDialogue = 0;
    this.currentSceneDialogueHistory = [];

    if (scene.music) {
      // Execute music hooks
      const musicContext = this.pluginManager.createHookContext({ scene, music: scene.music });
      await this.pluginManager.executeHooks('onMusicWillPlay', musicContext);
      this.audioManager.playMusic(scene.music);
      await this.pluginManager.executeHooks('onMusicPlayed', musicContext);
    }

    if (fadeOptions?.backgroundFade) {
      this.uiRenderer.updateSceneWithFade(scene, true, fadeOptions.backgroundAnimation);
    } else {
      this.uiRenderer.updateScene(scene);
    }
    
    await this.showDialogue();

    this.emit('scene', { scene });

    // Execute onSceneStarted hook
    await this.pluginManager.executeHooks('onSceneStarted', context);
  }

  // Dialogue management
  private async showDialogue(): Promise<void> {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    const dialogue = currentScene.dialogue[this.state.currentDialogue];
    if (!dialogue) {
      await this.pluginManager.executeHooks('onEnd', this.pluginManager.createHookContext());
      this.emit('end', {});
      return;
    }

    if (!this.currentSceneDialogueHistory.includes(dialogue)) {
      this.currentSceneDialogueHistory.push(dialogue);
    }

    const existingGlobalEntry = this.globalDialogueHistory.find(
      entry => entry.dialogue === dialogue && entry.sceneId === this.state.currentScene
    );
    if (!existingGlobalEntry) {
      this.globalDialogueHistory.push({
        dialogue: dialogue,
        sceneId: this.state.currentScene,
        timestamp: new Date()
      });
    }

    // Execute onDialogueWillDisplay hook
    const context = this.pluginManager.createHookContext({ 
      scene: currentScene, 
      dialogue 
    });
    await this.pluginManager.executeHooks('onDialogueWillDisplay', context);

    this.uiRenderer.updateDialogue(dialogue);
    this.emit('dialogue', { dialogue });

    // Execute onDialogueDisplayed hook
    await this.pluginManager.executeHooks('onDialogueDisplayed', context);
  }

  async next(): Promise<void> {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    const dialogue = currentScene.dialogue[this.state.currentDialogue];
    if (!dialogue) return;

    if (dialogue.action) {
      await this.handleAction(dialogue.action, dialogue.target);
      return;
    }

    if (dialogue.choices && dialogue.choices.length > 0) {
      // Execute onChoicesWillDisplay hook
      const context = this.pluginManager.createHookContext({ 
        scene: currentScene, 
        dialogue,
        choices: dialogue.choices 
      });
      await this.pluginManager.executeHooks('onChoicesWillDisplay', context);
      
      this.uiRenderer.showChoices(dialogue.choices);
      
      // Execute onChoicesDisplayed hook
      await this.pluginManager.executeHooks('onChoicesDisplayed', context);
      return;
    }

    // Execute onDialogueWillHide hook
    const hideContext = this.pluginManager.createHookContext({ 
      scene: currentScene, 
      dialogue 
    });
    await this.pluginManager.executeHooks('onDialogueWillHide', hideContext);

    this.state.currentDialogue++;
    if (this.state.currentDialogue >= currentScene.dialogue.length) {
      await this.pluginManager.executeHooks('onEnd', this.pluginManager.createHookContext());
      this.emit('end', {});
      return;
    }

    // Execute onDialogueHidden hook
    await this.pluginManager.executeHooks('onDialogueHidden', hideContext);

    await this.showDialogue();
  }

  async makeChoice(choice: Choice): Promise<void> {
    this.state.history.push(`Choice: ${choice.text}`);
    
    // Execute onChoiceSelected hook
    const context = this.pluginManager.createHookContext({ choice });
    await this.pluginManager.executeHooks('onChoiceSelected', context);
    
    await this.handleAction(choice.action, choice.target);
  }

  private async handleAction(action: string, target?: string): Promise<void> {
    const currentScene = this.getCurrentScene();
    const currentDialogue = currentScene?.dialogue[this.state.currentDialogue];
    
    switch (action) {
      case 'jump':
        if (target) {
          const fadeAnimation = currentDialogue?.fadeAnimation;
          const fadeOptions = {
            backgroundFade: fadeAnimation?.enabled === true && 
                          fadeAnimation?.backgroundFade !== false,
            backgroundAnimation: typeof fadeAnimation?.backgroundFade === 'object' ? 
                               fadeAnimation.backgroundFade : undefined
          };
          
          // Execute onSceneWillEnd hook for current scene
          if (currentScene) {
            await this.pluginManager.executeHooks('onSceneWillEnd', 
              this.pluginManager.createHookContext({ scene: currentScene }));
          }
          
          await this.startScene(target, fadeOptions);
          
          // Execute onSceneEnded hook for previous scene
          if (currentScene) {
            await this.pluginManager.executeHooks('onSceneEnded', 
              this.pluginManager.createHookContext({ scene: currentScene }));
          }
        }
        break;
      case 'end':
        await this.pluginManager.executeHooks('onEnd', this.pluginManager.createHookContext());
        this.emit('end', {});
        break;
      case 'save':
        // this.uiRenderer.showSavePanel();
        break;
      case 'load':
        // this.uiRenderer.showLoadPanel();
        break;
    }
  }

  // Save/Load system
  async saveGame(slot: number = 0): Promise<void> {
    // Execute onWillSave hook
    const context = this.pluginManager.createHookContext({ slot });
    await this.pluginManager.executeHooks('onWillSave', context);
    
    this.state.savedAt = new Date();
    this.saveManager.save(slot, this.state);
    this.emit('save', { slot });
    
    // Execute onSaved hook
    await this.pluginManager.executeHooks('onSaved', context);
  }

  async loadGame(slot: number = 0): Promise<void> {
    // Execute onWillLoad hook
    const context = this.pluginManager.createHookContext({ slot });
    await this.pluginManager.executeHooks('onWillLoad', context);
    
    const savedState = this.saveManager.load(slot);
    if (savedState) {
      this.state = savedState;
      await this.startScene(this.state.currentScene, { backgroundFade: true });
      this.emit('load', { slot });
      
      // Execute onLoaded hook
      await this.pluginManager.executeHooks('onLoaded', context);
    }
  }

  async showMainMenu(): Promise<void> {
    // Execute onMenuWillShow hook
    const context = this.pluginManager.createHookContext({ menuType: 'main' });
    await this.pluginManager.executeHooks('onMenuWillShow', context);
    
    this.uiRenderer.showMainMenu();
    
    // Execute onMenuShown hook
    await this.pluginManager.executeHooks('onMenuShown', context);
  }

  async startNewGame(): Promise<void> {
    this.globalDialogueHistory = [];
    this.state.currentDialogue = 0;
    this.state.currentScene = this.script.scenes[0]?.id || '';
    
    // Execute onMenuWillHide hook
    const hideContext = this.pluginManager.createHookContext({ menuType: 'main' });
    await this.pluginManager.executeHooks('onMenuWillHide', hideContext);
    
    this.uiRenderer.hideMainMenu();
    
    // Execute onMenuHidden hook
    await this.pluginManager.executeHooks('onMenuHidden', hideContext);
    
    await this.startScene(this.state.currentScene);
  }

  async continueGame(): Promise<void> {
    // Execute onMenuWillHide hook
    const hideContext = this.pluginManager.createHookContext({ menuType: 'main' });
    await this.pluginManager.executeHooks('onMenuWillHide', hideContext);
    
    this.uiRenderer.hideMainMenu();
    
    // Execute onMenuHidden hook
    await this.pluginManager.executeHooks('onMenuHidden', hideContext);
    
    await this.startScene(this.state.currentScene, { backgroundFade: true });
  }

  // Event system
  on(event: string, handler: GameEventHandler): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  private emit(event: string, data: any): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler({ type: event as any, data }));
    }
  }

  // Getters
  getCurrentScene(): Scene | undefined {
    return this.script.scenes.find(s => s.id === this.state.currentScene);
  }

  getCurrentSceneDialogueHistory(): DialogueEntry[] {
    return [...this.currentSceneDialogueHistory];
  }

  getGlobalDialogueHistory(): Array<{dialogue: DialogueEntry, sceneId: string, timestamp: Date}> {
    return [...this.globalDialogueHistory];
  }

  getSceneById(sceneId: string): Scene | undefined {
    return this.script.scenes.find(s => s.id === sceneId);
  }

  getState(): GameState {
    return { ...this.state };
  }

  getScript(): GameScript {
    return this.script;
  }

  getLanguageManager(): LanguageManager {
    return this.languageManager;
  }

  getCurrentLanguage(): string {
    return this.languageManager.getCurrentLanguage();
  }

  async setLanguage(languageCode: string): Promise<void> {
    // Execute onLanguageWillChange hook
    const context: PluginHookContext = this.pluginManager.createHookContext({ 
      language: languageCode,
      previousLanguage: this.languageManager.getCurrentLanguage()
    });
    await this.pluginManager.executeHooks('onLanguageWillChange', context);
    
    this.languageManager.setLanguage(languageCode);
    
    // Execute onLanguageChanged hook
    await this.pluginManager.executeHooks('onLanguageChanged', context);
  }

  getAvailableLanguages() {
    return this.languageManager.getAvailableLanguages();
  }

  getText(key: string, fallback?: string): string {
    return this.languageManager.getText(key, fallback);
  }

  getAudioManager(): AudioManager {
    return this.audioManager;
  }

  getUIRenderer(): UIRenderer {
    return this.uiRenderer;
  }

  getSaveManager(): SaveManager {
    return this.saveManager;
  }

  getConfirmModal() {
    return this.uiRenderer.getConfirmModal();
  }

  // Plugin system methods
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    return this.pluginManager.register(plugin);
  }

  async unregisterPlugin(pluginName: string): Promise<void> {
    return this.pluginManager.unregister(pluginName);
  }

  getPlugin(name: string): any {
    return this.pluginManager.getPlugin(name);
  }

  getPluginAPI(name: string): any {
    return this.pluginManager.getPluginAPI(name);
  }

  hasPlugin(name: string): boolean {
    return this.pluginManager.hasPlugin(name);
  }

  async emitCustomEvent(eventName: string, data: any = {}): Promise<void> {
    const context = this.pluginManager.createHookContext(data);
    await this.pluginManager.executeCustomHooks(eventName, context);
  }
} 