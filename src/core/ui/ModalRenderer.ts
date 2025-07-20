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
    this.exitConfirmModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: rgba(30, 30, 30, 0.95);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      padding: 30px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;

    const title = document.createElement('h3');
    title.textContent = langManager.getText('exit.title', 'Xác nhận thoát');
    title.style.cssText = `
      color: #fff;
      margin: 0 0 15px 0;
      font-size: 20px;
      font-weight: normal;
    `;

    const message = document.createElement('p');
    message.textContent = langManager.getText('exit.message', 'Bạn có chắc chắn muốn thoát về menu chính không?');
    message.style.cssText = `
      color: #ccc;
      margin: 0 0 25px 0;
      font-size: 14px;
      line-height: 1.4;
    `;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
    `;

    const yesButton = document.createElement('button');
    yesButton.textContent = langManager.getText('ui.yes', 'Có');
    yesButton.style.cssText = `
      padding: 10px 20px;
      background: #e74c3c;
      color: white;
      border: 1px solid #c0392b;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s ease;
      min-width: 80px;
    `;

    const noButton = document.createElement('button');
    noButton.textContent = langManager.getText('ui.no', 'Không');
    noButton.style.cssText = `
      padding: 10px 20px;
      background: #27ae60;
      color: white;
      border: 1px solid #229954;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 80px;
      position: relative;
    `;

    yesButton.onmouseover = () => yesButton.style.background = '#c0392b';
    yesButton.onmouseout = () => yesButton.style.background = '#e74c3c';
    noButton.onmouseover = () => noButton.style.background = '#229954';
    noButton.onmouseout = () => noButton.style.background = '#27ae60';

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

    requestAnimationFrame(() => {
      this.exitConfirmModal!.style.opacity = '1';
      modalContent.style.transform = 'scale(1)';
    });
  }

  private hideExitConfirm(): void {
    if (!this.exitConfirmModal) return;

    const keyHandler = (this.exitConfirmModal as any).keyHandler;
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
    }

    this.exitConfirmModal.style.opacity = '0';
    const modalContent = this.exitConfirmModal.querySelector('div') as HTMLElement;
    if (modalContent) {
      modalContent.style.transform = 'scale(0.9)';
    }

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
} 