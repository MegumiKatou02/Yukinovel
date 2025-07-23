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
    this.cleanupBackgroundElements();
  }

  private cleanupBackgroundElements(): void {
    const backgroundVideos = document.body.querySelectorAll('video[style*="position: fixed"][style*="z-index: -1"]');
    backgroundVideos.forEach(video => video.remove());
    
    const backgroundOverlays = document.body.querySelectorAll('div[style*="position: fixed"][style*="z-index: -1"]');
    backgroundOverlays.forEach(overlay => overlay.remove());
  }

  private createMainMenu(): void {
    this.mainMenuContainer.innerHTML = '';
    
    const config = this.game.getScript().settings?.mainMenu || {};
    const langManager = this.game.getLanguageManager();
    
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
        video.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
        `;
        document.body.appendChild(video);
        backgroundStyle = 'background: transparent;';
      } else {
        backgroundStyle = `
          background-image: url('${backgroundUrl}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
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
    const settingsConfig = config.settings || {};
    
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
    
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    settingsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 52, 96, 0.95) 100%);
      backdrop-filter: blur(10px);
      z-index: 1000;
      overflow-y: auto;
      color: white;
    `;

    this.setupSettingsBackground(settingsContainer, settingsConfig, config);

    const mainWrapper = document.createElement('div');
    mainWrapper.style.cssText = `
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 40px 20px;
      box-sizing: border-box;
      overflow-y: auto;
      position: relative;
      z-index: 1001;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 50px;
      width: 100%;
      max-width: 800px;
    `;

    const title = document.createElement('h1');
    title.textContent = langManager.getText('menu.settings');
    title.style.cssText = `
      font-size: clamp(32px, 5vw, 48px);
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #ffd700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = langManager.getText('settings.subtitle', 'Tùy chỉnh trải nghiệm game của bạn');
    subtitle.style.cssText = `
      font-size: clamp(14px, 2.5vw, 18px);
      margin: 0;
      opacity: 0.9;
      color: #e0e0e0;
    `;

    header.appendChild(title);
    header.appendChild(subtitle);
    mainWrapper.appendChild(header);

    const settingsContent = document.createElement('div');
    settingsContent.style.cssText = `
      width: 100%;
      max-width: 900px;
      display: flex;
      flex-direction: column;
      gap: 35px;
      margin-bottom: 50px;
    `;

    const languageSection = this.createSimpleSettingsSection(
      'fas fa-globe', 
      langManager.getText('settings.language', 'Ngôn ngữ'),
      langManager.getText('settings.language.desc', 'Chọn ngôn ngữ hiển thị')
    );

    const languageControl = document.createElement('div');
    languageControl.style.cssText = `
      margin-top: 15px;
    `;

    const languageSelect = document.createElement('select');
    languageSelect.style.cssText = `
      width: 100%;
      max-width: 350px;
      padding: 15px 20px;
      font-size: 16px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      background: rgba(0,0,0,0.4);
      color: white;
      cursor: pointer;
      outline: none;
    `;

    const availableLanguages = this.game.getAvailableLanguages();
    const currentLanguage = this.game.getCurrentLanguage();

    availableLanguages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      option.style.cssText = `background: #2a2a2a; color: white;`;
      if (lang.code === currentLanguage) {
        option.selected = true;
      }
      languageSelect.appendChild(option);
    });

    languageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.game.setLanguage(target.value);
    });

    languageControl.appendChild(languageSelect);
    languageSection.appendChild(languageControl);
    settingsContent.appendChild(languageSection);

    const speedSection = this.createSimpleSettingsSection(
      'fas fa-tachometer-alt', 
      langManager.getText('settings.textSpeed', 'Tốc độ text'),
      langManager.getText('settings.textSpeed.desc', 'Điều chỉnh tốc độ hiển thị văn bản')
    );

    const speedControl = document.createElement('div');
    speedControl.style.cssText = `
      margin-top: 15px;
    `;

    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    `;

    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '5';
    speedSlider.max = '100';
    speedSlider.value = this.game.getUIRenderer().getTypewriterSpeed().toString();
    speedSlider.style.cssText = `
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.2);
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
    `;

    const speedValue = document.createElement('div');
    speedValue.textContent = this.game.getUIRenderer().getTypewriterSpeed() + 'ms';
    speedValue.style.cssText = `
      min-width: 70px;
      text-align: center;
      font-weight: bold;
      color: white;
      background: rgba(74, 144, 226, 0.3);
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(74, 144, 226, 0.5);
      font-size: 14px;
    `;

    speedSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value);
      this.game.getUIRenderer().setTypewriterSpeed(value);
      speedValue.textContent = value + 'ms';
    });

    sliderContainer.appendChild(speedSlider);
    sliderContainer.appendChild(speedValue);

    const presetsContainer = document.createElement('div');
    presetsContainer.style.cssText = `
      display: flex;  
      gap: 12px;
      max-width: 500px;
    `;

    const presets = [
      { label: langManager.getText('ui.slow', 'Chậm'), value: 60 },
      { label: langManager.getText('ui.normal', 'Bình thường'), value: 20 },
      { label: langManager.getText('ui.fast', 'Nhanh'), value: 15 },
      { label: langManager.getText('ui.veryfast', 'Rất nhanh'), value: 5 }
    ];

    presets.forEach(preset => {
      const presetBtn = document.createElement('button');
      presetBtn.textContent = preset.label;
      presetBtn.style.cssText = `
        padding: 10px 20px;
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 6px;
        background: rgba(0,0,0,0.3);
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      `;

      presetBtn.addEventListener('click', () => {
        this.game.getUIRenderer().setTypewriterSpeed(preset.value);
        speedSlider.value = preset.value.toString();
        speedValue.textContent = preset.value + 'ms';
      });

      presetsContainer.appendChild(presetBtn);
    });

    speedControl.appendChild(sliderContainer);
    speedControl.appendChild(presetsContainer);
    speedSection.appendChild(speedControl);
    settingsContent.appendChild(speedSection);

    const shortcutsSection = this.createSimpleSettingsSection(
      'fas fa-keyboard', 
      langManager.getText('settings.shortcuts', 'Phím tắt'),
      langManager.getText('settings.shortcuts.desc', 'Danh sách các phím tắt hữu ích')
    );

    const shortcutsGrid = document.createElement('div');
    shortcutsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 15px;
      margin-top: 15px;
    `;

    const shortcuts = [
      { key: 'Space / Enter', action: langManager.getText('ui.next', 'Tiếp tục') },
      { key: 'Esc', action: langManager.getText('ui.home', 'Về menu') },
      { key: 'S', action: langManager.getText('ui.save', 'Lưu game') },
      { key: 'L', action: langManager.getText('ui.load', 'Tải game') },
      { key: 'H', action: langManager.getText('ui.history', 'Lịch sử') },
      { key: 'M', action: langManager.getText('ui.menu', 'Menu') }
    ];

    shortcuts.forEach(shortcut => {
      const shortcutItem = document.createElement('div');
      shortcutItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.15);
      `;

      const keyBadge = document.createElement('span');
      keyBadge.textContent = shortcut.key;
      keyBadge.style.cssText = `
        background: rgba(74, 144, 226, 0.3);
        padding: 6px 12px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 13px;
        border: 1px solid rgba(74, 144, 226, 0.5);
        min-width: 100px;
        text-align: center;
      `;

      const actionText = document.createElement('span');
      actionText.textContent = shortcut.action;
      actionText.style.cssText = `
        flex: 1;
        font-size: 15px;
        color: #e0e0e0;
      `;

      shortcutItem.appendChild(keyBadge);
      shortcutItem.appendChild(actionText);

      shortcutsGrid.appendChild(shortcutItem);
    });

    shortcutsSection.appendChild(shortcutsGrid);
    settingsContent.appendChild(shortcutsSection);

    mainWrapper.appendChild(settingsContent);

    const footer = document.createElement('div');
    footer.style.cssText = `
      width: 100%;
      text-align: center;
      padding: 20px 0;
    `;

    const backButton = document.createElement('button');
    backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${langManager.getText('ui.back', 'Quay lại')}`;
    backButton.style.cssText = `
      padding: 15px 30px;
      font-size: 16px;
      font-weight: bold;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      background: rgba(0,0,0,0.4);
      color: white;
      cursor: pointer;
      min-width: 150px;
    `;

    backButton.addEventListener('mouseenter', () => {
      backButton.style.background = 'rgba(255,255,255,0.2)';
      backButton.style.borderColor = 'rgba(255,255,255,0.6)';
      backButton.style.transform = 'translateY(-2px)';
      backButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });

    backButton.addEventListener('mouseleave', () => {
      backButton.style.background = 'rgba(0,0,0,0.6)';
      backButton.style.borderColor = 'rgba(255,255,255,0.4)';
      backButton.style.transform = 'translateY(0)';
      backButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });

    backButton.addEventListener('click', () => {
      this.cleanupBackgroundElements();
      this.game.showMainMenu();
    });

    footer.appendChild(backButton);
    mainWrapper.appendChild(footer);

    settingsContainer.appendChild(mainWrapper);

    menuOverlay.innerHTML = '';
    menuOverlay.appendChild(settingsContainer);
  }

  private createSimpleSettingsSection(iconClass: string, title: string, description: string): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: rgba(0,0,0,0.4);
      border-radius: 10px;
      padding: 25px;
      border: 1px solid rgba(255,255,255,0.15);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
    `;

    const iconElement = document.createElement('i');
    iconElement.className = iconClass;
    iconElement.style.cssText = `
      font-size: 20px;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(74, 144, 226, 0.2);
      border-radius: 8px;
      border: 1px solid rgba(74, 144, 226, 0.4);
      color: #4A90E2;
    `;

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

    const descElement = document.createElement('p');
    descElement.textContent = description;
    descElement.style.cssText = `
      margin: 0 0 15px 0;
      font-size: 14px;
      opacity: 0.8;
      color: #c0c0c0;
      line-height: 1.4;
    `;

    section.appendChild(header);
    section.appendChild(descElement);

    return section;
  }

  private setupSettingsBackground(container: HTMLElement, settingsConfig: any, mainConfig: any): void {
    const settingsBackgroundUrl = settingsConfig.backgroundVideo || settingsConfig.background || 
                         mainConfig.backgroundVideo || mainConfig.background;
    const backgroundColor = settingsConfig.backgroundColor || mainConfig.backgroundColor;
    const backgroundOverlay = settingsConfig.backgroundOverlay || mainConfig.backgroundOverlay;
    
    if (settingsBackgroundUrl) {
      const backgroundType = this.detectBackgroundType(settingsBackgroundUrl);
      
      if (backgroundType === 'video') {
        container.style.background = 'transparent';
        
        const video = this.setupBackgroundVideo(settingsBackgroundUrl);
        video.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: 999;
          pointer-events: none;
        `;
        container.appendChild(video);
        
        if (!backgroundOverlay) {
          const defaultOverlay = document.createElement('div');
          defaultOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 1000;
            pointer-events: none;
          `;
          container.appendChild(defaultOverlay);
        }
      } else {
        container.style.backgroundImage = `url('${settingsBackgroundUrl}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';
        container.style.backgroundAttachment = 'fixed';
        container.style.background = `url('${settingsBackgroundUrl}') center/cover no-repeat fixed`;
      }
    }

    if (backgroundColor) {
      container.style.background = backgroundColor;
    }

    if (backgroundOverlay) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${backgroundOverlay};
        z-index: 1000;
        pointer-events: none;
      `;
      container.appendChild(overlay);
    }
  }

  private showCredits(): void {
    const langManager = this.game.getLanguageManager();
    const config = this.game.getScript().settings?.mainMenu || {};
    const creditsConfig = config.credits || {};
    
    const creditsContainer = document.createElement('div');
    creditsContainer.id = 'credits-container';
    
    this.setupCreditsBackground(creditsContainer, creditsConfig, config);

    const contentContainer = document.createElement('div');
    contentContainer.id = 'credits-content';
    contentContainer.style.cssText = `
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 60px 40px 120px 40px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    this.createCreditsTitle(contentContainer, creditsConfig, langManager);

    this.createCreditsSections(contentContainer, creditsConfig, langManager);

    this.createCreditsFooter(contentContainer, langManager);

    creditsContainer.appendChild(contentContainer);

    this.mainMenuContainer.innerHTML = '';
    this.mainMenuContainer.appendChild(creditsContainer);

    this.addCreditsAnimations();

    if (creditsConfig.autoScroll) {
      this.startAutoScroll(contentContainer, creditsConfig.scrollSpeed || 50);
    }

    if (creditsConfig.music) {
      this.game.getAudioManager().playMusic(creditsConfig.music);
    }
  }

  private setupCreditsBackground(container: HTMLElement, creditsConfig: any, mainConfig: any): void {
    let backgroundStyle = 'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);';
    
    const backgroundUrl = creditsConfig.backgroundVideo || creditsConfig.background || 
                         mainConfig.backgroundVideo || mainConfig.background;
    const backgroundColor = creditsConfig.backgroundColor || mainConfig.backgroundColor;
    const backgroundOverlay = creditsConfig.backgroundOverlay || mainConfig.backgroundOverlay;
    
    if (backgroundColor) {
      backgroundStyle = `background: ${backgroundColor};`;
    }
    
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
        container.appendChild(video);
        backgroundStyle = 'background: transparent;';
      } else {
        backgroundStyle = `
          background-image: url('${backgroundUrl}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        `;
      }
    }

    if (backgroundOverlay) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${backgroundOverlay};
        z-index: 1;
      `;
      container.appendChild(overlay);
    }
    
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ${backgroundStyle}
      color: white;
      pointer-events: auto;
      z-index: 1000;
    `;
  }

  private createCreditsTitle(container: HTMLElement, creditsConfig: any, langManager: any): void {
    const style = creditsConfig.style || {};
    const titleText = langManager.getLocalizedText(creditsConfig.title) || 
                     langManager.getText('credits.title', 'Credits');

    const titleElement = document.createElement('h1');
    titleElement.className = 'credits-title';
    titleElement.textContent = titleText;
    titleElement.style.cssText = `
      font-size: ${style.titleSize || 48}px;
      color: ${style.titleColor || '#ffffff'};
      font-family: ${style.fontFamily || 'Arial, sans-serif'};
      font-weight: bold;
      text-align: center;
      margin: 0 0 60px 0;
      opacity: 0;
      transform: translateY(30px);
      animation: creditsSlideIn 1s ease-out 0.2s forwards;
    `;

    container.appendChild(titleElement);
  }

  private createCreditsSections(container: HTMLElement, creditsConfig: any, langManager: any): void {
    const sections = creditsConfig.sections || this.getDefaultCreditsSections(langManager);
    const style = creditsConfig.style || {};
    const animationConfig = creditsConfig.animation || {};

    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'credits-sections';
    sectionsContainer.style.cssText = `
      max-width: 900px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      padding: 0 40px;
    `;

    const allItems: any[] = [];
    sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        allItems.push(item);
      });
    });

    const leftColumnItems = allItems.filter((_, index) => index % 2 === 0);
    const rightColumnItems = allItems.filter((_, index) => index % 2 === 1);

    const leftColumn = document.createElement('div');
    leftColumn.className = 'credits-column';
    leftColumn.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 40px;
      opacity: 0;
      transform: translateY(30px);
      animation: creditsSlideIn ${animationConfig.duration || 0.8}s ease-out 0.5s forwards;
    `;

    leftColumnItems.forEach((item: any) => {
      const itemElement = this.createSimpleCreditItem(item, style, langManager);
      leftColumn.appendChild(itemElement);
    });

    const rightColumn = document.createElement('div');
    rightColumn.className = 'credits-column';
    rightColumn.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 40px;
      opacity: 0;
      transform: translateY(30px);
      animation: creditsSlideIn ${animationConfig.duration || 0.8}s ease-out 0.7s forwards;
    `;

    rightColumnItems.forEach((item: any) => {
      const itemElement = this.createSimpleCreditItem(item, style, langManager);
      rightColumn.appendChild(itemElement);
    });

    sectionsContainer.appendChild(leftColumn);
    sectionsContainer.appendChild(rightColumn);
    container.appendChild(sectionsContainer);
  }

  private createSimpleCreditItem(item: any, globalStyle: any, langManager: any): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.className = 'credit-item-simple';
    itemElement.style.cssText = `
      text-align: left;
      cursor: ${item.link ? 'pointer' : 'default'};
      transition: all 0.3s ease;
    `;

    if (item.link) {
      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.transform = 'translateX(10px)';
      });

      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.transform = 'translateX(0)';
      });

      itemElement.addEventListener('click', () => {
        window.open(item.link, '_blank');
      });
    }

    if (item.role) {
      const roleElement = document.createElement('div');
      roleElement.className = 'item-role-simple';
      roleElement.textContent = langManager.getLocalizedText(item.role) || item.role;
      roleElement.style.cssText = `
        font-size: 14px;
        color: ${item.style?.roleColor || globalStyle.linkColor || '#CCCCCC'};
        font-weight: normal;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 8px;
        opacity: 0.8;
      `;
      itemElement.appendChild(roleElement);
    }

    const nameElement = document.createElement('div');
    nameElement.className = 'item-name-simple';
    nameElement.textContent = item.name;
    nameElement.style.cssText = `
      font-size: ${globalStyle.textSize || 24}px;
      color: ${item.style?.nameColor || globalStyle.textColor || '#FFFFFF'};
      font-family: ${globalStyle.fontFamily || 'Arial, sans-serif'};
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: ${item.description ? '8px' : '0'};
    `;
    itemElement.appendChild(nameElement);

    if (item.description) {
      const descElement = document.createElement('div');
      descElement.className = 'item-description-simple';
      descElement.textContent = langManager.getLocalizedText(item.description) || item.description;
      descElement.style.cssText = `
        font-size: ${(globalStyle.textSize || 24) - 8}px;
        color: ${item.style?.descriptionColor || '#AAAAAA'};
        font-family: ${globalStyle.fontFamily || 'Arial, sans-serif'};
        line-height: 1.4;
        opacity: 0.9;
      `;
      itemElement.appendChild(descElement);
    }

    return itemElement;
  }

  private createCreditsFooter(container: HTMLElement, langManager: any): void {
    const footerElement = document.createElement('div');
    footerElement.className = 'credits-footer';
    footerElement.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    `;

    const backButton = document.createElement('button');
    backButton.className = 'credits-back-button';
    backButton.textContent = `← ${langManager.getText('ui.back', 'Quay lại')}`;
    backButton.style.cssText = `
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 25px;
      background: rgba(0,0,0,0.6);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;

    backButton.addEventListener('mouseenter', () => {
      backButton.style.background = 'rgba(255,255,255,0.2)';
      backButton.style.borderColor = 'rgba(255,255,255,0.6)';
      backButton.style.transform = 'translateY(-2px)';
      backButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });

    backButton.addEventListener('mouseleave', () => {
      backButton.style.background = 'rgba(0,0,0,0.6)';
      backButton.style.borderColor = 'rgba(255,255,255,0.4)';
      backButton.style.transform = 'translateY(0)';
      backButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });

    backButton.addEventListener('click', () => {
      // Cleanup background elements trước khi chuyển trang
      this.cleanupBackgroundElements();
      this.game.showMainMenu();
    });

    footerElement.appendChild(backButton);
    container.appendChild(footerElement);
  }

  private getDefaultCreditsSections(langManager: any): any[] {
    const gameScript = this.game.getScript();
    
    return [
      {
        title: langManager.getText('credits.development', 'Credits'),
        items: [
          {
            role: langManager.getText('credits.created_directed', 'Created and Directed by'),
            name: gameScript.author || 'Unknown Author'
          },
          {
            role: langManager.getText('credits.executive_producer', 'Executive Producer'),
            name: 'Visual Novel Team'
          },
          {
            role: langManager.getText('credits.producer', 'Producer'),
            name: 'Game Studio'
          },
          {
            role: langManager.getText('credits.art', 'Art'),
            name: 'Art Team'
          },
          {
            role: langManager.getText('credits.sound_designer', 'Sound Designer and Composer'),
            name: 'Audio Team'
          },
          {
            role: langManager.getText('credits.programming', 'Programming & Animation'),
            name: 'Development Team'
          },
          {
            role: langManager.getText('credits.gameplay_designer', 'Lead Gameplay Designer'),
            name: 'Design Team'
          },
          {
            role: langManager.getText('credits.design_scripting', 'Design and Scripting'),
            name: 'Script Writers'
          },
          {
            role: langManager.getText('credits.special_thanks', 'Special Thanks'),
            name: langManager.getText('credits.you', 'Yukinovel')
          },
          {
            role: langManager.getText('credits.version', 'Version'),
            name: gameScript.version || '1.0.0'
          }
        ]
      }
    ];
  }

  private addCreditsAnimations(): void {
    const style = document.createElement('style');
    style.id = 'credits-animations';
    style.innerHTML = `
      @keyframes creditsSlideIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .credits-title {
        background: linear-gradient(45deg, #ffd700, #ffed4a, #ffd700);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: creditsSlideIn 1s ease-out 0.2s forwards, titleGlow 3s ease-in-out infinite;
      }

      @keyframes titleGlow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      .credit-item-simple:hover {
        transform: translateX(10px);
      }

      .credits-column {
        animation-fill-mode: forwards;
      }

      #credits-content {
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.3) transparent;
      }

      #credits-content::-webkit-scrollbar {
        width: 8px;
      }

      #credits-content::-webkit-scrollbar-track {
        background: transparent;
      }

      #credits-content::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 4px;
      }

      #credits-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.5);
      }

      @media (max-width: 768px) {
        .credits-sections {
          grid-template-columns: 1fr !important;
          gap: 30px !important;
          padding: 0 20px !important;
        }
        
        .credits-column {
          gap: 30px !important;
        }
        
        .item-name-simple {
          font-size: 20px !important;
        }
        
        .item-role-simple {
          font-size: 12px !important;
        }
      }
    `;
    
    const existingStyle = document.getElementById('credits-animations');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  }

  private startAutoScroll(container: HTMLElement, speed: number): void {
    let isScrolling = true;
    let scrollPosition = 0;
    const maxScroll = container.scrollHeight - container.clientHeight;

    const scroll = () => {
      if (!isScrolling) return;
      
      scrollPosition += 1;
      container.scrollTop = scrollPosition;
      
      if (scrollPosition >= maxScroll) {
        setTimeout(() => {
          scrollPosition = 0;
          container.scrollTop = 0;
        }, 3000);
      }
      
      setTimeout(scroll, speed);
    };

    setTimeout(scroll, 2000);

    container.addEventListener('wheel', () => {
      isScrolling = false;
      setTimeout(() => { isScrolling = true; }, 5000);
    });

    container.addEventListener('touchstart', () => {
      isScrolling = false;
      setTimeout(() => { isScrolling = true; }, 5000);
    });
  }
} 
