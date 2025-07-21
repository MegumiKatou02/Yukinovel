import { MainMenuConfig } from '../../types/index.js';
import { Game } from '../Game.js';

export class MainMenuRenderer {
  private game: Game;
  private mainMenuContainer: HTMLElement;

  constructor(game: Game, container: HTMLElement) {
    this.game = game;
    this.mainMenuContainer = container;
  }

  show(): void {
    this.createMainMenu();
    this.mainMenuContainer.style.display = 'block';
  }

  hide(): void {
    this.mainMenuContainer.style.display = 'none';
  }

  private createMainMenu(): void {
    this.mainMenuContainer.innerHTML = '';
    
    const config = this.game.getScript().settings?.mainMenu || {};
    const langManager = this.game.getLanguageManager();
    
    // Background setup
    this.setupBackground(config);

    /**
     * @description Không cần thiết lắm
     */
    // Overlay
    // if (config.backgroundOverlay) {
    //   const overlay = document.createElement('div');
    //   overlay.id = 'backgroundOverlay';
    //   overlay.style.cssText = `
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     width: 100%;
    //     height: 100%;
    //     background: ${config.backgroundOverlay};
    //     z-index: 1;
    //   `;
    //   this.mainMenuContainer.appendChild(overlay);
    // }
    
    // Main content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'container-content';
    const layout = config.layout || {};
    const alignment = layout.alignment || 'center';
    const padding = layout.padding || 50;
    
    contentContainer.style.cssText = `
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: ${layout.titlePosition === 'top' ? 'flex-start' : layout.titlePosition === 'bottom' ? 'flex-end' : 'center'};
      align-items: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};
      padding: ${padding}px;
      box-sizing: border-box;
    `;
    
    this.createTitle(contentContainer, config, alignment, langManager);
    
    this.createSubtitle(contentContainer, config, alignment, langManager);
    
    this.createButtons(contentContainer, config, langManager);
    
    this.mainMenuContainer.appendChild(contentContainer);
    this.addAnimations();
  }

