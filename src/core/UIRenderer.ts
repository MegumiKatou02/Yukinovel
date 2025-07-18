import { Scene, DialogueEntry, Choice, Character } from '../types/index.js';
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

  constructor(game: Game) {
    this.game = game;
  }

  // Render initial UI structure
  render(container: HTMLElement): void {
    this.container = container;
    this.createUIStructure();
    this.attachEventListeners();
  }

  private createUIStructure(): void {
    // Background layer
    this.backgroundElement = document.createElement('div');
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
    this.container.appendChild(this.backgroundElement);

    // Character layer
    this.characterContainer = document.createElement('div');
    this.characterContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.container.appendChild(this.characterContainer);

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
    this.container.appendChild(this.uiContainer);

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

    // Menu button
    const menuButton = document.createElement('button');
    menuButton.textContent = '☰';
    menuButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 10px 15px;
      font-size: 18px;
      cursor: pointer;
      border-radius: 5px;
      pointer-events: auto;
    `;
    menuButton.onclick = () => this.showMenu();
    this.uiContainer.appendChild(menuButton);
  }

  private createControlButtons(): void {
    const controls = [
      { key: 'Enter', action: 'Tiếp tục', onClick: () => this.game.next() },
      { key: '←', action: 'Quay lại', onClick: () => this.game.back() },
      { key: 'S', action: 'Lưu', onClick: () => this.game.saveGame() },
      { key: 'L', action: 'Tải', onClick: () => this.game.loadGame() },
      { key: 'H', action: 'Lịch sử', onClick: () => this.toggleLog() }
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

  private attachEventListeners(): void {
    this.dialogueContainer.addEventListener('click', () => {
      this.game.next();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.game.next();
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
    const globalHistory = this.game.getGlobalDialogueHistory();
    let logHtml = '<div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">Lịch sử hội thoại toàn bộ</div>';
    
    if (globalHistory.length === 0) {
      logHtml += '<div style="text-align: center; color: #ccc; margin: 50px 0;">Chưa có lịch sử hội thoại</div>';
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
        
        logHtml += `<div style="line-height: 1.4; font-size: 14px;">${dialogue.text}</div>`;
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
      " onmouseover="this.style.background='#0056b3'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#007bff'; this.style.transform='translateY(0)'">Đóng (H)</button>
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
    
    let html = '';
    
    if (character) {
      html += `<div style="color: ${character.color || '#fff'}; font-weight: bold; margin-bottom: 10px;">${character.name}</div>`;
    }
    
    html += `<div style="font-size: 18px; line-height: 1.4;">${dialogue.text}</div>`;
    
    this.dialogueContainer.innerHTML = html;
    this.dialogueContainer.style.display = 'block';
    
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

  // Show choices
  showChoices(choices: Choice[]): void {
    this.dialogueContainer.style.display = 'none';
    this.choicesContainer.style.display = 'block';
    
    let html = '';
    choices.forEach((choice, index) => {
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
          ${choice.text}
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

  private showMenu(): void {
    const menuOverlay = document.createElement('div');
    menuOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: auto;
    `;

    const menuContent = document.createElement('div');
    menuContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      min-width: 300px;
    `;

    const menuButtons = [
      { text: 'Tiếp tục', action: () => this.closeMenu(menuOverlay) },
      { text: 'Lưu game', action: () => { this.game.saveGame(); this.closeMenu(menuOverlay); } },
      { text: 'Tải game', action: () => { this.game.loadGame(); this.closeMenu(menuOverlay); } },
      { text: 'Cài đặt', action: () => this.showSettings(menuOverlay) }
    ];

    menuButtons.forEach(button => {
      const btn = document.createElement('button');
      btn.textContent = button.text;
      btn.style.cssText = `
        display: block;
        width: 100%;
        margin: 10px 0;
        padding: 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
      `;
      btn.onclick = button.action;
      menuContent.appendChild(btn);
    });

    menuOverlay.appendChild(menuContent);
    this.uiContainer.appendChild(menuOverlay);
  }

  private closeMenu(menuOverlay: HTMLElement): void {
    menuOverlay.remove();
  }

  private showSettings(menuOverlay: HTMLElement): void {
    console.log('Settings menu would be shown here');
    this.closeMenu(menuOverlay);
  }
} 