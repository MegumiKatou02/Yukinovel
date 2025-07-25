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
    this.container.className = 'vn-container vn-no-select';
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
    this.mainMenuContainer.className = 'vn-main-menu-container';
    this.container.appendChild(this.mainMenuContainer);

    /**
     * @description phần Game container
     * Cha: container gốc
     */
    this.gameContainer = document.createElement('div');
    this.gameContainer.id = 'container-game';
    this.gameContainer.className = 'vn-game-container';
    this.container.appendChild(this.gameContainer);

    /**
     * @description phần Background Layer
     * Cha: gameContainer
     */
    this.backgroundElement = document.createElement('div');
    this.backgroundElement.id = 'background-game';
    this.backgroundElement.className = 'vn-background';
    this.gameContainer.appendChild(this.backgroundElement);

    /**
     * @description phần Character layout
     * Cha: gameContainer
     */
    this.characterContainer = document.createElement('div');
    this.characterContainer.id = 'container-character';
    this.characterContainer.className = 'vn-character-container';
    this.gameContainer.appendChild(this.characterContainer);

    /**
     * @description phần UI layer
     * Cha: gameContainer
     */
    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'container-ui';
    this.uiContainer.className = 'vn-ui-container';
    this.gameContainer.appendChild(this.uiContainer);

    /**
     * @description phần Dialogue container
     * Cha: uiContainer
     */
    this.dialogueContainer = document.createElement('div');
    this.dialogueContainer.id = 'container-dialogue';
    this.dialogueContainer.className = 'vn-dialogue-container';
    this.uiContainer.appendChild(this.dialogueContainer);

    /**
     * @description phần Choices container
     * Cha: uiContainer
     */
    this.choicesContainer = document.createElement('div');
    this.choicesContainer.id = 'container-choices';
    this.choicesContainer.className = 'vn-choices-container';
    this.uiContainer.appendChild(this.choicesContainer);

    /**
     * @description phần Controls container
     * Cha: uiContainer
     */
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.id = 'container-controls';
    this.controlsContainer.className = 'vn-controls-container';
    this.uiContainer.appendChild(this.controlsContainer);

    this.createControlButtons();

    /**
     * @description phần Log container
     * Cha: uiContainer
     */
    this.logContainer = document.createElement('div');
    this.logContainer.id = 'container-log';
    this.logContainer.className = 'vn-log-container';
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
      controlDiv.className = 'vn-control-item';
      controlDiv.onclick = control.onClick;

      const keyDiv = document.createElement('div');
      keyDiv.textContent = control.key;
      keyDiv.className = 'vn-control-key';

      const actionDiv = document.createElement('div');
      actionDiv.textContent = control.action;
      actionDiv.className = 'vn-control-action';

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

  updateSceneWithFade(scene: Scene, shouldFadeBackground: boolean, backgroundAnimation?: any): void {
    this.sceneRenderer.updateSceneWithFade(scene, shouldFadeBackground, backgroundAnimation);
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

  getSceneRenderer(): SceneRenderer {
    return this.sceneRenderer;
  }

  showCredits(): void {
    console.log('Credits modal');
  }
} 