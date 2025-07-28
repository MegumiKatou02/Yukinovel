import { Game } from '../Game.js';
import { ConfirmModal } from './ConfirmModal.js';

export class ModalRenderer {
  private game: Game;
  private logContainer: HTMLElement;

  constructor(game: Game, logContainer: HTMLElement) {
    this.game = game;
    this.logContainer = logContainer;
  }

  showExitConfirm(): void {
    ConfirmModal.confirm(this.game, {
      title: this.game.getText('exit.title', 'Thoát game'),
      message: this.game.getText('exit.message', 'Bạn có chắc muốn thoát game? Dữ liệu chưa lưu sẽ bị mất.'),
      confirmText: this.game.getText('exit.confirm', 'Thoát'),
      confirmType: 'danger',
      onConfirm: () => {
        this.game.showMainMenu();
      }
    });
  }

  toggleLog(): void {
    if (this.logContainer.style.display === 'block') {
      this.hideLog();
    } else {
      this.showLog();
    }
  }

  private showLog(): void {
    this.renderLog();
    this.logContainer.style.display = 'block';
  }

  private hideLog(): void {
    this.logContainer.style.display = 'none';
  }

  private renderLog(): void {
    const langManager = this.game.getLanguageManager();
    const globalHistory = this.game.getGlobalDialogueHistory();
    
    let logHtml = `<div class="vn-log-title">${langManager.getText('history.title')}</div>`;
    
    if (globalHistory.length === 0) {
      logHtml += `<div class="vn-log-empty">${langManager.getText('history.empty')}</div>`;
    } else {
      globalHistory.forEach((entry, index) => {
        const { dialogue, sceneId } = entry;
        const characterName = dialogue.character;
        const character = characterName ? this.game.getScript().characters[characterName] : null;
        const scene = this.game.getSceneById(sceneId);
        
        const isFirstDialogueOfScene = index === 0 || globalHistory[index - 1].sceneId !== sceneId;
        if (isFirstDialogueOfScene && scene) {
          logHtml += `<div class="vn-log-scene-header">${scene.id.toUpperCase()}</div>`;
        }
        
        logHtml += `<div class="vn-log-entry">`;
        
        if (character) {
          logHtml += `<div class="vn-log-character-name" style="color: ${character.color || '#fff'};">${character.name}</div>`;
        }
        
        const dialogueText = langManager.getLocalizedText(dialogue.text);
        logHtml += `<div class="vn-log-dialogue-text">${dialogueText}</div>`;
        logHtml += `</div>`;
      });
    }

    const closeButton = document.createElement('div');
    closeButton.className = 'vn-log-close-container';
    closeButton.innerHTML = `
      <button class="vn-modal-button primary">${langManager.getText('ui.close')} (H)</button>
    `;
    
    const button = closeButton.querySelector('button');
    if (button) {
      button.onclick = () => this.hideLog();
    }

    this.logContainer.innerHTML = logHtml;
    this.logContainer.appendChild(closeButton);
    this.logContainer.style.display = 'block';
  }
} 