import { Game } from '../core/Game.js';
import { GameScript } from '../types/index.js';

/**
 * Tạo một game Visual Novel mới
 * @param script Script của game
 * @returns Game instance
 */
export function createGame(script: GameScript): Game {
  return new Game(script);
} 