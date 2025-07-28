import { Game } from "../core/Game";
import { PluginManager } from "../core/PluginManager";

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

// Plugin System Types
export interface PluginHookContext {
  game: Game; // Game instance
  state: GameState;
  scene?: Scene;
  dialogue?: DialogueEntry;
  choice?: Choice;
  slot?: number;
  language?: string;
  volume?: number;
  [key: string]: any;
}

export interface PluginHooks {
  // Game lifecycle hooks
  onStart?: (context: PluginHookContext) => void | Promise<void>;
  onEnd?: (context: PluginHookContext) => void | Promise<void>;
  onPause?: (context: PluginHookContext) => void | Promise<void>;
  onResume?: (context: PluginHookContext) => void | Promise<void>;
  
  // Scene hooks
  onSceneWillStart?: (context: PluginHookContext) => void | Promise<void>;
  onSceneStarted?: (context: PluginHookContext) => void | Promise<void>;
  onSceneWillEnd?: (context: PluginHookContext) => void | Promise<void>;
  onSceneEnded?: (context: PluginHookContext) => void | Promise<void>;
  
  // Dialogue hooks
  onDialogueWillDisplay?: (context: PluginHookContext) => void | Promise<void>;
  onDialogueDisplayed?: (context: PluginHookContext) => void | Promise<void>;
  onDialogueWillHide?: (context: PluginHookContext) => void | Promise<void>;
  onDialogueHidden?: (context: PluginHookContext) => void | Promise<void>;
  
  // Choice hooks
  onChoicesWillDisplay?: (context: PluginHookContext) => void | Promise<void>;
  onChoicesDisplayed?: (context: PluginHookContext) => void | Promise<void>;
  onChoiceSelected?: (context: PluginHookContext) => void | Promise<void>;
  
  // Save/Load hooks
  onWillSave?: (context: PluginHookContext) => void | Promise<void>;
  onSaved?: (context: PluginHookContext) => void | Promise<void>;
  onWillLoad?: (context: PluginHookContext) => void | Promise<void>;
  onLoaded?: (context: PluginHookContext) => void | Promise<void>;
  
  // Audio hooks
  onMusicWillPlay?: (context: PluginHookContext) => void | Promise<void>;
  onMusicPlayed?: (context: PluginHookContext) => void | Promise<void>;
  onMusicWillStop?: (context: PluginHookContext) => void | Promise<void>;
  onMusicStopped?: (context: PluginHookContext) => void | Promise<void>;
  onSoundWillPlay?: (context: PluginHookContext) => void | Promise<void>;
  onSoundPlayed?: (context: PluginHookContext) => void | Promise<void>;
  onVolumeChanged?: (context: PluginHookContext) => void | Promise<void>;
  
  // Language hooks
  onLanguageWillChange?: (context: PluginHookContext) => void | Promise<void>;
  onLanguageChanged?: (context: PluginHookContext) => void | Promise<void>;
  
  // UI hooks
  onUIWillRender?: (context: PluginHookContext) => void | Promise<void>;
  onUIRendered?: (context: PluginHookContext) => void | Promise<void>;
  onMenuWillShow?: (context: PluginHookContext) => void | Promise<void>;
  onMenuShown?: (context: PluginHookContext) => void | Promise<void>;
  onMenuWillHide?: (context: PluginHookContext) => void | Promise<void>;
  onMenuHidden?: (context: PluginHookContext) => void | Promise<void>;
  
  // Character hooks
  onCharacterWillShow?: (context: PluginHookContext) => void | Promise<void>;
  onCharacterShown?: (context: PluginHookContext) => void | Promise<void>;
  onCharacterWillHide?: (context: PluginHookContext) => void | Promise<void>;
  onCharacterHidden?: (context: PluginHookContext) => void | Promise<void>;
  
  // Custom hooks for advanced functionality
  onCustomEvent?: (context: PluginHookContext & { eventName: string }) => void | Promise<void>;
}

export interface PluginMetadata {
  name: string;
  version: string;
  author?: string;
  description?: string;
  dependencies?: string[];
  requiredEngineVersion?: string;
  priority?: number; // priority (default: 0)
}

export interface Plugin {
  metadata: PluginMetadata;
  hooks?: PluginHooks;
  
  // Optional lifecycle methods
  initialize?: (game: Game, pluginManager: PluginManager) => void | Promise<void>;
  dispose?: () => void | Promise<void>;
  
  // Optional API that plugin can expose
  api?: { [key: string]: any };
}

export interface PluginRegistry {
  [pluginName: string]: Plugin;
}

export type PluginEventType = keyof PluginHooks | 'customEvent'; 