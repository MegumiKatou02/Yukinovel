import { Scene, DialogueEntry, Choice, Character } from '../types/index.js';
import { Game } from './Game.js';
import { MainMenuRenderer } from './ui/MainMenuRenderer.js';
import { DialogueRenderer } from './ui/DialogueRenderer.js';
import { SceneRenderer } from './ui/SceneRenderer.js';
import { ModalRenderer } from './ui/ModalRenderer.js';

export class UIRenderer {
  private game: Game;
  /**
   * container chính/tổng của game
   */
  private container!: HTMLElement;
  
  // UI Elements
  private backgroundElement!: HTMLElement;
  private characterContainer!: HTMLElement;
  private dialogueContainer!: HTMLElement;
  private choicesContainer!: HTMLElement;
  private uiContainer!: HTMLElement;
  private controlsContainer!: HTMLElement;
  private logContainer!: HTMLElement;
  private mainMenuContainer!: HTMLElement;
  private gameContainer!: HTMLElement;
  
  // Renderers
  private mainMenuRenderer!: MainMenuRenderer;
  private dialogueRenderer!: DialogueRenderer;
  private sceneRenderer!: SceneRenderer;
  private modalRenderer!: ModalRenderer;

  constructor(game: Game) {
    this.game = game;
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.container.id = 'container';
    this.createUIStructure();
    this.initializeRenderers();
    this.attachEventListeners();
  }

