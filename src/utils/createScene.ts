import { Scene, DialogueEntry } from '../types/index.js';

/**
 * Tạo scene
 * @param id ID của scene
 * @param dialogue Danh sách dialogue
 * @param options Các tùy chọn cho scene
 * @returns Scene object
 */
export function createScene(
  id: string,
  dialogue: DialogueEntry[],
  options: Partial<Omit<Scene, 'id' | 'dialogue'>> = {}
): Scene {
  return {
    id,
    dialogue,
    background: options.background,
    music: options.music,
    characters: options.characters || []
  };
} 