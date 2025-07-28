/**
 * YUKINOVEL
 * @author: Yukiookii
 * @version: 1.0.0
 * @description: A simple web visual novel engine.
 * @license: MIT
 * @source: https://github.com/MegumiKatou02/Yukinovel
 * @issues: https://github.com/MegumiKatou02/Yukinovel/issues
 * 
 */

// Main exports
export { Game } from './core/Game.js';
export { AudioManager } from './core/AudioManager.js';
export { SaveManager } from './core/SaveManager.js';
export { UIRenderer } from './core/UIRenderer.js';

// Types
export * from './types/index.js';

// Utility functions
export { createGame } from './utils/createGame.js';
export { createCharacter } from './utils/createCharacter.js';
export { createScene } from './utils/createScene.js'; 