  private setupBackground(config: MainMenuConfig): void {
    let backgroundStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
    
    if (config.backgroundColor) {
      backgroundStyle = `background: ${config.backgroundColor};`;
    }
    
    const backgroundUrl = config.backgroundVideo || config.background;
    if (backgroundUrl) {
      const backgroundType = this.detectBackgroundType(backgroundUrl);
      
      if (backgroundType === 'video') {
        const video = this.setupBackgroundVideo(backgroundUrl);
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '0';
        this.mainMenuContainer.appendChild(video);
        backgroundStyle = 'background: transparent;';
      } else {
        backgroundStyle = `
          background-image: url('${backgroundUrl}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        `;
      }
    }
    
    if (config.backgroundOverlay) {
      backgroundStyle += `position: relative;`;
    }
    
    this.mainMenuContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ${backgroundStyle}
      display: flex;
      pointer-events: auto;
    `;
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

  private createTitle(container: HTMLElement, config: MainMenuConfig, alignment: string, langManager: any): void {
    const titleConfig = config.title || {};
    const titleDiv = document.createElement('div');
    titleDiv.id = 'title-game';
    const titleText = langManager.getLocalizedText(titleConfig.text || this.game.getScript().title || 'Visual Novel');
    const titleColor = titleConfig.color || '#ffffff';
    const titleSize = titleConfig.fontSize || 48;
    const titleFont = titleConfig.fontFamily || 'Arial, sans-serif';
    
    let titleStyle = `
      font-size: ${titleSize}px;
      font-weight: bold;
      color: ${titleColor};
      font-family: ${titleFont};
      margin-bottom: 20px;
      text-align: ${alignment};
    `;
    
    if (titleConfig.shadow) {
      titleStyle += 'text-shadow: 2px 2px 4px rgba(0,0,0,0.5);';
    }
    
    if (titleConfig.gradient) {
      titleStyle += `
        background: ${titleConfig.gradient};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      `;
    }
    
    titleDiv.style.cssText = titleStyle;
    titleDiv.textContent = titleText;
    
    // Animation
    if (titleConfig.animation === 'fade') {
      titleDiv.style.animation = 'fadeIn 2s ease-in-out';
    } else if (titleConfig.animation === 'slide') {
      titleDiv.style.animation = 'slideIn 1s ease-out';
    } else if (titleConfig.animation === 'glow') {
      titleDiv.style.animation = 'glow 2s ease-in-out infinite alternate';
    }
    
    container.appendChild(titleDiv);
  }

  private createSubtitle(container: HTMLElement, config: MainMenuConfig, alignment: string, langManager: any): void {
    const subtitleConfig = config.subtitle || {};
    if (subtitleConfig.show !== false) {
      const subtitleDiv = document.createElement('div');
      subtitleDiv.id = 'subtitle-game';
      const subtitleText = langManager.getLocalizedText(subtitleConfig.text || '') || langManager.getSubtitleText();
      
      subtitleDiv.style.cssText = `
        font-size: ${subtitleConfig.fontSize || 16}px;
        color: ${subtitleConfig.color || '#cccccc'};
        margin-bottom: 50px;
        text-align: ${alignment};
      `;
      subtitleDiv.textContent = subtitleText;
      container.appendChild(subtitleDiv);
    }
  }

  private createButtons(container: HTMLElement, config: MainMenuConfig, langManager: any): void {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'container-button';
    const buttonConfig = config.buttons || {};
    const buttonSpacing = buttonConfig.spacing || 15;
    const buttonWidth = buttonConfig.width || 300;
    
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${buttonSpacing}px;
      width: ${buttonWidth}px;
    `;
    
    const menuButtons = [
      { text: langManager.getText('menu.start'), action: () => this.game.startNewGame(), icon: '' },
      { text: langManager.getText('menu.continue'), action: () => this.game.continueGame(), icon: '' },
      { text: langManager.getText('menu.load'), action: () => this.game.loadGame(), icon: '' },
      { text: langManager.getText('menu.settings'), action: () => this.showSettings(buttonsContainer), icon: '' },
      { text: langManager.getText('menu.credits'), action: () => this.showCredits(), icon: '' },
      { text: langManager.getText('menu.exit'), action: () => window.close(), icon: '' }
    ];
    
    menuButtons.forEach(button => {
      const buttonEl = this.createMenuButton(button.text, button.action, button.icon, config);
      buttonsContainer.appendChild(buttonEl);
    });
    
    container.appendChild(buttonsContainer);
  }

  private createMenuButton(text: string, action: () => void, icon: string, config: MainMenuConfig): HTMLElement {
    const buttonConfig = config.buttons || {};
    const button = document.createElement('button');
    button.className = 'button';
    
    const style = buttonConfig.style || 'modern';
    const color = buttonConfig.color || '#4A90E2';
    const hoverColor = buttonConfig.hoverColor || '#357ABD';
    const textColor = buttonConfig.textColor || '#ffffff';
    const fontSize = buttonConfig.fontSize || 18;
    const borderRadius = buttonConfig.borderRadius || 8;
    
    let buttonStyle = `
      background: ${color};
      color: ${textColor};
      border: none;
      padding: 15px 30px;
      font-size: ${fontSize}px;
      border-radius: ${borderRadius}px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 15px;
      width: 100%;
      box-sizing: border-box;
    `;
    
    // Style variations
    if (style === 'glass') {
      buttonStyle += `
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      `;
    } else if (style === 'minimal') {
      buttonStyle += `
        background: transparent;
        border: 2px solid ${color};
        color: ${color};
      `;
    } else if (style === 'classic') {
      buttonStyle += `
        background: linear-gradient(45deg, ${color}, ${hoverColor});
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      `;
    }
    
    button.style.cssText = buttonStyle;
    button.innerHTML = `<span style="font-size: 20px;">${icon}</span><span>${text}</span>`;
    
    // Hover effects
    button.onmouseover = () => {
      if (style === 'minimal') {
        button.style.background = color;
        button.style.color = textColor;
      } else {
        button.style.background = hoverColor;
      }
      
      if (buttonConfig.animation === 'bounce') {
        button.style.transform = 'scale(1.05)';
      } else if (buttonConfig.animation === 'slide') {
        button.style.transform = 'translateX(10px)';
      }
    };
    
    button.onmouseout = () => {
      if (style === 'minimal') {
        button.style.background = 'transparent';
        button.style.color = color;
      } else {
        button.style.background = color;
      }
      button.style.transform = 'none';
    };
    
    button.onclick = action;
    
    return button;
  }

