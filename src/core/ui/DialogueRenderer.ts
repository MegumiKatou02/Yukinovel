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
  
  private htmlNodes: Array<{type: 'text' | 'html', content: string}> = [];
  private currentNodeIndex: number = 0;
  private currentTextIndex: number = 0;

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
    
    this.parseHtmlContent(localizedText);
    
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
          class="vn-choice-button" 
          data-index="${index}"
        >
          ${choiceText}
        </button>
      `;
    });
    
    this.choicesContainer.innerHTML = html;
    
    this.choicesContainer.querySelectorAll('.vn-choice-button').forEach((button, index) => {
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

  private parseHtmlContent(htmlText: string): void {
    this.htmlNodes = [];
    this.currentNodeIndex = 0;
    this.currentTextIndex = 0;
    
    const htmlRegex = /<[^>]+>/g;
    let lastIndex = 0;
    let match;
    
    while ((match = htmlRegex.exec(htmlText)) !== null) {
      if (match.index > lastIndex) {
        const textContent = htmlText.substring(lastIndex, match.index);
        if (textContent) {
          this.htmlNodes.push({type: 'text', content: textContent});
        }
      }
      
      this.htmlNodes.push({type: 'html', content: match[0]});
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < htmlText.length) {
      const textContent = htmlText.substring(lastIndex);
      if (textContent) {
        this.htmlNodes.push({type: 'text', content: textContent});
      }
    }
    
    if (this.htmlNodes.length === 0) {
      this.htmlNodes.push({type: 'text', content: htmlText});
    }
  }

  // Typewriter effect methods
  private startTypewriter(): void {
    this.isTyping = true;
    this.justSkippedTyping = false;
    this.dialogueContainer.style.display = 'block';
    this.currentNodeIndex = 0;
    this.currentTextIndex = 0;
    this.typeHtmlText();
  }

  private typeHtmlText(): void {
    if (this.currentNodeIndex >= this.htmlNodes.length) {
      this.isTyping = false;
      return;
    }

    const currentNode = this.htmlNodes[this.currentNodeIndex];
    
    if (currentNode.type === 'html') {
      this.currentNodeIndex++;
      this.currentTextIndex = 0;
      this.updateDialogueDisplay();
      this.currentTypewriterTimeout = window.setTimeout(() => {
        this.typeHtmlText();
      }, 1);
    } else {
      if (this.currentTextIndex >= currentNode.content.length) {
        this.currentNodeIndex++;
        this.currentTextIndex = 0;
        this.currentTypewriterTimeout = window.setTimeout(() => {
          this.typeHtmlText();
        }, this.typewriterSpeed);
      } else {
        this.currentTextIndex++;
        this.updateDialogueDisplay();
        this.currentTypewriterTimeout = window.setTimeout(() => {
          this.typeHtmlText();
        }, this.typewriterSpeed);
      }
    }
  }

  private updateDialogueDisplay(): void {
    let displayText = '';
    
    for (let i = 0; i <= this.currentNodeIndex; i++) {
      const node = this.htmlNodes[i];
      if (!node) break;
      
      if (i < this.currentNodeIndex) {
        displayText += node.content;
      } else if (i === this.currentNodeIndex) {
        if (node.type === 'html') {
          displayText += node.content;
        } else {
          displayText += node.content.substring(0, this.currentTextIndex);
        }
      }
    }
    
    let html = '';
    if (this.currentCharacterName) {
      html += `<div class="vn-dialogue-character-name" style="color: ${this.currentCharacterColor};">${this.currentCharacterName}</div>`;
    }
    html += `<div class="vn-dialogue-text">${displayText}</div>`;
    
    this.dialogueContainer.innerHTML = html;
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
        html += `<div class="vn-dialogue-character-name" style="color: ${this.currentCharacterColor};">${this.currentCharacterName}</div>`;
      }
      html += `<div class="vn-dialogue-text">${this.currentDialogueText}</div>`;
      
      this.dialogueContainer.innerHTML = html;
      
      setTimeout(() => {
        this.justSkippedTyping = false;
      }, 100);
    }
  }
} 