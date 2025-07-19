import { LanguageConfig, LocalizedText, GameScript } from '../types/index.js';

export class LanguageManager {
  private currentLanguage: string = 'vi';
  private languages: LanguageConfig[] = [];
  private localization: { [key: string]: LocalizedText } = {};
  private gameScript: GameScript | null = null;

  constructor() {
    const savedLanguage = localStorage.getItem('vn-language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }

  initialize(gameScript: GameScript): void {
    this.gameScript = gameScript;
    
    if (!gameScript.languages || gameScript.languages.length === 0) {
      this.languages = [
        { code: 'vi', name: 'Tiếng Việt', isDefault: true },
        { code: 'en', name: 'English' }
      ];
    } else {
      this.languages = gameScript.languages;
    }

    if (gameScript.localization) {
      this.localization = {
        ...gameScript.localization.ui,
        ...gameScript.localization.system
      };
    }

    const defaultLang = this.languages.find(lang => lang.isDefault);
    if (!this.languages.find(lang => lang.code === this.currentLanguage)) {
      this.currentLanguage = defaultLang?.code || this.languages[0]?.code || 'vi';
    }

    this.addDefaultUITexts();
  }

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
      'settings.shortcuts': {
        vi: 'Phím tắt',
        en: 'Keyboard Shortcuts'
      },
      'settings.subtitle': {
        vi: 'Tùy chỉnh trải nghiệm game của bạn',
        en: 'Customize your game experience'
      },
      'ui.menu': {
        vi: 'Menu',
        en: 'Menu'
      },
      'ui.slow': {
        vi: 'Chậm',
        en: 'Slow'
      },
      'ui.normal': {
        vi: 'Bình thường',
        en: 'Normal'
      },
      'ui.fast': {
        vi: 'Nhanh',
        en: 'Fast'
      },
      'ui.veryfast': {
        vi: 'Rất nhanh',
        en: 'Very Fast'
      },
      'settings.language.desc': {
        vi: 'Chọn ngôn ngữ hiển thị trong game',
        en: 'Choose the display language for the game'
      },
      'settings.textSpeed.desc': {
        vi: 'Điều chỉnh tốc độ hiển thị văn bản',
        en: 'Adjust text display speed'
      },
      'settings.shortcuts.desc': {
        vi: 'Các phím tắt có sẵn trong game',
        en: 'Available keyboard shortcuts in the game'
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

    Object.keys(defaultTexts).forEach(key => {
      if (!this.localization[key]) {
        this.localization[key] = defaultTexts[key];
      }
    });
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getAvailableLanguages(): LanguageConfig[] {
    return this.languages;
  }

  setLanguage(languageCode: string): void {
    if (this.languages.find(lang => lang.code === languageCode)) {
      this.currentLanguage = languageCode;
      localStorage.setItem('vn-language', languageCode);
    }
  }

  getText(key: string, fallback?: string): string {
    const localizedText = this.localization[key];
    
    if (!localizedText) {
      return fallback || key;
    }

    if (typeof localizedText === 'string') {
      return localizedText;
    }

    return localizedText[this.currentLanguage] || 
           localizedText[this.languages.find(l => l.isDefault)?.code || 'vi'] ||
           Object.values(localizedText)[0] ||
           fallback ||
           key;
  }

  getLocalizedText(text: string | LocalizedText, fallback?: string): string {
    if (typeof text === 'string') {
      return text;
    }

    if (!text || typeof text !== 'object') {
      return fallback || '';
    }

    return text[this.currentLanguage] || 
           text[this.languages.find(l => l.isDefault)?.code || 'vi'] ||
           Object.values(text)[0] ||
           fallback ||
           '';
  }

  getGameTitle(): string {
    if (!this.gameScript) return '';
    
    return this.getLocalizedText(this.gameScript.title, 'Visual Novel');
  }

  getSubtitleText(): string {
    if (!this.gameScript) return '';
    
    const versionText = this.getText('ui.version', 'Phiên bản');
    const authorText = this.getText('ui.author', 'Tác giả');
    
    return `${versionText} ${this.gameScript.version || '1.0.0'} - ${authorText}: ${this.gameScript.author || 'Unknown'}`;
  }

  addLocalization(key: string, texts: LocalizedText): void {
    this.localization[key] = texts;
  }

  getLanguageName(code: string): string {
    const language = this.languages.find(lang => lang.code === code);
    return language?.name || code;
  }
} 