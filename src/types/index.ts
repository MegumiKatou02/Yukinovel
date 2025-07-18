// Character types
export interface Character {
  name: string;
  image?: string;
  color?: string;
  emotions?: { [key: string]: string };
}

// Scene types
export interface Scene {
  id: string;
  background?: string;
  music?: string;
  characters?: Character[];
  dialogue: DialogueEntry[];
}

// Dialogue types
export interface DialogueEntry {
  character?: string;
  text: string;
  emotion?: string;
  choices?: Choice[];
  action?: 'jump' | 'end' | 'save' | 'load';
  target?: string;
  delay?: number;
}

export interface Choice {
  text: string;
  action: 'jump' | 'end';
  target?: string;
}

// Game script
export interface GameScript {
  title: string;
  author?: string;
  version?: string;
  characters: { [key: string]: Character };
  scenes: Scene[];
  settings?: GameSettings;
}

// Game settings
export interface GameSettings {
  width?: number;
  height?: number;
  textSpeed?: number;
  autoPlay?: boolean;
  theme?: 'light' | 'dark';
  language?: string;
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