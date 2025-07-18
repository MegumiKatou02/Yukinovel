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
  private originalCharacterSprites: { [characterName: string]: string | null | undefined } = {}; // Lưu trữ sprite gốc

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

  private attachEventListeners(): void {
    this.dialogueContainer.addEventListener('click', () => {
      this.game.next();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.game.next();
      }
    });
  }

  // Update scene
  updateScene(scene: Scene): void {
    if (scene.background) {
      this.backgroundElement.style.backgroundImage = `url(${scene.background})`;
    }

    this.updateCharacters(scene.characters || []);
    
    if (scene.characters) {
      scene.characters.forEach(character => {
        // if (character.image) {
          this.originalCharacterSprites[character.name] = character.image;
        // }
      });
    }
  }

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
    
    // Hide choices when showing dialogue **check :v
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
    
    // Add click handlers
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
      // if (character.image) {
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
          background-image: url(${character.image});
          background-size: contain;
          background-position: bottom;
          background-repeat: no-repeat;
          transition: opacity 0.5s ease;
          transform: scale(${scale});
          transform-origin: bottom center;
        `;
        charElement.id = `character-${character.name}`;
        this.characterContainer.appendChild(charElement);
      // }
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
      charElement.style.backgroundImage = `url(${sprite})`;
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
          charElement.style.backgroundImage = `url(${this.originalCharacterSprites[charName]})`;
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
    // Implementation for settings would go here
    console.log('Settings menu would be shown here');
    this.closeMenu(menuOverlay);
  }
} 