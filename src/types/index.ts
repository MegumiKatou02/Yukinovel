// Character types
export interface Character {
  name: string;
  image?: string | null;
  color?: string;
  emotions?: { [key: string]: string };
  position?: {
    x?: number | string;
    y?: number | string;
    width?: number;
    height?: number;
    scale?: number;
  };
}

export interface LocalizedText {
  [languageCode: string]: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  flag?: string;
  isDefault?: boolean;
}

export interface Scene {
  id: string;
  background?: string;
  backgroundVideo?: string;
  backgroundType?: 'image' | 'video' | 'gif' | 'auto';
  music?: string;
  characters?: Character[];
  dialogue: DialogueEntry[];
}

// Dialogue types
export interface DialogueEntry {
  character?: string;
  text: string | LocalizedText;
  emotion?: string;
  sprite?: string;
  characterSprite?: { [characterName: string]: string | null };
  choices?: Choice[];
  action?: 'jump' | 'end' | 'save' | 'load';
  target?: string;
  delay?: number;
  
  fadeAnimation?: {
    enabled?: boolean;
    duration?: number;
    backgroundFade?: boolean;
    characterFade?: boolean | { [characterName: string]: boolean | { enabled: boolean; duration?: number } };
  };
}

export interface Choice {
  text: string | LocalizedText;
  action: 'jump' | 'end';
  target?: string;
}

// Game script
export interface GameScript {
  title: string | LocalizedText;
  author?: string;
  version?: string;
  characters: { [key: string]: Character };
  scenes: Scene[];
  settings?: GameSettings;
  languages?: LanguageConfig[];
  localization?: {
    ui?: {
      [key: string]: LocalizedText;
    };
    system?: {
      [key: string]: LocalizedText;
    };
  };
}

// Game settings
export interface GameSettings {
  width?: number | string;
  height?: number | string;
  textSpeed?: number;
  autoPlay?: boolean;
  theme?: 'light' | 'dark';
  language?: string;
  mainMenu?: MainMenuConfig;
}

// Main Menu Configuration
export interface MainMenuConfig {
  background?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
  backgroundOverlay?: string;
  music?: string;
  title?: {
    text?: string | LocalizedText;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    shadow?: boolean;
    gradient?: string;
    animation?: 'none' | 'fade' | 'slide' | 'glow';
  };
  subtitle?: {
    show?: boolean;
    text?: string | LocalizedText;
    color?: string;
    fontSize?: number;
  };
  buttons?: {
    style?: 'modern' | 'classic' | 'minimal' | 'glass';
    color?: string;
    hoverColor?: string; 
    textColor?: string;
    fontSize?: number; 
    borderRadius?: number;
    spacing?: number;
    width?: number;
    animation?: 'none' | 'bounce' | 'slide' | 'fade';
  };
  layout?: {
    alignment?: 'left' | 'center' | 'right';
    titlePosition?: 'top' | 'center' | 'bottom';
    buttonsPosition?: 'top' | 'center' | 'bottom';
    padding?: number;
  };
  customCSS?: string;
}

// Game state
export interface GameState {
  currentScene: string;
  currentDialogue: number;
  variables: { [key: string]: any };
  history: string[];
  savedAt?: Date;
}

// Events
export interface GameEvent {
  type: 'dialogue' | 'scene' | 'choice' | 'save' | 'load' | 'end';
  data?: any;
}

export type GameEventHandler = (event: GameEvent) => void; 