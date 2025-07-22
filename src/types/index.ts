// Character types
export interface Character {
  name: string;
  image?: string | null;
  color?: string;
  emotions?: { [key: string]: string };
  position?: {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
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


export type AnimationType = 
  // Fading animations
  | 'fadeIn' | 'fadeOut' 
  | 'fadeInUp' | 'fadeOutUp'
  | 'fadeInDown' | 'fadeOutDown'
  | 'fadeInLeft' | 'fadeOutLeft'
  | 'fadeInRight' | 'fadeOutRight'
  // Sliding animations
  | 'slideInUp' | 'slideOutUp'
  | 'slideInDown' | 'slideOutDown'
  | 'slideInLeft' | 'slideOutLeft'
  | 'slideInRight' | 'slideOutRight'
  // Zoom animations
  | 'zoomIn' | 'zoomOut'
  | 'zoomInUp' | 'zoomOutUp'
  | 'zoomInDown' | 'zoomOutDown'
  | 'zoomInLeft' | 'zoomOutLeft'
  | 'zoomInRight' | 'zoomOutRight'
  // Bouncing animations
  | 'bounceIn' | 'bounceOut'
  | 'bounceInUp' | 'bounceOutUp'
  | 'bounceInDown' | 'bounceOutDown'
  | 'bounceInLeft' | 'bounceOutLeft'
  | 'bounceInRight' | 'bounceOutRight';

export interface FadeAnimation {
  enabled: boolean;
  duration?: number;
  backgroundFade?: boolean | {
    enabled: boolean;
    animation?: AnimationType;
    duration?: number;
  };
  characterFade?: boolean | {
    [characterName: string]: boolean | {
      enabled: boolean;
      animation?: AnimationType;
      duration?: number;
    }
  };
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
  fadeAnimation?: FadeAnimation;
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