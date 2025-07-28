import { Game } from '../Game.js';
import { ConfirmModal } from './ConfirmModal.js';

export class SaveLoadRenderer {
  private game: Game;
  private container!: HTMLElement;
  private saveLoadModal!: HTMLElement;
  private currentMode: 'save' | 'load' = 'save';

  constructor(game: Game) {
    this.game = game;
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.createSaveLoadModal();
  }

  private createSaveLoadModal(): void {
    this.saveLoadModal = document.createElement('div');
    this.saveLoadModal.id = 'vn-saveload-modal';
    this.saveLoadModal.className = 'vn-saveload-modal vn-hidden';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'vn-saveload-content';
    
    const header = document.createElement('div');
    header.className = 'vn-saveload-header';
    
    const title = document.createElement('h2');
    title.className = 'vn-saveload-title';
    title.textContent = this.game.getText('save_title', 'Lưu Game');
    
    const closeButton = document.createElement('button');
    closeButton.className = 'vn-saveload-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.hide();
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'vn-saveload-slots';
    slotsContainer.id = 'vn-saveload-slots';
    
    const footer = document.createElement('div');
    footer.className = 'vn-saveload-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'vn-saveload-button secondary';
    cancelButton.textContent = this.game.getText('cancel', 'Hủy');
    cancelButton.onclick = () => this.hide();
    
    footer.appendChild(cancelButton);
    
    modalContent.appendChild(header);
    modalContent.appendChild(slotsContainer);
    modalContent.appendChild(footer);
    
    this.saveLoadModal.appendChild(modalContent);
    this.container.appendChild(this.saveLoadModal);
    
    this.saveLoadModal.addEventListener('click', (e) => {
      if (e.target === this.saveLoadModal) {
        this.hide();
      }
    });
  }

  showSavePanel(): void {
    this.currentMode = 'save';
    const title = this.saveLoadModal.querySelector('.vn-saveload-title') as HTMLElement;
    if (title) {
      title.textContent = this.game.getText('save_title', 'Lưu Game');
    }
    this.renderSlots();
    this.show();
  }

  showLoadPanel(): void {
    this.currentMode = 'load';
    const title = this.saveLoadModal.querySelector('.vn-saveload-title') as HTMLElement;
    if (title) {
      title.textContent = this.game.getText('load_title', 'Tải Game');
    }
    this.renderSlots();
    this.show();
  }

  private renderSlots(): void {
    const slotsContainer = this.saveLoadModal.querySelector('#vn-saveload-slots') as HTMLElement;
    if (!slotsContainer) return;
    
    slotsContainer.innerHTML = '';
    const saveManager = this.game.getSaveManager();
    
    for (let i = 1; i <= 16; i++) {
      const slot = document.createElement('div');
      slot.className = 'vn-saveload-slot';
      slot.dataset.slot = i.toString();
      
      const slotHeader = document.createElement('div');
      slotHeader.className = 'vn-saveload-slot-header';
      
      const slotNumber = document.createElement('div');
      slotNumber.className = 'vn-saveload-slot-number';
      slotNumber.textContent = i.toString();
      
      const slotDate = document.createElement('div');
      slotDate.className = 'vn-saveload-slot-date';
      
      slotHeader.appendChild(slotNumber);
      slotHeader.appendChild(slotDate);
      
      const slotContent = document.createElement('div');
      slotContent.className = 'vn-saveload-slot-content';
      
      const slotImage = document.createElement('div');
      slotImage.className = 'vn-saveload-slot-image';
      
      const slotInfo = document.createElement('div');
      slotInfo.className = 'vn-saveload-slot-info';
      
      const slotTitle = document.createElement('div');
      slotTitle.className = 'vn-saveload-slot-title';
      
      slotContent.appendChild(slotImage);
      slotContent.appendChild(slotInfo);
      slotInfo.appendChild(slotTitle);
      
      const hasSave = saveManager && saveManager.hasSave(i);
      
      if (hasSave) {
        const saveInfo = saveManager.getSaveInfo(i);
        if (saveInfo) {
          slot.classList.add('has-save');
          slotDate.textContent = this.formatDate(saveInfo.savedAt);
          
          const scene = this.game.getSceneById(saveInfo.currentScene);
          slotTitle.textContent = scene?.id || 
            this.game.getText('no_title', 'Không có tiêu đề');
          
          if (scene?.background) {
            slotImage.style.backgroundImage = `url(${scene.background})`;
            slotImage.style.backgroundSize = 'cover';
            slotImage.style.backgroundPosition = 'center';
          }

          const deleteButton = document.createElement('button');
          deleteButton.className = 'vn-saveload-delete-btn';
          deleteButton.innerHTML = '<i class="fas fa-times"></i>';
          deleteButton.title = this.game.getText('delete_save', 'Xóa save');
          deleteButton.onclick = (e) => {
            e.stopPropagation();
            this.handleDeleteSave(i);
          };
          slotHeader.appendChild(deleteButton);
        }
      } else {
        slot.classList.add('empty-save');
        slotDate.textContent = this.game.getText('no_data', 'KHÔNG CÓ DỮ LIỆU');
        slotTitle.textContent = '';
        slotImage.style.background = 'linear-gradient(135deg, #1e3c72, #2a5298)';
      }
      
      slot.appendChild(slotHeader);
      slot.appendChild(slotContent);
      
      slot.addEventListener('click', () => this.handleSlotClick(i, hasSave));
      
      slotsContainer.appendChild(slot);
    }
  }

