import { Scene, DialogueEntry, Choice, Character, MainMenuConfig } from '../types/index.js';
import { Game } from './Game.js';

export class UIRenderer {
  private game: Game;
  private container!: HTMLElement;
  private backgroundElement!: HTMLElement;
  private characterContainer!: HTMLElement;
  private dialogueContainer!: HTMLElement;
  private choicesContainer!: HTMLElement;
  private uiContainer!: HTMLElement;
  private originalCharacterSprites: { [characterName: string]: string | null | undefined } = {};
  private controlsContainer!: HTMLElement;
  private logContainer!: HTMLElement;
  private isLogVisible: boolean = false;
  private mainMenuContainer!: HTMLElement;
  private gameContainer!: HTMLElement;
  
  // Typewriter effect properties
  private isTyping: boolean = false;
  private currentTypewriterTimeout: number | null = null;
  private typewriterSpeed: number = 30; // milliseconds per character
  private currentDialogueText: string = '';
  private currentCharacterName: string = '';
  private currentCharacterColor: string = '#fff';
  private justSkippedTyping: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  // Render initial UI structure
  render(container: HTMLElement): void {
    this.container = container;
    this.container.id = 'container';
    this.createUIStructure();
    this.attachEventListeners();
  }

  private createUIStructure(): void {
    // Main Menu container
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

    // Game container
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

    // Background layer
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

    // Character layer
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

    // UI layer
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.gameContainer.appendChild(this.uiContainer);

    // Dialogue container
    this.dialogueContainer = document.createElement('div');
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

    // Choices container
    this.choicesContainer = document.createElement('div');
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

    // Controls container
    this.controlsContainer = document.createElement('div');
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

    // Log container
    this.logContainer = document.createElement('div');
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

  // Main Menu methods
  showMainMenu(): void {
    this.createMainMenu();
    this.mainMenuContainer.style.display = 'block';
    this.gameContainer.style.display = 'none';
  }

  hideMainMenu(): void {
    this.mainMenuContainer.style.display = 'none';
    this.gameContainer.style.display = 'block';
  }

  private createMainMenu(): void {
    this.mainMenuContainer.innerHTML = '';
    
    const config = this.game.getScript().settings?.mainMenu || {};
    const langManager = this.game.getLanguageManager();
    
    // Background setup
    let backgroundStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
    
    if (config.backgroundColor) {
      backgroundStyle = `background: ${config.backgroundColor};`;
    }
    
    if (config.background) {
      backgroundStyle = `
        background-image: url('${config.background}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `;
    }
    
    if (config.backgroundOverlay) {
      backgroundStyle += `
        position: relative;
      `;
    }
    
    this.mainMenuContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ${backgroundStyle}
      display: flex;
      pointer-events: auto;
    `;
    
    // Overlay
    if (config.backgroundOverlay) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${config.backgroundOverlay};
        z-index: 1;
      `;
      this.mainMenuContainer.appendChild(overlay);
    }
    
    // Main content container
    const contentContainer = document.createElement('div');
    const layout = config.layout || {};
    const alignment = layout.alignment || 'center';
    const padding = layout.padding || 50;
    
    contentContainer.style.cssText = `
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: ${layout.titlePosition === 'top' ? 'flex-start' : layout.titlePosition === 'bottom' ? 'flex-end' : 'center'};
      align-items: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};
      padding: ${padding}px;
      box-sizing: border-box;
    `;
    
    // Title
    const titleConfig = config.title || {};
    const titleDiv = document.createElement('div');
    const titleText = langManager.getLocalizedText(titleConfig.text || this.game.getScript().title || 'Visual Novel');
    const titleColor = titleConfig.color || '#ffffff';
    const titleSize = titleConfig.fontSize || 48;
    const titleFont = titleConfig.fontFamily || 'Arial, sans-serif';
    
    let titleStyle = `
      font-size: ${titleSize}px;
      font-weight: bold;
      color: ${titleColor};
      font-family: ${titleFont};
      margin-bottom: 20px;
      text-align: ${alignment};
    `;
    
    if (titleConfig.shadow) {
      titleStyle += 'text-shadow: 2px 2px 4px rgba(0,0,0,0.5);';
    }
    
    if (titleConfig.gradient) {
      titleStyle += `
        background: ${titleConfig.gradient};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      `;
    }
    
    titleDiv.style.cssText = titleStyle;
    titleDiv.textContent = titleText;
    
    // Animation
    if (titleConfig.animation === 'fade') {
      titleDiv.style.animation = 'fadeIn 2s ease-in-out';
    } else if (titleConfig.animation === 'slide') {
      titleDiv.style.animation = 'slideIn 1s ease-out';
    } else if (titleConfig.animation === 'glow') {
      titleDiv.style.animation = 'glow 2s ease-in-out infinite alternate';
    }
    
    contentContainer.appendChild(titleDiv);
    
    // Subtitle
    const subtitleConfig = config.subtitle || {};
    if (subtitleConfig.show !== false) {
      const subtitleDiv = document.createElement('div');
      const subtitleText = langManager.getLocalizedText(subtitleConfig.text || '') || langManager.getSubtitleText();
      
      subtitleDiv.style.cssText = `
        font-size: ${subtitleConfig.fontSize || 16}px;
        color: ${subtitleConfig.color || '#cccccc'};
        margin-bottom: 50px;
        text-align: ${alignment};
      `;
      subtitleDiv.textContent = subtitleText;
      contentContainer.appendChild(subtitleDiv);
    }
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    const buttonConfig = config.buttons || {};
    const buttonSpacing = buttonConfig.spacing || 15;
    const buttonWidth = buttonConfig.width || 300;
    
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${buttonSpacing}px;
      width: ${buttonWidth}px;
    `;
    
    // Menu buttons
    const menuButtons = [
      { text: langManager.getText('menu.start'), action: () => this.game.startNewGame(), icon: '' },
      { text: langManager.getText('menu.continue'), action: () => this.game.continueGame(), icon: '' },
      { text: langManager.getText('menu.load'), action: () => this.game.loadGame(), icon: '' },
      { text: langManager.getText('menu.settings'), action: () => this.showSettings(buttonsContainer), icon: '' },
      { text: langManager.getText('menu.credits'), action: () => this.showCredits(), icon: '' },
      { text: langManager.getText('menu.exit'), action: () => window.close(), icon: '' }
    ];
    
    menuButtons.forEach(button => {
      const buttonEl = this.createMenuButton(button.text, button.action, button.icon, config);
      buttonsContainer.appendChild(buttonEl);
    });
    
    contentContainer.appendChild(buttonsContainer);
    this.mainMenuContainer.appendChild(contentContainer);
    
    this.addMainMenuAnimations();
  }
  
  private createMenuButton(text: string, action: () => void, icon: string, config: MainMenuConfig): HTMLElement {
    const buttonConfig = config.buttons || {};
    const button = document.createElement('button');
    
    const style = buttonConfig.style || 'modern';
    const color = buttonConfig.color || '#4A90E2';
    const hoverColor = buttonConfig.hoverColor || '#357ABD';
    const textColor = buttonConfig.textColor || '#ffffff';
    const fontSize = buttonConfig.fontSize || 18;
    const borderRadius = buttonConfig.borderRadius || 8;
    
    let buttonStyle = `
      background: ${color};
      color: ${textColor};
      border: none;
      padding: 15px 30px;
      font-size: ${fontSize}px;
      border-radius: ${borderRadius}px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 15px;
      width: 100%;
      box-sizing: border-box;
    `;
    
    // Style variations
    if (style === 'glass') {
      buttonStyle += `
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      `;
    } else if (style === 'minimal') {
      buttonStyle += `
        background: transparent;
        border: 2px solid ${color};
        color: ${color};
      `;
    } else if (style === 'classic') {
      buttonStyle += `
        background: linear-gradient(45deg, ${color}, ${hoverColor});
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      `;
    }
    
    button.style.cssText = buttonStyle;
    button.innerHTML = `<span style="font-size: 20px;">${icon}</span><span>${text}</span>`;
    
    // Hover effects
    button.onmouseover = () => {
      if (style === 'minimal') {
        button.style.background = color;
        button.style.color = textColor;
      } else {
        button.style.background = hoverColor;
      }
      
      if (buttonConfig.animation === 'bounce') {
        button.style.transform = 'scale(1.05)';
      } else if (buttonConfig.animation === 'slide') {
        button.style.transform = 'translateX(10px)';
      }
    };
    
    button.onmouseout = () => {
      if (style === 'minimal') {
        button.style.background = 'transparent';
        button.style.color = color;
      } else {
        button.style.background = color;
      }
      button.style.transform = 'none';
    };
    
    button.onclick = action;
    
    return button;
  }
  
  private addMainMenuAnimations(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes glow {
        from { text-shadow: 0 0 10px rgba(74,144,226,0.5); }
        to { text-shadow: 0 0 20px rgba(74,144,226,1), 0 0 30px rgba(74,144,226,0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  showCredits(): void {
    // Implementation for credits modal
    console.log('Credits modal');
  }

  private createControlButtons(): void {
    const langManager = this.game.getLanguageManager();
    const controls = [
      { key: 'Enter', action: langManager.getText('ui.next'), onClick: () => this.handleNext() },
      { key: 'Esc', action: langManager.getText('ui.home'), onClick: () => this.game.showMainMenu() },
      { key: 'S', action: langManager.getText('ui.save'), onClick: () => this.game.saveGame() },
      { key: 'L', action: langManager.getText('ui.load'), onClick: () => this.game.loadGame() },
      { key: 'H', action: langManager.getText('ui.history'), onClick: () => this.toggleLog() }
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
    if (this.isTyping) {
      this.skipTyping();
    } else if (!this.justSkippedTyping) {
      this.game.next();
    }
  }

  private attachEventListeners(): void {
    this.dialogueContainer.addEventListener('click', () => {
      this.handleNext();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.handleNext();
      } else if (e.code === 'Escape') {
        this.game.showMainMenu();
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
        this.toggleLog();
      }
    });
  }

  private toggleLog(): void {
    const isCurrentlyVisible = this.logContainer.style.display === 'block';
    
    if (isCurrentlyVisible) {
      this.hideLog();
    } else {
      this.showLog();
    }
  }

  private showLog(): void {
    const langManager = this.game.getLanguageManager();
    const globalHistory = this.game.getGlobalDialogueHistory();
    let logHtml = `<div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">${langManager.getText('history.title')}</div>`;
    
    if (globalHistory.length === 0) {
      logHtml += `<div style="text-align: center; color: #ccc; margin: 50px 0;">${langManager.getText('history.empty')}</div>`;
    } else {
      globalHistory.forEach((entry, index) => {
        const { dialogue, sceneId } = entry;
        const characterName = dialogue.character;
        const character = characterName ? this.game.getScript().characters[characterName] : null;
        const scene = this.game.getSceneById(sceneId);
        
        const isFirstDialogueOfScene = index === 0 || globalHistory[index - 1].sceneId !== sceneId;
        if (isFirstDialogueOfScene && scene) {
          logHtml += `<div style="
            margin: 20px 0 10px 0;
            padding: 8px 12px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
            border-left: 4px solid #4A90E2;
          ">${scene.id.toUpperCase()}</div>`;
        }
        
        logHtml += `<div style="margin-bottom: 12px; padding: 8px 12px; background: rgba(255,255,255,0.08); border-radius: 5px;">`;
        
        if (character) {
          logHtml += `<div style="color: ${character.color || '#fff'}; font-weight: bold; margin-bottom: 4px; font-size: 13px;">${character.name}</div>`;
        }
        
        const dialogueText = langManager.getLocalizedText(dialogue.text);
        logHtml += `<div style="line-height: 1.4; font-size: 14px;">${dialogueText}</div>`;
        logHtml += `</div>`;
      });
    }

    const closeButton = document.createElement('div');
    closeButton.style.cssText = `
      text-align: center;
      margin-top: 20px;
      position: sticky;
      bottom: 20px;
    `;
    closeButton.innerHTML = `
      <button style="
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,123,255,0.3);
        transition: all 0.2s ease;
      " onmouseover="this.style.background='#0056b3'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#007bff'; this.style.transform='translateY(0)'">${langManager.getText('ui.close')} (H)</button>
    `;
    
    const button = closeButton.querySelector('button');
    if (button) {
      button.onclick = () => this.hideLog();
    }

    this.logContainer.innerHTML = logHtml;
    this.logContainer.appendChild(closeButton);
    this.logContainer.style.display = 'block';
    this.isLogVisible = true;
  }