  private addAnimations(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes glow {
        from { text-shadow: 0 0 10px rgba(74,144,226,0.5); }
        to { text-shadow: 0 0 20px rgba(74,144,226,1), 0 0 30px rgba(74,144,226,0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  private showSettings(menuOverlay: HTMLElement): void {
    const langManager = this.game.getLanguageManager();
    const config = this.game.getScript().settings?.mainMenu || {};
    
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    
    this.setupSettingsBackground(settingsContainer, config);

    let backgroundStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
    
    if (config.backgroundColor) {
      backgroundStyle = `background: ${config.backgroundColor};`;
    }
    
    if (config.background) {
      backgroundStyle = `
        background-image: url('${config.background}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `;
    }
    
    settingsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ${backgroundStyle}
      color: white;
      overflow-y: auto;
      pointer-events: auto;
      z-index: 1000;
    `;

    if (config.backgroundOverlay) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${config.backgroundOverlay};
        z-index: 1;
      `;
      settingsContainer.appendChild(overlay);
    }

    // Main content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 40px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    `;

    // Header section
    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
      text-align: center;
      margin-bottom: 60px;
    `;

    const settingsTitle = document.createElement('h1');
    settingsTitle.textContent = langManager.getText('menu.settings');
    settingsTitle.style.cssText = `
      font-size: 42px;
      font-weight: bold;
      margin: 0 0 15px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      color: white;
    `;

    const settingsSubtitle = document.createElement('p');
    settingsSubtitle.textContent = langManager.getText('settings.subtitle', 'Tùy chỉnh trải nghiệm game của bạn');
    settingsSubtitle.style.cssText = `
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
      color: #f0f0f0;
    `;

    headerSection.appendChild(settingsTitle);
    headerSection.appendChild(settingsSubtitle);
    contentContainer.appendChild(headerSection);

    // Settings sections container
    const sectionsContainer = document.createElement('div');
    sectionsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 30px;
      flex: 1;
      margin-bottom: 40px;
    `;

    // Language Settings Section
    const languageSection = this.createSimpleSettingsSection(
      langManager.getText('settings.language'),
      langManager.getText('settings.language.desc'),
      'lang'
    );

    const languageSelect = document.createElement('select');
    languageSelect.style.cssText = `
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      background: rgba(0,0,0,0.3);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    // Language options
    const availableLanguages = this.game.getAvailableLanguages();
    const currentLanguage = this.game.getCurrentLanguage();

    availableLanguages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      option.style.cssText = `
        background: #333;
        color: white;
      `;
      if (lang.code === currentLanguage) {
        option.selected = true;
      }
      languageSelect.appendChild(option);
    });

    languageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.game.setLanguage(target.value);
    });

    languageSelect.addEventListener('focus', () => {
      languageSelect.style.borderColor = 'rgba(255,255,255,0.6)';
      languageSelect.style.background = 'rgba(0,0,0,0.5)';
    });

    languageSelect.addEventListener('blur', () => {
      languageSelect.style.borderColor = 'rgba(255,255,255,0.3)';
      languageSelect.style.background = 'rgba(0,0,0,0.3)';
    });

    languageSection.appendChild(languageSelect);
    sectionsContainer.appendChild(languageSection);

    // Text Speed Settings Section
    const textSpeedSection = this.createSimpleSettingsSection(
      langManager.getText('settings.textSpeed'),
      langManager.getText('settings.textSpeed.desc'),
      'speed'
    );

    const speedContainer = document.createElement('div');
    speedContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    `;

    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '10';
    speedSlider.max = '100';
    speedSlider.value = this.game.getUIRenderer().getTypewriterSpeed().toString();
    speedSlider.style.cssText = `
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.3);
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
    `;

    const speedValue = document.createElement('span');
    speedValue.textContent = this.game.getUIRenderer().getTypewriterSpeed() + 'ms';
    speedValue.style.cssText = `
      min-width: 60px;
      text-align: center;
      font-weight: bold;
      color: white;
      background: rgba(0,0,0,0.3);
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.3);
    `;

    speedSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value);
      this.game.getUIRenderer().setTypewriterSpeed(value);
      speedValue.textContent = value + 'ms';
    });

    speedContainer.appendChild(speedSlider);
    speedContainer.appendChild(speedValue);

    // Speed presets
    const speedPresets = document.createElement('div');
    speedPresets.style.cssText = `
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    `;

    const presets = [
      { label: langManager.getText('ui.slow'), value: 60 },
      { label: langManager.getText('ui.normal'), value: 30 },
      { label: langManager.getText('ui.fast'), value: 15 },
      { label: langManager.getText('ui.veryfast'), value: 5 }
    ];

    presets.forEach(preset => {
      const presetButton = document.createElement('button');
      presetButton.textContent = preset.label;
      presetButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 6px;
        background: rgba(0,0,0,0.3);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      `;

      presetButton.addEventListener('click', () => {
        this.game.getUIRenderer().setTypewriterSpeed(preset.value);
        speedSlider.value = preset.value.toString();
        speedValue.textContent = preset.value + 'ms';
      });

      presetButton.addEventListener('mouseenter', () => {
        presetButton.style.background = 'rgba(255,255,255,0.2)';
        presetButton.style.borderColor = 'rgba(255,255,255,0.6)';
      });

      presetButton.addEventListener('mouseleave', () => {
        presetButton.style.background = 'rgba(0,0,0,0.3)';
        presetButton.style.borderColor = 'rgba(255,255,255,0.4)';
      });

      speedPresets.appendChild(presetButton);
    });

    textSpeedSection.appendChild(speedContainer);
    textSpeedSection.appendChild(speedPresets);
    sectionsContainer.appendChild(textSpeedSection);

    // Keyboard Shortcuts Section
    const shortcutsSection = this.createSimpleSettingsSection(
      langManager.getText('settings.shortcuts', 'Phím tắt'),
      langManager.getText('settings.shortcuts.desc'),
      'keys'
    );

    const shortcutsList = document.createElement('div');
    shortcutsList.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    `;

    const shortcuts = [
      { key: 'Space / Enter', action: langManager.getText('ui.next') },
      { key: 'Esc', action: langManager.getText('ui.home') },
      { key: 'S', action: langManager.getText('ui.save') },
      { key: 'L', action: langManager.getText('ui.load') },
      { key: 'H', action: langManager.getText('ui.history') },
      { key: 'Esc', action: langManager.getText('ui.menu', 'Menu') }
    ];

    shortcuts.forEach(shortcut => {
      const shortcutItem = document.createElement('div');
      shortcutItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: rgba(0,0,0,0.3);
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        transition: all 0.3s ease;
      `;

      const keyElement = document.createElement('span');
      keyElement.textContent = shortcut.key;
      keyElement.style.cssText = `
        background: rgba(255,255,255,0.2);
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        min-width: 80px;
        text-align: center;
        font-size: 13px;
        border: 1px solid rgba(255,255,255,0.3);
      `;

      const actionElement = document.createElement('span');
      actionElement.textContent = shortcut.action;
      actionElement.style.cssText = `
        flex: 1;
        font-size: 14px;
        color: #f0f0f0;
      `;

      shortcutItem.appendChild(keyElement);
      shortcutItem.appendChild(actionElement);

      shortcutItem.addEventListener('mouseenter', () => {
        shortcutItem.style.background = 'rgba(255,255,255,0.1)';
        shortcutItem.style.borderColor = 'rgba(255,255,255,0.4)';
      });

      shortcutItem.addEventListener('mouseleave', () => {
        shortcutItem.style.background = 'rgba(0,0,0,0.3)';
        shortcutItem.style.borderColor = 'rgba(255,255,255,0.2)';
      });

      shortcutsList.appendChild(shortcutItem);
    });

    shortcutsSection.appendChild(shortcutsList);
    sectionsContainer.appendChild(shortcutsSection);

    contentContainer.appendChild(sectionsContainer);

    const footerSection = document.createElement('div');
    footerSection.style.cssText = `
      text-align: center;
      margin-top: auto;
      padding-top: 20px;
    `;

    const closeButton = document.createElement('button');
    closeButton.className = 'back-menu';
    closeButton.textContent = `← ${langManager.getText('ui.back')}`;
    closeButton.style.cssText = `
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 8px;
      background: rgba(0,0,0,0.3);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    `;

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(255,255,255,0.2)';
      closeButton.style.borderColor = 'rgba(255,255,255,0.6)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(0,0,0,0.3)';
      closeButton.style.borderColor = 'rgba(255,255,255,0.4)';
    });

    closeButton.onclick = () => {
      menuOverlay.remove();
      
      /**
       * Dùng show (gốc) hay showMainMenu đều được
       */
      // this.show();
      this.game.showMainMenu();
    };

    footerSection.appendChild(closeButton);
    contentContainer.appendChild(footerSection);

    settingsContainer.appendChild(contentContainer);

    menuOverlay.innerHTML = '';
    menuOverlay.appendChild(settingsContainer);
  }

  private createSimpleSettingsSection(title: string, description: string, iconType: string): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: rgba(0,0,0,0.4);
      border-radius: 10px;
      padding: 25px;
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    `;

    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    if (iconType === 'lang') {
      iconElement.innerHTML = `
        <div style="width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; position: relative;">
          <div style="position: absolute; top: -2px; left: 6px; width: 4px; height: 20px; border-left: 1px solid white;"></div>
          <div style="position: absolute; top: 6px; left: -2px; width: 20px; height: 4px; border-top: 1px solid white;"></div>
        </div>
      `;
    } else if (iconType === 'speed') {
      iconElement.innerHTML = `
        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 12px solid white; transform: rotate(-45deg);"></div>
      `;
    } else if (iconType === 'keys') {
      iconElement.innerHTML = `
        <div style="display: flex; gap: 2px;">
          <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
          <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
          <div style="width: 6px; height: 6px; background: white; border-radius: 1px;"></div>
        </div>
      `;
    }

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: white;
    `;

    header.appendChild(iconElement);
    header.appendChild(titleElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    descriptionElement.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 14px;
      opacity: 0.8;
      color: #e0e0e0;
      line-height: 1.4;
    `;

    section.appendChild(header);
    section.appendChild(descriptionElement);

    section.addEventListener('mouseenter', () => {
      section.style.background = 'rgba(0,0,0,0.5)';
      section.style.borderColor = 'rgba(255,255,255,0.3)';
    });

    section.addEventListener('mouseleave', () => {
      section.style.background = 'rgba(0,0,0,0.4)';
      section.style.borderColor = 'rgba(255,255,255,0.2)';
    });

    return section;
  }

  private setupSettingsBackground(container: HTMLElement, config: any): void {
    let backgroundStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
    
    if (config.backgroundColor) {
      backgroundStyle = `background: ${config.backgroundColor};`;
    }
    
    const settingsBackgroundUrl = config.backgroundVideo || config.background;
    if (settingsBackgroundUrl) {
      const backgroundType = this.detectBackgroundType(settingsBackgroundUrl);
      
      if (backgroundType === 'video') {
        const video = this.setupBackgroundVideo(settingsBackgroundUrl);
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '0';
        container.appendChild(video);
        backgroundStyle = 'background: transparent;';
      } else {
        backgroundStyle = `
          background-image: url('${settingsBackgroundUrl}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        `;
      }
    }
    
    if (config.backgroundOverlay) {
      backgroundStyle += `
        position: relative;
      `;
    }
    
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ${backgroundStyle}
      color: white;
      overflow-y: auto;
      pointer-events: auto;
      z-index: 1000;
    `;
  }

  private showCredits(): void {
    console.log('Credits modal');
  }
} 