  private handleDeleteSave(slotNumber: number): void {
    ConfirmModal.danger(
      this.game,
      this.game.getText('confirm_delete', 'Xác nhận xóa'),
      this.game.getText('confirm_delete_message', `Bạn có chắc muốn xóa save slot ${slotNumber}?`),
      () => {
        this.game.getSaveManager().deleteSave(slotNumber);
        this.renderSlots();
        this.showToast(this.game.getText('delete_success', 'Đã xóa save thành công!'), 'success');
      }
    );
  }

  private handleSlotClick(slotNumber: number, hasSave: boolean): void {
    if (this.currentMode === 'save') {
      let title = this.game.getText('confirm_save_title', 'Xác nhận lưu game');
      let message = this.game.getText('confirm_save', 'Bạn có muốn lưu game vào slot này?');
      
      if (hasSave) {
        title = this.game.getText('confirm_overwrite_title', 'Ghi đè dữ liệu');
        message = this.game.getText('confirm_overwrite', 'Slot này đã có dữ liệu. Bạn có muốn ghi đè?');
      }
      
      ConfirmModal.confirm(this.game, {
        title,
        message,
        onConfirm: () => {
          this.game.saveGame(slotNumber);
          this.renderSlots();
          this.showToast(this.game.getText('save_success', 'Đã lưu thành công!'), 'success');
        }
      });
    } else if (this.currentMode === 'load') {
      if (hasSave) {
        ConfirmModal.confirm(this.game, {
          title: this.game.getText('confirm_load_title', 'Xác nhận tải game'),
          message: this.game.getText('confirm_load', 'Bạn có muốn tải game từ slot này?'),
          onConfirm: () => {
            this.game.loadGame(slotNumber);
            this.hide();
            this.showToast(this.game.getText('load_success', 'Đã tải thành công!'), 'success');
          }
        });
      } else {
        this.showToast(this.game.getText('empty_slot', 'Slot này không có dữ liệu!'), 'error');
      }
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `vn-toast vn-toast-${type}`;
    
    const icon = document.createElement('div');
    icon.className = 'vn-toast-icon';
    
    switch (type) {
      case 'success':
        icon.innerHTML = '✓';
        break;
      case 'error':
        icon.innerHTML = '✕';
        break;
      default:
        icon.innerHTML = 'ℹ';
    }
    
    const text = document.createElement('div');
    text.className = 'vn-toast-text';
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  private show(): void {
    this.saveLoadModal.classList.remove('vn-hidden');
    document.body.style.overflow = 'hidden';
  }

  private hide(): void {
    this.saveLoadModal.classList.add('vn-hidden');
    document.body.style.overflow = 'auto';
  }
} 