  private createUIStructure(): void {
    /**
     * @description phần Main Menu container
     * Cha: container gốc
     */
    this.mainMenuContainer = document.createElement('div');
    this.mainMenuContainer.id = 'container-menu';
    this.mainMenuContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      pointer-events: auto;
    `;
    this.container.appendChild(this.mainMenuContainer);

    /**
     * @description phần Game container
     * Cha: container gốc
     */
    this.gameContainer = document.createElement('div');
    this.gameContainer.id = 'container-game';
    this.gameContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;
    this.container.appendChild(this.gameContainer);

    /**
     * @description phần Background Layer
     * Cha: gameContainer
     */
    this.backgroundElement = document.createElement('div');
    this.backgroundElement.id = 'background-game';
    this.backgroundElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: opacity 0.5s ease;
    `;
    this.gameContainer.appendChild(this.backgroundElement);

    /**
     * @description phần Character layout
     * Cha: gameContainer
     */
    this.characterContainer = document.createElement('div');
    this.characterContainer.id = 'container-character';
    this.characterContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.gameContainer.appendChild(this.characterContainer);

    /**
     * @description phần UI layer
     * Cha: gameContainer
     */
    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'container-ui';
    this.uiContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.gameContainer.appendChild(this.uiContainer);

    /**
     * @description phần Dialogue container
     * Cha: uiContainer
     */
    this.dialogueContainer = document.createElement('div');
    this.dialogueContainer.id = 'container-dialogue';
    this.dialogueContainer.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 200px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9));
      color: white;
      padding: 20px;
      box-sizing: border-box;
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.3s ease;
    `;
    this.uiContainer.appendChild(this.dialogueContainer);

    /**
     * @description phần Choices container
     * Cha: uiContainer
     */
    this.choicesContainer = document.createElement('div');
    this.choicesContainer.id = 'container-choices';
    this.choicesContainer.style.cssText = `
      position: absolute;
      bottom: 220px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      max-width: 600px;
      pointer-events: auto;
      display: none;
    `;
    this.uiContainer.appendChild(this.choicesContainer);

    /**
     * @description phần Controls container
     * Cha: uiContainer
     */
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.id = 'container-controls';
    this.controlsContainer.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      color: white;
      background-color: rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      backdrop-filter: blur(5px);
      pointer-events: auto;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    `;
    this.controlsContainer.onmouseover = () => this.controlsContainer.style.opacity = '1';
    this.controlsContainer.onmouseout = () => this.controlsContainer.style.opacity = '0.8';
    this.uiContainer.appendChild(this.controlsContainer);

    this.createControlButtons();

    /**
     * @description phần Log container
     * Cha: uiContainer
     */
    this.logContainer = document.createElement('div');
    this.logContainer.id = 'container-log';
    this.logContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      color: white;
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
      display: none;
      pointer-events: auto;
    `;
    this.uiContainer.appendChild(this.logContainer);
  }

  private initializeRenderers(): void {
    this.mainMenuRenderer = new MainMenuRenderer(this.game, this.mainMenuContainer);
    this.dialogueRenderer = new DialogueRenderer(this.game, this.dialogueContainer, this.choicesContainer);
    this.sceneRenderer = new SceneRenderer(this.game, this.backgroundElement, this.characterContainer);
    this.modalRenderer = new ModalRenderer(this.game, this.logContainer);
  }

  private createControlButtons(): void {
    const langManager = this.game.getLanguageManager();
    const controls = [
      { key: 'Enter', action: langManager.getText('ui.next'), onClick: () => this.handleNext() },
      { key: 'Esc', action: langManager.getText('exit.title', 'Thoát'), onClick: () => this.modalRenderer.showExitConfirm() },
      { key: 'S', action: langManager.getText('ui.save'), onClick: () => this.game.saveGame() },
      { key: 'L', action: langManager.getText('ui.load'), onClick: () => this.game.loadGame() },
      { key: 'H', action: langManager.getText('ui.history'), onClick: () => this.modalRenderer.toggleLog() }
    ];

    controls.forEach(control => {
      const controlDiv = document.createElement('div');
      controlDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 4px 6px;
        border-radius: 4px;
        opacity: 0.8;
      `;
      controlDiv.onmouseover = () => {
        controlDiv.style.opacity = '1';
        controlDiv.style.backgroundColor = 'rgba(255,255,255,0.1)';
      };
      controlDiv.onmouseout = () => {
        controlDiv.style.opacity = '0.8';
        controlDiv.style.backgroundColor = 'transparent';
      };
      controlDiv.onclick = control.onClick;

      const keyDiv = document.createElement('div');
      keyDiv.textContent = control.key;
      keyDiv.style.cssText = `
        background: rgba(255,255,255,0.2);
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
        font-size: 10px;
        min-width: 20px;
        text-align: center;
      `;

      const actionDiv = document.createElement('div');
      actionDiv.textContent = control.action;
      actionDiv.style.cssText = `
        font-size: 10px;
        white-space: nowrap;
      `;

      controlDiv.appendChild(keyDiv);
      controlDiv.appendChild(actionDiv);
      this.controlsContainer.appendChild(controlDiv);
    });
  }

  private handleNext(): void {
    this.dialogueRenderer.handleNext();
  }

  private attachEventListeners(): void {
    this.dialogueContainer.addEventListener('click', () => {
      this.handleNext();
    });

    const gameContainer = document.querySelector('#container-game') as HTMLElement;

    document.addEventListener('keydown', (e) => {
      if (gameContainer.style.display === 'none') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.handleNext();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        this.modalRenderer.showExitConfirm();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        this.game.back();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        this.game.saveGame();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        this.game.loadGame();
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        this.modalRenderer.toggleLog();
      }
    });
  }

  showMainMenu(): void {
    this.mainMenuRenderer.show();
    this.gameContainer.style.display = 'none';
  }

  hideMainMenu(): void {
    this.mainMenuRenderer.hide();
    this.gameContainer.style.display = 'block';
  }

  updateScene(scene: Scene): void {
    this.sceneRenderer.updateScene(scene);
  }

  updateDialogue(dialogue: DialogueEntry): void {
    this.dialogueRenderer.updateDialogue(dialogue);
    this.sceneRenderer.updateCharacterSprites(dialogue);
  }

  showChoices(choices: Choice[]): void {
    this.dialogueRenderer.showChoices(choices);
  }

  getTypewriterSpeed(): number {
    return this.dialogueRenderer.getTypewriterSpeed();
  }

  setTypewriterSpeed(speed: number): void {
    this.dialogueRenderer.setTypewriterSpeed(speed);
  }

  showCredits(): void {
    console.log('Credits modal');
  }
} 