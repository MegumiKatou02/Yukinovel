import { LanguageConfig, LocalizedText, GameScript } from '../types/index.js';

export class LanguageManager {
  private currentLanguage: string = 'vi';
  private languages: LanguageConfig[] = [];
  private localization: { [key: string]: LocalizedText } = {};
  private gameScript: GameScript | null = null;

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('vn-language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }

  // Initialize with game script
  initialize(gameScript: GameScript): void {
    this.gameScript = gameScript;
    
    // Set up default languages if not provided
    if (!gameScript.languages || gameScript.languages.length === 0) {
      this.languages = [
        { code: 'vi', name: 'Tiếng Việt', isDefault: true },
        { code: 'en', name: 'English' }
      ];
    } else {
      this.languages = gameScript.languages;
    }

    // Set up localization
    if (gameScript.localization) {
      // Merge UI and system localization
      this.localization = {
        ...gameScript.localization.ui,
        ...gameScript.localization.system
      };
    }

    // Set default language if current language is not available
    const defaultLang = this.languages.find(lang => lang.isDefault);
    if (!this.languages.find(lang => lang.code === this.currentLanguage)) {
      this.currentLanguage = defaultLang?.code || this.languages[0]?.code || 'vi';
    }

    // Add default UI texts if not provided
    this.addDefaultUITexts();
  }

  // Add default UI texts
  private addDefaultUITexts(): void {
    const defaultTexts: { [key: string]: LocalizedText } = {
      'menu.start': {
        vi: 'BẮT ĐẦU',
        en: 'START'
      },
      'menu.continue': {
        vi: 'TIẾP TỤC',
        en: 'CONTINUE'
      },
      'menu.load': {
        vi: 'TẢI GAME',
        en: 'LOAD'
      },
      'menu.save': {
        vi: 'LƯU GAME',
        en: 'SAVE'
      },
      'menu.settings': {
        vi: 'CÀI ĐẶT',
        en: 'SETTINGS'
      },
      'menu.credits': {
        vi: 'CREDIT',
        en: 'CREDITS'
      },
      'menu.exit': {
        vi: 'THOÁT',
        en: 'EXIT'
      },
      'ui.next': {
        vi: 'Tiếp tục',
        en: 'Continue'
      },
      'ui.back': {
        vi: 'Quay lại',
        en: 'Back'
      },
      'ui.save': {
        vi: 'Lưu',
        en: 'Save'
      },
      'ui.load': {
        vi: 'Tải',
        en: 'Load'
      },
      'ui.history': {
        vi: 'Lịch sử',
        en: 'History'
      },
      'ui.close': {
        vi: 'Đóng',
        en: 'Close'
      },
      'settings.language': {
        vi: 'Ngôn ngữ',
        en: 'Language'
      },
      'settings.textSpeed': {
        vi: 'Tốc độ chữ',
        en: 'Text Speed'
      },
      'settings.volume': {
        vi: 'Âm lượng',
        en: 'Volume'
      },
      'settings.fullscreen': {
        vi: 'Toàn màn hình',
        en: 'Fullscreen'
      },
      'history.title': {
        vi: 'Lịch sử hội thoại toàn bộ',
        en: 'Complete Dialogue History'
      },
      'history.empty': {
        vi: 'Chưa có lịch sử hội thoại',
        en: 'No dialogue history yet'
      }
    };

    // Merge with existing localization
    Object.keys(defaultTexts).forEach(key => {
      if (!this.localization[key]) {
        this.localization[key] = defaultTexts[key];
      }
    });
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get available languages
  getAvailableLanguages(): LanguageConfig[] {
    return this.languages;
  }

  // Set current language
  setLanguage(languageCode: string): void {
    if (this.languages.find(lang => lang.code === languageCode)) {
      this.currentLanguage = languageCode;
      localStorage.setItem('vn-language', languageCode);
    }
  }

  // Get localized text
  getText(key: string, fallback?: string): string {
    const localizedText = this.localization[key];
    
    if (!localizedText) {
      return fallback || key;
    }

    if (typeof localizedText === 'string') {
      return localizedText;
    }

    // Return text in current language or fallback to default/first available
    return localizedText[this.currentLanguage] || 
           localizedText[this.languages.find(l => l.isDefault)?.code || 'vi'] ||
           Object.values(localizedText)[0] ||
           fallback ||
           key;
  }

  // Get localized text from LocalizedText object
  getLocalizedText(text: string | LocalizedText, fallback?: string): string {
    if (typeof text === 'string') {
      return text;
    }

    if (!text || typeof text !== 'object') {
      return fallback || '';
    }

    // Return text in current language or fallback to default/first available
    return text[this.currentLanguage] || 
           text[this.languages.find(l => l.isDefault)?.code || 'vi'] ||
           Object.values(text)[0] ||
           fallback ||
           '';
  }

  // Get game title in current language
  getGameTitle(): string {
    if (!this.gameScript) return '';
    
    return this.getLocalizedText(this.gameScript.title, 'Visual Novel');
  }

  // Get subtitle text for main menu
  getSubtitleText(): string {
    if (!this.gameScript) return '';
    
    const versionText = this.getText('ui.version', 'Phiên bản');
    const authorText = this.getText('ui.author', 'Tác giả');
    
    return `${versionText} ${this.gameScript.version || '1.0.0'} - ${authorText}: ${this.gameScript.author || 'Unknown'}`;
  }

  // Add custom localization at runtime
  addLocalization(key: string, texts: LocalizedText): void {
    this.localization[key] = texts;
  }

  // Get language name by code
  getLanguageName(code: string): string {
    const language = this.languages.find(lang => lang.code === code);
    return language?.name || code;
  }
} 