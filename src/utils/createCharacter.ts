import { Character } from '../types/index.js';

/**
 * Tạo nhân vật mới
 * @param name Tên nhân vật
 * @param options Các tùy chọn cho nhân vật
 * @returns Character object
 */
export function createCharacter(
  name: string,
  options: Partial<Omit<Character, 'name'>> = {}
): Character {
  return {
    name,
    image: options.image,
    color: options.color || '#ffffff',
    emotions: options.emotions || {}
  };
} 