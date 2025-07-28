import { Game } from '../Game.js';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel?: () => void;
}

export class ConfirmModal {
  private game: Game;
  private container!: HTMLElement;
  private modal!: HTMLElement;
  private static instance: ConfirmModal | null = null;

  constructor(game: Game) {
    this.game = game;
  }

  static getInstance(game: Game): ConfirmModal {
    if (!ConfirmModal.instance) {
      ConfirmModal.instance = new ConfirmModal(game);
    }
    return ConfirmModal.instance;
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.createModal();
  }

  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.classList.add('vn-confirm-modal');
    this.modal.classList.add('vn-hidden');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'vn-confirm-content';
    
    const title = document.createElement('h3');
    title.className = 'vn-confirm-title';
    title.id = 'vn-confirm-title';
    
    const message = document.createElement('p');
    message.className = 'vn-confirm-message';
    message.id = 'vn-confirm-message';
    
    const buttons = document.createElement('div');
    buttons.className = 'vn-confirm-buttons';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'vn-confirm-button primary';
    confirmBtn.id = 'vn-confirm-yes';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'vn-confirm-button secondary';
    cancelBtn.id = 'vn-confirm-no';
    cancelBtn.onclick = () => this.hide();
    
    buttons.appendChild(confirmBtn);
    buttons.appendChild(cancelBtn);
    
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(buttons);
    
    this.modal.appendChild(modalContent);
    this.container.appendChild(this.modal);
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('vn-hidden')) {
        this.hide();
      }
    });
  }

  show(options: ConfirmModalOptions): void {
    if (!this.modal) {
      console.error('ConfirmModal not rendered yet');
      return;
    }

    const titleEl = this.modal.querySelector('#vn-confirm-title') as HTMLElement;
    const messageEl = this.modal.querySelector('#vn-confirm-message') as HTMLElement;
    const confirmBtn = this.modal.querySelector('#vn-confirm-yes') as HTMLElement;
    const cancelBtn = this.modal.querySelector('#vn-confirm-no') as HTMLElement;
    
    titleEl.textContent = options.title;
    messageEl.textContent = options.message;
    
    confirmBtn.textContent = options.confirmText || this.game.getText('confirm', 'Xác nhận');
    cancelBtn.textContent = options.cancelText || this.game.getText('cancel', 'Hủy');
    
    confirmBtn.className = `vn-confirm-button ${options.confirmType || 'primary'}`;
    
    confirmBtn.onclick = () => {
      options.onConfirm();
      this.hide();
    };
    
    if (options.onCancel) {
      cancelBtn.onclick = () => {
        options.onCancel!();
        this.hide();
      };
    } else {
      cancelBtn.onclick = () => this.hide();
    }
    
    this.modal.classList.remove('vn-hidden');
    document.body.style.overflow = 'hidden';
  }

  hide(): void {
    if (this.modal) {
      this.modal.classList.add('vn-hidden');
      document.body.style.overflow = 'auto';
    }
  }

  static confirm(game: Game, options: ConfirmModalOptions): void {
    const instance = ConfirmModal.getInstance(game);
    instance.show(options);
  }

  static danger(game: Game, title: string, message: string, onConfirm: () => void): void {
    ConfirmModal.confirm(game, {
      title,
      message,
      confirmType: 'danger',
      confirmText: game.getText('delete', 'Xóa'),
      onConfirm
    });
  }

  static success(game: Game, title: string, message: string, onConfirm: () => void): void {
    ConfirmModal.confirm(game, {
      title,
      message,
      confirmType: 'success',
      onConfirm
    });
  }
} 