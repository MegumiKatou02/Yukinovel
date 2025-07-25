import { Game } from '../Game.js';

export class ModalRenderer {
  private game: Game;
  private exitConfirmModal: HTMLElement | null = null;
  private logContainer: HTMLElement;
  private isLogVisible: boolean = false;

  constructor(game: Game, logContainer: HTMLElement) {
    this.game = game;
    this.logContainer = logContainer;
  }

  showExitConfirm(): void {
    if (this.exitConfirmModal) return;

    const langManager = this.game.getLanguageManager();
    
    this.exitConfirmModal = document.createElement('div');
    this.exitConfirmModal.className = 'vn-modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'vn-modal';

    const title = document.createElement('h3');
    title.textContent = langManager.getText('exit.title', 'Xác nhận thoát');
    title.className = 'vn-modal-title';

    const message = document.createElement('p');
    message.textContent = langManager.getText('exit.message', 'Bạn có chắc chắn muốn thoát về menu chính không?');
    message.className = 'vn-modal-content';

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'vn-modal-buttons';

    const yesButton = document.createElement('button');
    yesButton.textContent = langManager.getText('ui.yes', 'Có');
    yesButton.className = 'vn-modal-button primary';

    const noButton = document.createElement('button');
    noButton.textContent = langManager.getText('ui.no', 'Không');
    noButton.className = 'vn-modal-button secondary';

    yesButton.onclick = () => {
      this.hideExitConfirm();
      this.game.showMainMenu();
    };

    noButton.onclick = () => {
      this.hideExitConfirm();
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hideExitConfirm();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        noButton.click();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    (this.exitConfirmModal as any).keyHandler = handleKeyPress;

    buttonsContainer.appendChild(yesButton);
    buttonsContainer.appendChild(noButton);
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(buttonsContainer);
    this.exitConfirmModal.appendChild(modalContent);
    document.body.appendChild(this.exitConfirmModal);

    // Add fade-in animation
    this.exitConfirmModal.classList.add('vn-fade-in');
  }

  private hideExitConfirm(): void {
    if (!this.exitConfirmModal) return;

    const keyHandler = (this.exitConfirmModal as any).keyHandler;
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
    }

    this.exitConfirmModal.classList.add('vn-fade-out');

    setTimeout(() => {
      if (this.exitConfirmModal) {
        document.body.removeChild(this.exitConfirmModal);
        this.exitConfirmModal = null;
      }
    }, 300);
  }

  toggleLog(): void {
    if (this.isLogVisible) {
      this.hideLog();
    } else {
      this.showLog();
    }
  }

  private showLog(): void {
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
    this.isLogVisible = true;
  }

  private hideLog(): void {
    this.logContainer.style.display = 'none';
    this.isLogVisible = false;
  }
} 