import { GameState } from '../types/index.js';

export class SaveManager {
  private storageKey = 'yukinovel_saves';

  // Save game state
  save(slot: number, state: GameState): void {
    try {
      const saves = this.getAllSaves();
      saves[slot] = {
        ...state,
        savedAt: new Date()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(saves));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  // Load game state
  load(slot: number): GameState | null {
    try {
      const saves = this.getAllSaves();
      const savedState = saves[slot];
      
      if (savedState) {
        // Convert savedAt string back to Date
        if (savedState.savedAt) {
          savedState.savedAt = new Date(savedState.savedAt);
        }
        return savedState;
      }
      return null;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  // Get all saves
  getAllSaves(): { [slot: number]: GameState } {
    try {
      const saves = localStorage.getItem(this.storageKey);
      return saves ? JSON.parse(saves) : {};
    } catch (error) {
      console.error('Failed to get saves:', error);
      return {};
    }
  }

  // Delete save
  deleteSave(slot: number): void {
    try {
      const saves = this.getAllSaves();
      delete saves[slot];
      localStorage.setItem(this.storageKey, JSON.stringify(saves));
    } catch (error) {
      console.error('Failed to delete save:', error);
    }
  }

  // Check if save exists
  hasSave(slot: number): boolean {
    const saves = this.getAllSaves();
    return saves[slot] !== undefined;
  }

  // Get save info
  getSaveInfo(slot: number): { savedAt: Date; currentScene: string } | null {
    const saves = this.getAllSaves();
    const save = saves[slot];
    
    if (save) {
      return {
        savedAt: new Date(save.savedAt || new Date()),
        currentScene: save.currentScene
      };
    }
    
    return null;
  }

  // Clear all saves
  clearAllSaves(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear saves:', error);
    }
  }
} 