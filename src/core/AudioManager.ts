import howlerModule from 'howler';

interface HowlOptions {
  src: string[];
  loop?: boolean;
  volume?: number;
  autoplay?: boolean;
  onloaderror?: (id: any, error: any) => void;
}

interface HowlInstance {
  play(): void;
  stop(): void;
  pause(): void;
  volume(vol?: number): number | HowlInstance;
  unload(): void;
}

interface HowlerGlobal {
  volume(vol: number): void;
}

// Try to import Howler, fallback to mock if not available
let Howl: new (options: HowlOptions) => HowlInstance;
let Howler: HowlerGlobal;

try {
  Howl = howlerModule.Howl;
  Howler = howlerModule.Howler;
} catch (e) {
  // Mock implementation for development
  Howl = class MockHowl implements HowlInstance {
    constructor(options: HowlOptions) {
      console.log('Mock Howl created with options:', options);
    }
    play() { console.log('Mock: play audio'); }
    stop() { console.log('Mock: stop audio'); }
    pause() { console.log('Mock: pause audio'); }
    volume(vol?: number) { 
      if (vol !== undefined) {
        console.log('Mock: set volume to', vol);
        return this;
      }
      return 1;
    }
    unload() { console.log('Mock: unload audio'); }
  };
  
  Howler = {
    volume: (vol: number) => console.log('Mock: set global volume to', vol)
  };
}

export class AudioManager {
  private currentMusic: HowlInstance | null = null;
  private soundEffects: Map<string, HowlInstance> = new Map();
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  constructor() {
    Howler.volume(1.0);
  }

  // Music management
  playMusic(src: string, loop: boolean = true): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    this.currentMusic = new Howl({
      src: [src],
      loop,
      volume: this.musicVolume,
      autoplay: true,
      onloaderror: (id: any, error: any) => {
        console.warn(`Failed to load music: ${src}`, error);
      }
    });
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.play();
    }
  }

  // Sound effects
  playSound(src: string): void {
    let sound = this.soundEffects.get(src);
    
    if (!sound) {
      sound = new Howl({
        src: [src],
        volume: this.sfxVolume,
        onloaderror: (id: any, error: any) => {
          console.warn(`Failed to load sound: ${src}`, error);
        }
      });
      this.soundEffects.set(src, sound);
    }

    sound.play();
  }

  // Volume control
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(this.musicVolume);
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.soundEffects.forEach(sound => {
      sound.volume(this.sfxVolume);
    });
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  // Cleanup
  dispose(): void {
    this.stopMusic();
    this.soundEffects.forEach(sound => sound.unload());
    this.soundEffects.clear();
  }
} 