  private hideLog(): void {
    this.logContainer.style.display = 'none';
    this.isLogVisible = false;
  }

  // Update scene
  updateScene(scene: Scene): void {
    if (scene.background) {
      this.backgroundElement.style.backgroundImage = `url(${scene.background})`;
    }

    this.updateCharacters(scene.characters || []);
    
    if (scene.characters) {
      scene.characters.forEach(character => {
        this.originalCharacterSprites[character.name] = character.image;
      });
    }
  }

  // Update dialogue
  updateDialogue(dialogue: DialogueEntry): void {
    const characterName = dialogue.character;
    const character = characterName ? this.game.getScript().characters[characterName] : null;
    
    this.stopTyping();
    
    const localizedText = this.game.getLanguageManager().getLocalizedText(dialogue.text);
    
    this.currentDialogueText = localizedText;
    this.currentCharacterName = character ? character.name : '';
    this.currentCharacterColor = character ? character.color || '#fff' : '#fff';
    
    this.startTypewriter();
    
    this.choicesContainer.style.display = 'none';

    if (character && dialogue.emotion && character.emotions) {
      this.updateCharacterEmotion(characterName!, dialogue.emotion);
    }

    if (character && dialogue.sprite) {
      this.updateCharacterSprite(characterName!, dialogue.sprite);
    }

    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        this.updateCharacterSprite(charName, dialogue.characterSprite![charName]);
      });
    }

    this.restoreUnspecifiedCharacterSprites(dialogue);
  }

  // Typewriter effect methods
  private startTypewriter(): void {
    this.isTyping = true;
    this.justSkippedTyping = false;
    this.dialogueContainer.style.display = 'block';
    this.typeText('', 0);
  }

  private typeText(currentText: string, index: number): void {
    if (index >= this.currentDialogueText.length) {
      this.isTyping = false;
      return;
    }

    const nextChar = this.currentDialogueText[index];
    const newText = currentText + nextChar;
    
    let html = '';
    if (this.currentCharacterName) {
      html += `<div style="color: ${this.currentCharacterColor}; font-weight: bold; margin-bottom: 10px;">${this.currentCharacterName}</div>`;
    }
    html += `<div style="font-size: 18px; line-height: 1.4;">${newText}</div>`;
    
    this.dialogueContainer.innerHTML = html;
    
    // đệ quy
    this.currentTypewriterTimeout = window.setTimeout(() => {
      this.typeText(newText, index + 1);
    }, this.typewriterSpeed);
  }

  private stopTyping(): void {
    if (this.currentTypewriterTimeout) {
      clearTimeout(this.currentTypewriterTimeout);
      this.currentTypewriterTimeout = null;
    }
  }

  private skipTyping(): void {
    if (this.isTyping) {
      this.stopTyping();
      this.isTyping = false;
      this.justSkippedTyping = true;
      
      let html = '';
      if (this.currentCharacterName) {
        html += `<div style="color: ${this.currentCharacterColor}; font-weight: bold; margin-bottom: 10px;">${this.currentCharacterName}</div>`;
      }
      html += `<div style="font-size: 18px; line-height: 1.4;">${this.currentDialogueText}</div>`;
      
      this.dialogueContainer.innerHTML = html;
      
      setTimeout(() => {
        this.justSkippedTyping = false;
      }, 100);
    }
  }

  // Show choices
  showChoices(choices: Choice[]): void {
    const langManager = this.game.getLanguageManager();
    this.dialogueContainer.style.display = 'none';
    this.choicesContainer.style.display = 'block';
    
    let html = '';
    choices.forEach((choice, index) => {
      const choiceText = langManager.getLocalizedText(choice.text);
      html += `
        <button 
          class="choice-button" 
          data-index="${index}"
          style="
            display: block;
            width: 100%;
            margin: 10px 0;
            padding: 15px 20px;
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s ease;
          "
          onmouseover="this.style.background='rgba(255,255,255,1)'"
          onmouseout="this.style.background='rgba(255,255,255,0.9)'"
        >
          ${choiceText}
        </button>
      `;
    });
    
    this.choicesContainer.innerHTML = html;
    
    this.choicesContainer.querySelectorAll('.choice-button').forEach((button, index) => {
      button.addEventListener('click', () => {
        this.game.makeChoice(choices[index]);
      });
    });
  }

  // Update characters
  private updateCharacters(characters: Character[]): void {
    this.characterContainer.innerHTML = '';
    
    characters.forEach((character, index) => {
      const charElement = document.createElement('div');
      
      const position = character.position || {};
      const x = position.x !== undefined ? position.x : (20 + index * 200);
      const y = position.y !== undefined ? position.y : 0;
      const width = position.width || 300;
      const height = position.height || 400;
      const scale = position.scale || 1;
      
      const xValue = typeof x === 'string' ? x : `${x}px`;
      const yValue = typeof y === 'string' ? y : `${y}px`;
      
      charElement.style.cssText = `
        position: absolute;
        bottom: ${yValue};
        left: ${xValue};
        width: ${width}px;
        height: ${height}px;
        background-image: url(${character.image || ''});
        background-size: contain;
        background-position: bottom;
        background-repeat: no-repeat;
        transition: opacity 0.5s ease;
        transform: scale(${scale});
        transform-origin: bottom center;
      `;
      charElement.id = `character-${character.name}`;
      this.characterContainer.appendChild(charElement);
    });
  }

  private updateCharacterEmotion(characterName: string, emotion: string): void {
    const character = this.game.getScript().characters[characterName];
    if (character && character.emotions && character.emotions[emotion]) {
      const charElement = document.getElementById(`character-${characterName}`);
      if (charElement) {
        charElement.style.backgroundImage = `url(${character.emotions[emotion]})`;
      }
    }
  }

  private updateCharacterSprite(characterName: string, sprite: string | null): void {
    const charElement = document.getElementById(`character-${characterName}`);
    if (charElement) {
      charElement.style.backgroundImage = `url(${sprite || ''})`;
    }
  }

  private restoreUnspecifiedCharacterSprites(dialogue: DialogueEntry): void {
    const specifiedCharacters = new Set<string>();
    
    if (dialogue.character && dialogue.sprite) {
      specifiedCharacters.add(dialogue.character);
    }
    
    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        specifiedCharacters.add(charName);
      });
    }
    
    Object.keys(this.originalCharacterSprites).forEach(charName => {
      if (!specifiedCharacters.has(charName)) {
        const charElement = document.getElementById(`character-${charName}`);
        if (charElement) {
          charElement.style.backgroundImage = `url(${this.originalCharacterSprites[charName] || ''})`;
        }
      }
    });
  }

  private showSettings(menuOverlay: HTMLElement): void {
    const langManager = this.game.getLanguageManager();
    const config = this.game.getScript().settings?.mainMenu || {};
    
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    
    let backgroundStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
    
    if (config.backgroundColor) {
      backgroundStyle = `background: ${config.backgroundColor};`;
    }
    
    if (config.background) {
      backgroundStyle = `
        background-image: url('${config.background}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `;
    }
    
    settingsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ${backgroundStyle}
      color: white;
      overflow-y: auto;
      pointer-events: auto;
      z-index: 1000;
    `;

    // Background overlay (same as main menu)
    if (config.backgroundOverlay) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${config.backgroundOverlay};
        z-index: 1;
      `;
      settingsContainer.appendChild(overlay);
    }

    // Main content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 40px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    `;

    // Header section
    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
      text-align: center;
      margin-bottom: 60px;
    `;

    const settingsTitle = document.createElement('h1');
    settingsTitle.textContent = langManager.getText('menu.settings');
    settingsTitle.style.cssText = `
      font-size: 42px;
      font-weight: bold;
      margin: 0 0 15px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      color: white;
    `;

    const settingsSubtitle = document.createElement('p');
    settingsSubtitle.textContent = langManager.getText('settings.subtitle', 'Tùy chỉnh trải nghiệm game của bạn');
    settingsSubtitle.style.cssText = `
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
      color: #f0f0f0;
    `;

    headerSection.appendChild(settingsTitle);
    headerSection.appendChild(settingsSubtitle);
    contentContainer.appendChild(headerSection);

    // Settings sections container
    const sectionsContainer = document.createElement('div');
    sectionsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 30px;
      flex: 1;
      margin-bottom: 40px;
    `;

    // Language Settings Section
    const languageSection = this.createSimpleSettingsSection(
      langManager.getText('settings.language'),
      langManager.getText('settings.language.desc'),
      'lang'
    );

    const languageSelect = document.createElement('select');
    languageSelect.style.cssText = `
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      background: rgba(0,0,0,0.3);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    // Language options
    const availableLanguages = this.game.getAvailableLanguages();
    const currentLanguage = this.game.getCurrentLanguage();

    availableLanguages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      option.style.cssText = `
        background: #333;
        color: white;
      `;
      if (lang.code === currentLanguage) {
        option.selected = true;
      }
      languageSelect.appendChild(option);
    });

    languageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.game.setLanguage(target.value);
    });

    languageSelect.addEventListener('focus', () => {
      languageSelect.style.borderColor = 'rgba(255,255,255,0.6)';
      languageSelect.style.background = 'rgba(0,0,0,0.5)';
    });

    languageSelect.addEventListener('blur', () => {
      languageSelect.style.borderColor = 'rgba(255,255,255,0.3)';
      languageSelect.style.background = 'rgba(0,0,0,0.3)';
    });

    languageSection.appendChild(languageSelect);
    sectionsContainer.appendChild(languageSection);

    // Text Speed Settings Section
    const textSpeedSection = this.createSimpleSettingsSection(
      langManager.getText('settings.textSpeed'),
      langManager.getText('settings.textSpeed.desc'),
      'speed'
    );

    const speedContainer = document.createElement('div');
    speedContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    `;

    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '10';
    speedSlider.max = '100';
    speedSlider.value = this.typewriterSpeed.toString();
    speedSlider.style.cssText = `
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.3);
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
    `;

    const speedValue = document.createElement('span');
    speedValue.textContent = this.typewriterSpeed + 'ms';
    speedValue.style.cssText = `
      min-width: 60px;
      text-align: center;
      font-weight: bold;
      color: white;
      background: rgba(0,0,0,0.3);
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.3);
    `;

    speedValue.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      this.typewriterSpeed = Number.parseInt(target.value);
    });

    speedSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.typewriterSpeed = parseInt(target.value);
      speedValue.textContent = target.value + 'ms';
    });

    speedContainer.appendChild(speedSlider);
    speedContainer.appendChild(speedValue);

    // Speed presets
    const speedPresets = document.createElement('div');
    speedPresets.style.cssText = `
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    `;

    const presets = [
      { label: langManager.getText('ui.slow'), value: 60 },
      { label: langManager.getText('ui.normal'), value: 30 },
      { label: langManager.getText('ui.fast'), value: 15 },
      { label: langManager.getText('ui.veryfast'), value: 5 }
    ];

    presets.forEach(preset => {
      const presetButton = document.createElement('button');
      presetButton.textContent = preset.label;
      presetButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 6px;
        background: rgba(0,0,0,0.3);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      `;

      presetButton.addEventListener('click', () => {
        this.typewriterSpeed = preset.value;
        speedSlider.value = preset.value.toString();
        speedValue.textContent = preset.value + 'ms';
      });

      presetButton.addEventListener('mouseenter', () => {
        presetButton.style.background = 'rgba(255,255,255,0.2)';
        presetButton.style.borderColor = 'rgba(255,255,255,0.6)';
      });

      presetButton.addEventListener('mouseleave', () => {
        presetButton.style.background = 'rgba(0,0,0,0.3)';
        presetButton.style.borderColor = 'rgba(255,255,255,0.4)';
      });

      speedPresets.appendChild(presetButton);
    });

    textSpeedSection.appendChild(speedContainer);
    textSpeedSection.appendChild(speedPresets);
    sectionsContainer.appendChild(textSpeedSection);

    // Keyboard Shortcuts Section
    const shortcutsSection = this.createSimpleSettingsSection(
      langManager.getText('settings.shortcuts', 'Phím tắt'),
      langManager.getText('settings.shortcuts.desc'),
      'keys'
    );

    const shortcutsList = document.createElement('div');
    shortcutsList.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    `;

    const shortcuts = [
      { key: 'Space / Enter', action: langManager.getText('ui.next') },
      { key: 'Esc', action: langManager.getText('ui.home') },
      { key: 'S', action: langManager.getText('ui.save') },
      { key: 'L', action: langManager.getText('ui.load') },
      { key: 'H', action: langManager.getText('ui.history') },
      { key: 'Esc', action: langManager.getText('ui.menu', 'Menu') }
    ];

    shortcuts.forEach(shortcut => {
      const shortcutItem = document.createElement('div');
      shortcutItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: rgba(0,0,0,0.3);
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        transition: all 0.3s ease;
      `;

      const keyElement = document.createElement('span');
      keyElement.textContent = shortcut.key;
      keyElement.style.cssText = `
        background: rgba(255,255,255,0.2);
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        min-width: 80px;
        text-align: center;
        font-size: 13px;
        border: 1px solid rgba(255,255,255,0.3);
      `;

      const actionElement = document.createElement('span');
      actionElement.textContent = shortcut.action;
      actionElement.style.cssText = `
        flex: 1;
        font-size: 14px;
        color: #f0f0f0;
      `;

      shortcutItem.appendChild(keyElement);
      shortcutItem.appendChild(actionElement);

      shortcutItem.addEventListener('mouseenter', () => {
        shortcutItem.style.background = 'rgba(255,255,255,0.1)';
        shortcutItem.style.borderColor = 'rgba(255,255,255,0.4)';
      });

      shortcutItem.addEventListener('mouseleave', () => {
        shortcutItem.style.background = 'rgba(0,0,0,0.3)';
        shortcutItem.style.borderColor = 'rgba(255,255,255,0.2)';
      });

      shortcutsList.appendChild(shortcutItem);
    });

    shortcutsSection.appendChild(shortcutsList);
    sectionsContainer.appendChild(shortcutsSection);

    contentContainer.appendChild(sectionsContainer);

    const footerSection = document.createElement('div');
    footerSection.style.cssText = `
      text-align: center;
      margin-top: auto;
      padding-top: 20px;
    `;

    const closeButton = document.createElement('button');
    closeButton.className = 'back-menu';
    closeButton.textContent = `← ${langManager.getText('ui.back')}`;
    closeButton.style.cssText = `
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 8px;
      background: rgba(0,0,0,0.3);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    `;

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(255,255,255,0.2)';
      closeButton.style.borderColor = 'rgba(255,255,255,0.6)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(0,0,0,0.3)';
      closeButton.style.borderColor = 'rgba(255,255,255,0.4)';
    });

    closeButton.onclick = () => {
      menuOverlay.remove();
      this.showMainMenu();
    };

    footerSection.appendChild(closeButton);
    contentContainer.appendChild(footerSection);

    settingsContainer.appendChild(contentContainer);

    menuOverlay.innerHTML = '';
    menuOverlay.appendChild(settingsContainer);
  }

  private createSimpleSettingsSection(title: string, description: string, iconType: string): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: rgba(0,0,0,0.4);
      border-radius: 10px;
      padding: 25px;
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    `;

    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    if (iconType === 'lang') {
      iconElement.innerHTML = `
        <div style="width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; position: relative;">
          <div style="position: absolute; top: -2px; left: 6px; width: 4px; height: 20px; border-left: 1px solid white;"></div>
          <div style="position: absolute; top: 6px; left: -2px; width: 20px; height: 4px; border-top: 1px solid white;"></div>
        </div>
      `;
    } else if (iconType === 'speed') {
      iconElement.innerHTML = `
        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 12px solid white; transform: rotate(-45deg);"></div>
      `;
    } else if (iconType === 'keys') {
      iconElement.innerHTML = `
        <div style="display: flex; gap: 2px;">
          <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
          <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
          <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
        </div>
      `;
    }

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: white;
    `;

    header.appendChild(iconElement);
    header.appendChild(titleElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    descriptionElement.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 14px;
      opacity: 0.8;
      color: #e0e0e0;
      line-height: 1.4;
    `;

    section.appendChild(header);
    section.appendChild(descriptionElement);

    section.addEventListener('mouseenter', () => {
      section.style.background = 'rgba(0,0,0,0.5)';
      section.style.borderColor = 'rgba(255,255,255,0.3)';
    });

    section.addEventListener('mouseleave', () => {
      section.style.background = 'rgba(0,0,0,0.4)';
      section.style.borderColor = 'rgba(255,255,255,0.2)';
    });

    return section;
  }
} 