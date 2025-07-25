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
  credits?: CreditsConfig;
  settings?: {
    background?: string;
    backgroundVideo?: string;
    backgroundColor?: string;
  };
  customCSS?: string;
}

export interface CreditsConfig {
  title?: string | LocalizedText;
  sections?: CreditSection[];
  background?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
  music?: string;
  scrollSpeed?: number;
  autoScroll?: boolean;
  style?: CreditStyle
}

export interface CreditStyle {
  titleColor?: string;
  titleSize?: number;
  sectionTitleColor?: string;
  sectionTitleSize?: number;
  textColor?: string;
  textSize?: number;
  linkColor?: string;
  fontFamily?: string;
  lineHeight?: number;
  spacing?: number;
}

export interface CreditSection {
  title?: string | LocalizedText;
  items: CreditItem[];
  style?: {
    titleColor?: string;
    titleSize?: number;
    spacing?: number;
  };
}

export interface CreditItem {
  role?: string | LocalizedText;
  name: string;
  description?: string | LocalizedText;
  link?: string;
  style?: {
    nameColor?: string;
    roleColor?: string;
    descriptionColor?: string;
  };
}

export interface GameState {
  currentScene: string;
  currentDialogue: number;
  variables: { [key: string]: any };
  history: string[];
  savedAt?: Date;
}

export interface GameEvent {
  type: 'dialogue' | 'scene' | 'choice' | 'save' | 'load' | 'end';
  data?: any;
}

export type GameEventHandler = (event: GameEvent) => void; 