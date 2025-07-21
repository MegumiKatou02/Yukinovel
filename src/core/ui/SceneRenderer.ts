import { Scene, Character, DialogueEntry } from '../../types/index.js';
import { Game } from '../Game.js';

export class SceneRenderer {
  private game: Game;
  private backgroundElement: HTMLElement;
  private characterContainer: HTMLElement;
  private backgroundVideo: HTMLVideoElement | null = null;
  private originalCharacterSprites: { [characterName: string]: string | null | undefined } = {};
  private currentBackgroundUrl: string = '';
  private fadeAnimationDuration: number = 500; // milliseconds

  constructor(game: Game, backgroundElement: HTMLElement, characterContainer: HTMLElement) {
    this.game = game;
    this.backgroundElement = backgroundElement;
    this.characterContainer = characterContainer;
  }

  updateScene(scene: Scene): void {
    this.updateSceneBackground(scene);
    this.updateCharacters(scene.characters || [], false);
    
    if (scene.characters) {
      scene.characters.forEach(character => {
        this.originalCharacterSprites[character.name] = character.image;
      });
    }
  }

  updateSceneWithFade(scene: Scene, shouldFadeBackground: boolean = false): void {
    if (shouldFadeBackground) {
      this.updateSceneBackgroundWithFade(scene, true);
      this.updateCharacters(scene.characters || [], true);
    } else {
      this.updateSceneBackground(scene);
      this.updateCharacters(scene.characters || [], false);
    }
    
    if (scene.characters) {
      scene.characters.forEach(character => {
        this.originalCharacterSprites[character.name] = character.image;
      });
    }
  }

