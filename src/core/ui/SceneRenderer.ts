import { Scene, Character, DialogueEntry } from '../../types/index.js';
import { Game } from '../Game.js';

export class SceneRenderer {
  private game: Game;
  private backgroundElement: HTMLElement;
  private characterContainer: HTMLElement;
  private backgroundVideo: HTMLVideoElement | null = null;
  private originalCharacterSprites: { [characterName: string]: string | null | undefined } = {};

  constructor(game: Game, backgroundElement: HTMLElement, characterContainer: HTMLElement) {
    this.game = game;
    this.backgroundElement = backgroundElement;
    this.characterContainer = characterContainer;
  }

  updateScene(scene: Scene): void {
    this.updateSceneBackground(scene);
    this.updateCharacters(scene.characters || []);
    
    if (scene.characters) {
      scene.characters.forEach(character => {
        this.originalCharacterSprites[character.name] = character.image;
      });
    }
  }

  updateCharacterSprites(dialogue: DialogueEntry): void {
    const characterName = dialogue.character;
    const character = characterName ? this.game.getScript().characters[characterName] : null;

    if (character && dialogue.emotion && character.emotions) {
      this.updateCharacterEmotion(characterName!, dialogue.emotion);
    }

    if (character && dialogue.sprite) {
      this.updateCharacterSprite(characterName!, dialogue.sprite);
    }

    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        this.updateCharacterSprite(charName, dialogue.characterSprite![charName]);
      });
    }

    this.restoreUnspecifiedCharacterSprites(dialogue);
  }

  private updateSceneBackground(scene: Scene): void {
    // Xóa video background cũ nếu có
    if (this.backgroundVideo) {
      this.backgroundVideo.pause();
      this.backgroundVideo.remove();
      this.backgroundVideo = null;
    }

    // Reset background element
    this.backgroundElement.style.backgroundImage = '';
    this.backgroundElement.innerHTML = '';

    // Xác định nguồn background
    const backgroundUrl = scene.backgroundVideo || scene.background;
    if (!backgroundUrl) return;

    // Xác định loại background
    let backgroundType = scene.backgroundType || 'auto';
    if (backgroundType === 'auto') {
      backgroundType = this.detectBackgroundType(backgroundUrl);
    }

    switch (backgroundType) {
      case 'video':
        this.backgroundVideo = this.setupBackgroundVideo(backgroundUrl);
        this.backgroundVideo.style.position = 'absolute';
        this.backgroundVideo.style.top = '0';
        this.backgroundVideo.style.left = '0';
        this.backgroundVideo.style.width = '100%';
        this.backgroundVideo.style.height = '100%';
        this.backgroundVideo.style.objectFit = 'cover';
        this.backgroundVideo.style.zIndex = '0';
        this.backgroundElement.appendChild(this.backgroundVideo);
        break;
      
      case 'gif':
      case 'image':
      default:
        this.backgroundElement.style.backgroundImage = `url(${backgroundUrl})`;
        break;
    }
  }

  private detectBackgroundType(url: string): 'image' | 'video' | 'gif' {
    const extension = url.toLowerCase().split('.').pop();
    if (extension === 'mp4' || extension === 'webm' || extension === 'ogg') {
      return 'video';
    } else if (extension === 'gif') {
      return 'gif';
    } else {
      return 'image';
    }
  }

  private setupBackgroundVideo(url: string): HTMLVideoElement {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    return video;
  }

  private updateCharacters(characters: Character[]): void {
    this.characterContainer.innerHTML = '';
    
    characters.forEach((character, index) => {
      const charElement = document.createElement('div');
      
      const position = character.position || {};
      const x = position.x !== undefined ? position.x : (20 + index * 200);
      const y = position.y !== undefined ? position.y : 0;
      const width = position.width || 300;
      const height = position.height || 400;
      const scale = position.scale || 1;
      
      const xValue = typeof x === 'string' ? x : `${x}px`;
      const yValue = typeof y === 'string' ? y : `${y}px`;
      
      charElement.style.cssText = `
        position: absolute;
        bottom: ${yValue};
        left: ${xValue};
        width: ${width}px;
        height: ${height}px;
        background-image: url(${character.image || ''});
        background-size: contain;
        background-position: bottom;
        background-repeat: no-repeat;
        transition: opacity 0.5s ease;
        transform: scale(${scale});
        transform-origin: bottom center;
      `;
      charElement.id = `character-${character.name}`;
      this.characterContainer.appendChild(charElement);
    });
  }

  private updateCharacterEmotion(characterName: string, emotion: string): void {
    const character = this.game.getScript().characters[characterName];
    if (character && character.emotions && character.emotions[emotion]) {
      const charElement = document.getElementById(`character-${characterName}`);
      if (charElement) {
        charElement.style.backgroundImage = `url(${character.emotions[emotion]})`;
      }
    }
  }

  private updateCharacterSprite(characterName: string, sprite: string | null): void {
    const charElement = document.getElementById(`character-${characterName}`);
    if (charElement) {
      charElement.style.backgroundImage = `url(${sprite || ''})`;
    }
  }

  private restoreUnspecifiedCharacterSprites(dialogue: DialogueEntry): void {
    const specifiedCharacters = new Set<string>();
    
    if (dialogue.character && dialogue.sprite) {
      specifiedCharacters.add(dialogue.character);
    }
    
    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        specifiedCharacters.add(charName);
      });
    }
    
    Object.keys(this.originalCharacterSprites).forEach(charName => {
      if (!specifiedCharacters.has(charName)) {
        const charElement = document.getElementById(`character-${charName}`);
        if (charElement) {
          charElement.style.backgroundImage = `url(${this.originalCharacterSprites[charName] || ''})`;
        }
      }
    });
  }
} 