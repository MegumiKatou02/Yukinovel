import { Scene, Character, DialogueEntry, AnimationType } from '../../types/index.js';
import { Game } from '../Game.js';

export class SceneRenderer {
  private game: Game;
  private backgroundElement: HTMLElement;
  private characterContainer: HTMLElement;
  private backgroundVideo: HTMLVideoElement | null = null;
  private originalCharacterSprites: { [characterName: string]: string | null | undefined } = {};
  private currentBackgroundUrl: string = '';
  private fadeAnimationDuration: number = 500;

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

  updateSceneWithFade(scene: Scene, shouldFadeBackground: boolean = false, backgroundAnimation?: any): void {
    if (shouldFadeBackground) {
      const animationConfig = backgroundAnimation ? { animation: backgroundAnimation.animation } : undefined;
      this.updateSceneBackgroundWithFade(scene, true, animationConfig);
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

    const shouldCharacterFade = (charName: string): { enabled: boolean; duration?: number; animation?: AnimationType } => {
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
            duration: charConfig.duration || fadeAnimationConfig?.duration,
            animation: charConfig.animation
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
      this.updateCharacterSprite(characterName!, dialogue.sprite, fadeConfig.enabled, fadeConfig.duration, fadeConfig);
    }

    if (dialogue.characterSprite) {
      Object.keys(dialogue.characterSprite).forEach(charName => {
        const fadeConfig = shouldCharacterFade(charName);
        this.updateCharacterSprite(charName, dialogue.characterSprite![charName], fadeConfig.enabled, fadeConfig.duration, fadeConfig);
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

  private updateSceneBackgroundWithFade(scene: Scene, shouldFade: boolean, fadeConfig?: { animation?: AnimationType }): void {
    const backgroundUrl = scene.backgroundVideo || scene.background;
    
    if (backgroundUrl === this.currentBackgroundUrl) return;
    
    if (!backgroundUrl) {
      if (shouldFade) {
        const outAnimation = fadeConfig?.animation ? 
          (fadeConfig.animation.endsWith('In') ? 
            fadeConfig.animation.replace(/In$/, 'Out') as AnimationType : 
            'fadeOut' as AnimationType) : 
          'fadeOut' as AnimationType;

        this.fadeOutBackground(() => {
          this.clearBackground();
          this.currentBackgroundUrl = '';
        }, outAnimation);
      } else {
        this.clearBackground();
        this.currentBackgroundUrl = '';
      }
      return;
    }

    if (shouldFade) {
      const outAnimation = fadeConfig?.animation ? 
        (fadeConfig.animation.endsWith('In') ? 
          fadeConfig.animation.replace(/In$/, 'Out') as AnimationType : 
          'fadeOut' as AnimationType) : 
        'fadeOut' as AnimationType;
        
      const inAnimation = fadeConfig?.animation || 'fadeIn' as AnimationType;
      
      this.fadeOutBackground(() => {
        this.setNewBackground(scene, backgroundUrl!);
        this.currentBackgroundUrl = backgroundUrl!;
        this.fadeInBackground(inAnimation);
      }, outAnimation);
    } else {
      this.setNewBackground(scene, backgroundUrl!);
      this.currentBackgroundUrl = backgroundUrl!;
      this.backgroundElement.style.opacity = '1';
    }
  }

  private fadeOutCharacter(charElement: HTMLElement, callback: () => void, customDuration?: number, animation: AnimationType = 'fadeOut'): void {
    const duration = customDuration || this.fadeAnimationDuration;
    console.log(`Character fade out: ${animation}, duration: ${duration}ms`);
    
    charElement.classList.remove('animate__animated');
    charElement.className = charElement.className.replace(/animate__\w+/g, '');
    
    charElement.style.setProperty('--animate-duration', `${duration}ms`);
    
    charElement.offsetHeight;
    
    charElement.classList.add('animate__animated', `animate__${animation}`);
    
    const handleAnimationEnd = () => {
      console.log(`Character fade out completed: ${animation}`);
      charElement.classList.remove('animate__animated', `animate__${animation}`);
      charElement.removeEventListener('animationend', handleAnimationEnd);
      callback();
    };
    charElement.addEventListener('animationend', handleAnimationEnd);
  }

  private fadeInCharacter(charElement: HTMLElement, customDuration?: number, animation: AnimationType = 'fadeIn'): void {
    const duration = customDuration || this.fadeAnimationDuration;
    console.log(`Character fade in: ${animation}, duration: ${duration}ms`);
    
    charElement.classList.remove('animate__animated');
    charElement.className = charElement.className.replace(/animate__\w+/g, '');
    
    charElement.style.setProperty('--animate-duration', `${duration}ms`);
    
    charElement.offsetHeight;
    
    charElement.classList.add('animate__animated', `animate__${animation}`);
    
    const handleAnimationEnd = () => {
      console.log(`Character fade in completed: ${animation}`);
      charElement.classList.remove('animate__animated', `animate__${animation}`);
      charElement.removeEventListener('animationend', handleAnimationEnd);
    };
    charElement.addEventListener('animationend', handleAnimationEnd);
  }

  private fadeOutBackground(callback: () => void, animation: AnimationType = 'fadeOut'): void {
    this.backgroundElement.classList.remove('animate__animated');
    this.backgroundElement.className = this.backgroundElement.className.replace(/animate__\w+/g, '');
    
    this.backgroundElement.style.setProperty('--animate-duration', `${this.fadeAnimationDuration}ms`);
    
    this.backgroundElement.offsetHeight;
    
    this.backgroundElement.classList.add('animate__animated', `animate__${animation}`);
    
    const handleAnimationEnd = () => {
      this.backgroundElement.classList.remove('animate__animated', `animate__${animation}`);
      this.backgroundElement.removeEventListener('animationend', handleAnimationEnd);
      callback();
    };
    this.backgroundElement.addEventListener('animationend', handleAnimationEnd);
  }

  private fadeInBackground(animation: AnimationType = 'fadeIn'): void {
    this.backgroundElement.classList.remove('animate__animated');
    this.backgroundElement.className = this.backgroundElement.className.replace(/animate__\w+/g, '');
    
    this.backgroundElement.style.setProperty('--animate-duration', `${this.fadeAnimationDuration}ms`);
    
    this.backgroundElement.offsetHeight;
    
    this.backgroundElement.classList.add('animate__animated', `animate__${animation}`);
    
    const handleAnimationEnd = () => {
      this.backgroundElement.classList.remove('animate__animated', `animate__${animation}`);
      this.backgroundElement.removeEventListener('animationend', handleAnimationEnd);
    };
    this.backgroundElement.addEventListener('animationend', handleAnimationEnd);
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
        this.backgroundVideo.className = 'vn-background-video';
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
        charElement.className = 'vn-character-element';
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
      
      // Apply positioning styles (these are dynamic, so inline is acceptable)
      charElement.style.bottom = yValue;
      charElement.style.left = xValue;
      charElement.style.width = typeof width === 'string' ? width : `${width}px`;
      charElement.style.height = typeof height === 'string' ? height : `${height}px`;
      charElement.style.backgroundImage = `url(${character.image || ''})`;
      charElement.style.transform = `scale(${scale})`;

      if (isNewCharacter && fadeInNewCharacters) {
        charElement.style.opacity = '0';
        setTimeout(() => {
          charElement.style.opacity = '1';
          this.fadeInCharacter(charElement);
        }, 50);
      }
    });
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

  private updateCharacterSprite(characterName: string, sprite: string | null, shouldFade: boolean, customDuration?: number, fadeConfig?: { animation?: AnimationType }): void {
    const charElement = document.getElementById(`character-${characterName}`);
    if (charElement) {
      const currentSprite = charElement.style.backgroundImage;
      const newSprite = sprite ? `url(${sprite})` : '';
      
      if (currentSprite !== newSprite) {
        if (shouldFade) {
          const outAnimation = fadeConfig?.animation ? 
            (fadeConfig.animation.endsWith('In') ? 
              fadeConfig.animation.replace(/In$/, 'Out') as AnimationType : 
              'fadeOut' as AnimationType) : 
            'fadeOut' as AnimationType;
            
          const inAnimation = fadeConfig?.animation || 'fadeIn' as AnimationType;
          
          this.fadeOutCharacter(charElement, () => {
            charElement.style.backgroundImage = newSprite;
            this.fadeInCharacter(charElement, customDuration, inAnimation);
          }, customDuration, outAnimation);
        } else {
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
    
    const shouldCharacterFade = (charName: string): { enabled: boolean; duration?: number; animation?: AnimationType } => {
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
            duration: charConfig.duration || fadeAnimationConfig?.duration,
            animation: charConfig.animation
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
              const outAnimation = fadeConfig.animation ? 
                (fadeConfig.animation.endsWith('In') ? 
                  fadeConfig.animation.replace(/In$/, 'Out') as AnimationType : 
                  'fadeOut' as AnimationType) : 
                'fadeOut' as AnimationType;
                
              const inAnimation = fadeConfig.animation || 'fadeIn' as AnimationType;
              
              this.fadeOutCharacter(charElement, () => {
                charElement.style.backgroundImage = newSprite;
                this.fadeInCharacter(charElement, fadeConfig.duration, inAnimation);
              }, fadeConfig.duration, outAnimation);
            } else {
              charElement.style.backgroundImage = newSprite;
            }
          }
        }
      }
    });
  }
} 