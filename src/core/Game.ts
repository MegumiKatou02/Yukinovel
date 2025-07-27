import { GameScript, GameState, GameEvent, GameEventHandler, Scene, DialogueEntry, Choice } from '../types/index.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { UIRenderer } from './UIRenderer.js';
import { LanguageManager } from './LanguageManager.js';

export class Game {
  private script: GameScript;
  private state: GameState;
  private container!: HTMLElement;
  private audioManager: AudioManager;
  private saveManager: SaveManager;
  private uiRenderer: UIRenderer;
  private languageManager: LanguageManager;
  private eventHandlers: { [key: string]: GameEventHandler[] } = {};
  private currentSceneDialogueHistory: DialogueEntry[] = [];
  private globalDialogueHistory: Array<{dialogue: DialogueEntry, sceneId: string, timestamp: Date}> = [];

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

  private initialize(): void {
    // Initialize language manager
    this.languageManager.initialize(this.script);
    
    // Setup container
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = typeof this.script.settings?.width === 'string' ? this.script.settings.width : `${this.script.settings?.width || 800}px`;
    this.container.style.height = typeof this.script.settings?.height === 'string' ? this.script.settings.height : `${this.script.settings?.height || 600}px`;
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#000';
    this.container.style.fontFamily = 'Arial, sans-serif';

    // Render initial UI
    this.uiRenderer.render(this.container);
    
    if (this.script.settings?.mainMenu) {
      this.showMainMenu();
    } else {
      this.startScene(this.state.currentScene);
    }
  }

  // Scene management
  startScene(sceneId: string, fadeOptions?: { backgroundFade?: boolean; backgroundAnimation?: any }): void {
    const scene = this.script.scenes.find(s => s.id === sceneId);
    if (!scene) {
      console.error(`Scene "${sceneId}" not found`);
      return;
    }

    this.state.currentScene = sceneId;
    this.state.currentDialogue = 0;
    this.currentSceneDialogueHistory = [];

    if (scene.music) {
      this.audioManager.playMusic(scene.music);
    }

    if (fadeOptions?.backgroundFade) {
      this.uiRenderer.updateSceneWithFade(scene, true, fadeOptions.backgroundAnimation);
    } else {
      this.uiRenderer.updateScene(scene);
    }
    this.showDialogue();

    this.emit('scene', { scene });
  }

  // Dialogue management
  private showDialogue(): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    const dialogue = currentScene.dialogue[this.state.currentDialogue];
    if (!dialogue) {
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

    this.uiRenderer.updateDialogue(dialogue);
    this.emit('dialogue', { dialogue });
  }

  next(): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    const dialogue = currentScene.dialogue[this.state.currentDialogue];
    if (!dialogue) return;

    if (dialogue.action) {
      this.handleAction(dialogue.action, dialogue.target);
      return;
    }

    if (dialogue.choices && dialogue.choices.length > 0) {
      this.uiRenderer.showChoices(dialogue.choices);
      return;
    }

    this.state.currentDialogue++;
    if (this.state.currentDialogue >= currentScene.dialogue.length) {
      this.emit('end', {});
      return;
    }

    this.showDialogue();
  }

  makeChoice(choice: Choice): void {
    this.state.history.push(`Choice: ${choice.text}`);
    this.handleAction(choice.action, choice.target);
  }

  private handleAction(action: string, target?: string): void {
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
          this.startScene(target, fadeOptions);
        }
        break;
      case 'end':
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
  saveGame(slot: number = 0): void {
    this.state.savedAt = new Date();
    this.saveManager.save(slot, this.state);
    this.emit('save', { slot });
  }

  loadGame(slot: number = 0): void {
    const savedState = this.saveManager.load(slot);
    if (savedState) {
      this.state = savedState;
      this.startScene(this.state.currentScene, { backgroundFade: true });
      this.emit('load', { slot });
    }
  }

  showMainMenu(): void {
    this.uiRenderer.showMainMenu();
  }

  startNewGame(): void {
    this.globalDialogueHistory = [];
    this.state.currentDialogue = 0;
    this.state.currentScene = this.script.scenes[0]?.id || '';
    this.uiRenderer.hideMainMenu();
    this.startScene(this.state.currentScene);
  }

  continueGame(): void {
    this.uiRenderer.hideMainMenu();
    this.startScene(this.state.currentScene, { backgroundFade: true });
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

  setLanguage(languageCode: string): void {
    this.languageManager.setLanguage(languageCode);
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
} 