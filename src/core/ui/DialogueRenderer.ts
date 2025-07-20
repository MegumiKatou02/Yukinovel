import { DialogueEntry, Choice } from '../../types/index.js';
import { Game } from '../Game.js';

export class DialogueRenderer {
  private game: Game;
  private dialogueContainer: HTMLElement;
  private choicesContainer: HTMLElement;
  
  // Typewriter effect properties
  private isTyping: boolean = false;
  private currentTypewriterTimeout: number | null = null;
  private typewriterSpeed: number = 20;
  private currentDialogueText: string = '';
  private currentCharacterName: string = '';
  private currentCharacterColor: string = '#fff';
  private justSkippedTyping: boolean = false;

  constructor(game: Game, dialogueContainer: HTMLElement, choicesContainer: HTMLElement) {
    this.game = game;
    this.dialogueContainer = dialogueContainer;
    this.choicesContainer = choicesContainer;
  }

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
  }

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

  handleNext(): void {
    if (this.isTyping) {
      this.skipTyping();
    } else if (!this.justSkippedTyping) {
      this.game.next();
    }
  }

  setTypewriterSpeed(speed: number): void {
    this.typewriterSpeed = speed;
  }

  getTypewriterSpeed(): number {
    return this.typewriterSpeed;
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
    
    // Đệ quy
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
} 