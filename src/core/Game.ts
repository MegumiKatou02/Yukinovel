import { GameScript, GameState, GameEvent, GameEventHandler, Scene, DialogueEntry, Choice } from '../types/index.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { UIRenderer } from './UIRenderer.js';

export class Game {
  private script: GameScript;
  private state: GameState;
  private container!: HTMLElement; // Definite assignment assertion
  private audioManager: AudioManager;
  private saveManager: SaveManager;
  private uiRenderer: UIRenderer;
  private eventHandlers: { [key: string]: GameEventHandler[] } = {};
  private currentSceneDialogueHistory: DialogueEntry[] = []; // Lưu trữ lịch sử dialogue của scene hiện tại
  private globalDialogueHistory: Array<{dialogue: DialogueEntry, sceneId: string, timestamp: Date}> = []; // Lưu trữ toàn bộ lịch sử dialogue

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
    // Setup container
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = `${this.script.settings?.width || 800}px`;
    this.container.style.height = `${this.script.settings?.height || 600}px`;
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#000';
    this.container.style.fontFamily = 'Arial, sans-serif';

    // Render initial UI
    this.uiRenderer.render(this.container);
    
    // Start first scene
    this.startScene(this.state.currentScene);
  }

  // Scene management
  private startScene(sceneId: string): void {
    const scene = this.script.scenes.find(s => s.id === sceneId);
    if (!scene) {
      console.error(`Scene "${sceneId}" not found`);
      return;
    }

    this.state.currentScene = sceneId;
    this.state.currentDialogue = 0;
    this.currentSceneDialogueHistory = []; // Reset lịch sử dialogue khi chuyển scene

    // Load background music
    if (scene.music) {
      this.audioManager.playMusic(scene.music);
    }

    // Update UI
    this.uiRenderer.updateScene(scene);
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

  // User interactions
  next(): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    const dialogue = currentScene.dialogue[this.state.currentDialogue];
    if (!dialogue) return;

    // Handle dialogue actions
    if (dialogue.action) {
      this.handleAction(dialogue.action, dialogue.target);
      return;
    }

    // Check if there are choices
    if (dialogue.choices && dialogue.choices.length > 0) {
      this.uiRenderer.showChoices(dialogue.choices);
      return;
    }

    // Move to next dialogue
    this.state.currentDialogue++;
    if (this.state.currentDialogue >= currentScene.dialogue.length) {
      this.emit('end', {});
      return;
    }

    this.showDialogue();
  }

  back(): void {
    if (this.state.currentDialogue > 0) {
      this.state.currentDialogue--;
      this.showDialogue();
    }
  }

  // Handle user choice
  makeChoice(choice: Choice): void {
    this.state.history.push(`Choice: ${choice.text}`);
    this.handleAction(choice.action, choice.target);
  }

  private handleAction(action: string, target?: string): void {
    switch (action) {
      case 'jump':
        if (target) {
          this.startScene(target);
        }
        break;
      case 'end':
        this.emit('end', {});
        break;
      case 'save':
        this.saveGame();
        break;
      case 'load':
        this.loadGame();
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
      this.startScene(this.state.currentScene);
      this.emit('load', { slot });
    }
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

  getAudioManager(): AudioManager {
    return this.audioManager;
  }
} 