  updateCharacterSprites(dialogue: DialogueEntry): void {
    const characterName = dialogue.character;
    const character = characterName ? this.game.getScript().characters[characterName] : null;

    const shouldUseFade = dialogue.fadeAnimation?.enabled === true;
    const fadeAnimationConfig = dialogue.fadeAnimation;

    const shouldCharacterFade = (charName: string): { enabled: boolean; duration?: number } => {
      if (!shouldUseFade) return { enabled: false };
      
      const characterFade = fadeAnimationConfig?.characterFade;
      
      if (typeof characterFade === 'boolean') {
        return { enabled: characterFade, duration: fadeAnimationConfig?.duration };
      }
      
      if (typeof characterFade === 'object' && characterFade !== null) {
        const charConfig = characterFade[charName];
        
        if (typeof charConfig === 'boolean') {
          return { enabled: charConfig, duration: fadeAnimationConfig?.duration };
        }
        
        if (typeof charConfig === 'object' && charConfig !== null) {
          return { 
            enabled: charConfig.enabled, 
            duration: charConfig.duration || fadeAnimationConfig?.duration 
          };
        }
      }
      
      return { enabled: true, duration: fadeAnimationConfig?.duration };
    };

    if (character && dialogue.emotion && character.emotions) {
      const fadeConfig = shouldCharacterFade(characterName!);
      this.updateCharacterEmotion(characterName!, dialogue.emotion, fadeConfig.enabled, fadeConfig.duration);
    }

    if (character && dialogue.sprite) {
      const fadeConfig = shouldCharacterFade(characterName!);
      this.updateCharacterSprite(characterName!, dialogue.sprite, fadeConfig.enabled, fadeConfig.duration);
    }

    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        const fadeConfig = shouldCharacterFade(charName);
        this.updateCharacterSprite(charName, dialogue.characterSprite![charName], fadeConfig.enabled, fadeConfig.duration);
      });
    }

    this.restoreUnspecifiedCharacterSprites(dialogue, shouldUseFade, fadeAnimationConfig);
  }

  setFadeAnimationDuration(duration: number): void {
    this.fadeAnimationDuration = duration;
    this.backgroundElement.style.transition = `opacity ${duration}ms ease-in-out`;
  }

  private updateSceneBackground(scene: Scene): void {
    const backgroundUrl = scene.backgroundVideo || scene.background;
    
    if (backgroundUrl === this.currentBackgroundUrl) return;
    
    if (!backgroundUrl) {
      this.backgroundElement.style.transition = 'none';
      this.clearBackground();
      this.currentBackgroundUrl = '';
      return;
    }

    this.backgroundElement.style.transition = 'none';
    this.setNewBackground(scene, backgroundUrl!);
    this.currentBackgroundUrl = backgroundUrl!;
    this.backgroundElement.style.opacity = '1';
  }

  private updateSceneBackgroundWithFade(scene: Scene, shouldFade: boolean): void {
    const backgroundUrl = scene.backgroundVideo || scene.background;
    
    if (backgroundUrl === this.currentBackgroundUrl) return;
    
    if (!backgroundUrl) {
      if (shouldFade) {
        this.fadeOutBackground(() => {
          this.clearBackground();
          this.currentBackgroundUrl = '';
        });
      } else {
        this.clearBackground();
        this.currentBackgroundUrl = '';
      }
      return;
    }

    if (shouldFade) {
      this.fadeOutBackground(() => {
        this.setNewBackground(scene, backgroundUrl!);
        this.currentBackgroundUrl = backgroundUrl!;
        this.fadeInBackground();
      });
    } else {
      this.setNewBackground(scene, backgroundUrl!);
      this.currentBackgroundUrl = backgroundUrl!;
      this.backgroundElement.style.opacity = '1';
    }
  }

  private fadeOutBackground(callback: () => void): void {
    this.backgroundElement.style.transition = `opacity ${this.fadeAnimationDuration}ms ease-in-out`;
    this.backgroundElement.style.opacity = '0';
    setTimeout(() => {
      this.backgroundElement.style.transition = 'none';
      callback();
    }, this.fadeAnimationDuration);
  }

  private fadeInBackground(): void {
    setTimeout(() => {
      this.backgroundElement.style.transition = `opacity ${this.fadeAnimationDuration}ms ease-in-out`;
      this.backgroundElement.style.opacity = '1';
      setTimeout(() => {
        this.backgroundElement.style.transition = 'none';
      }, this.fadeAnimationDuration);
    }, 50);
  }

  private clearBackground(): void {
    if (this.backgroundVideo) {
      this.backgroundVideo.pause();
      this.backgroundVideo.remove();
      this.backgroundVideo = null;
    }
    this.backgroundElement.style.backgroundImage = '';
    this.backgroundElement.innerHTML = '';
  }

  private setNewBackground(scene: Scene, backgroundUrl: string): void {
    this.clearBackground();

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
        this.backgroundVideo.style.opacity = '1';
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

  private updateCharacters(characters: Character[], fadeInNewCharacters: boolean = false): void {
    const existingCharacters = Array.from(this.characterContainer.children) as HTMLElement[];
    const newCharacterNames = characters.map(char => char.name);
    const existingCharacterNames = existingCharacters.map(el => el.id.replace('character-', ''));
    
    existingCharacterNames.forEach(charName => {
      if (!newCharacterNames.includes(charName)) {
        const charElement = document.getElementById(`character-${charName}`);
        if (charElement) {
          if (fadeInNewCharacters) {
            this.fadeOutCharacter(charElement, () => {
              charElement.remove();
            });
          } else {
            charElement.remove();
          }
        }
      }
    });

    characters.forEach((character, index) => {
      let charElement = document.getElementById(`character-${character.name}`);
      const isNewCharacter = !charElement;
      
      if (isNewCharacter) {
        charElement = document.createElement('div');
        charElement.id = `character-${character.name}`;
        this.characterContainer.appendChild(charElement);
      }
      
      if (!charElement) return; // Safety check
      
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
        transform: scale(${scale});
        transform-origin: bottom center;
        opacity: 1;
      `;

      if (fadeInNewCharacters && isNewCharacter) {
        charElement.style.opacity = '0';
        charElement.style.transition = `opacity ${this.fadeAnimationDuration}ms ease-in-out`;
        setTimeout(() => {
          if (charElement) {
            charElement.style.opacity = '1';
          }
        }, 50);
      } else {
        charElement.style.transition = 'none';
      }
    });
  }

  private fadeOutCharacter(charElement: HTMLElement, callback: () => void, customDuration?: number): void {
    const duration = customDuration || this.fadeAnimationDuration;
    charElement.style.transition = `opacity ${duration}ms ease-in-out`;
    charElement.style.opacity = '0';
    setTimeout(callback, duration);
  }

  private fadeInCharacter(charElement: HTMLElement, customDuration?: number): void {
    const duration = customDuration || this.fadeAnimationDuration;
    setTimeout(() => {
      if (charElement) {
        charElement.style.transition = `opacity ${duration}ms ease-in-out`;
        charElement.style.opacity = '1';
      }
    }, 50);
  }

  private updateCharacterEmotion(characterName: string, emotion: string, shouldFade: boolean, customDuration?: number): void {
    const character = this.game.getScript().characters[characterName];
    if (character && character.emotions && character.emotions[emotion]) {
      const charElement = document.getElementById(`character-${characterName}`);
      if (charElement) {
        if (shouldFade) {
          this.fadeOutCharacter(charElement, () => {
            charElement.style.backgroundImage = `url(${character.emotions![emotion]})`;
            this.fadeInCharacter(charElement, customDuration);
          }, customDuration);
        } else {
          charElement.style.backgroundImage = `url(${character.emotions![emotion]})`;
        }
      }
    }
  }

  private updateCharacterSprite(characterName: string, sprite: string | null, shouldFade: boolean, customDuration?: number): void {
    const charElement = document.getElementById(`character-${characterName}`);
    if (charElement) {
      const currentSprite = charElement.style.backgroundImage;
      const newSprite = sprite ? `url(${sprite})` : '';
      
      if (currentSprite !== newSprite) {
        if (shouldFade) {
          charElement.style.transition = `opacity ${customDuration || this.fadeAnimationDuration}ms ease-in-out`;
          this.fadeOutCharacter(charElement, () => {
            charElement.style.backgroundImage = newSprite;
            this.fadeInCharacter(charElement, customDuration);
          }, customDuration);
        } else {
          charElement.style.transition = 'none';
          charElement.style.backgroundImage = newSprite;
        }
      }
    }
  }

  private restoreUnspecifiedCharacterSprites(dialogue: DialogueEntry, shouldUseFade: boolean, fadeAnimationConfig?: any): void {
    const specifiedCharacters = new Set<string>();
    
    if (dialogue.character && dialogue.sprite) {
      specifiedCharacters.add(dialogue.character);
    }
    
    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        specifiedCharacters.add(charName);
      });
    }
    
    const shouldCharacterFade = (charName: string): { enabled: boolean; duration?: number } => {
      if (!shouldUseFade) return { enabled: false };
      
      const characterFade = fadeAnimationConfig?.characterFade;
      
      if (typeof characterFade === 'boolean') {
        return { enabled: characterFade, duration: fadeAnimationConfig?.duration };
      }
      
      if (typeof characterFade === 'object' && characterFade !== null) {
        const charConfig = characterFade[charName];
        
        if (typeof charConfig === 'boolean') {
          return { enabled: charConfig, duration: fadeAnimationConfig?.duration };
        }
        
        if (typeof charConfig === 'object' && charConfig !== null) {
          return { 
            enabled: charConfig.enabled, 
            duration: charConfig.duration || fadeAnimationConfig?.duration 
          };
        }
      }
      
      return { enabled: true, duration: fadeAnimationConfig?.duration };
    };
    
    Object.keys(this.originalCharacterSprites).forEach(charName => {
      if (!specifiedCharacters.has(charName)) {
        const charElement = document.getElementById(`character-${charName}`);
        if (charElement) {
          const originalSprite = this.originalCharacterSprites[charName];
          const currentSprite = charElement.style.backgroundImage;
          const newSprite = originalSprite ? `url(${originalSprite})` : '';
          
          if (currentSprite !== newSprite) {
            const fadeConfig = shouldCharacterFade(charName);
            if (fadeConfig.enabled) {
              this.fadeOutCharacter(charElement, () => {
                charElement.style.backgroundImage = newSprite;
                this.fadeInCharacter(charElement, fadeConfig.duration);
              }, fadeConfig.duration);
            } else {
              charElement.style.backgroundImage = newSprite;
            }
          }
        }
      }
    });
  }
} 