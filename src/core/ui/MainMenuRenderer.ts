import { CreditItem, CreditsConfig, CreditSection, CreditStyle, MainMenuConfig } from '../../types/index.js';
import { Game } from '../Game.js';
import { LanguageManager } from '../LanguageManager.js';

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
    
    // Main content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'container-content';
    contentContainer.className = 'vn-main-menu-content';
    
    const layout = config.layout || {};
    const alignment = layout.alignment || 'center';
    const padding = layout.padding || 50;
    
    if (alignment === 'left') {
      contentContainer.classList.add('align-left');
    } else if (alignment === 'right') {
      contentContainer.classList.add('align-right');
    }
    
    if (layout.titlePosition === 'top') {
      contentContainer.classList.add('title-top');
    } else if (layout.titlePosition === 'bottom') {
      contentContainer.classList.add('title-bottom');
    }
    
    if (padding !== 50) {
      contentContainer.style.padding = `${padding}px`;
    }
    
    this.createTitle(contentContainer, config, alignment, langManager);
    this.createSubtitle(contentContainer, config, alignment, langManager);
    this.createButtons(contentContainer, config, langManager);
    
    this.mainMenuContainer.appendChild(contentContainer);
    this.addAnimations();
  }

  private setupBackground(config: MainMenuConfig): void {
    // Remove existing background classes
    this.mainMenuContainer.className = 'vn-main-menu-container';
    
    let backgroundStyle = '';
    
    if (config.backgroundColor) {
      backgroundStyle = `background: ${config.backgroundColor};`;
      this.mainMenuContainer.style.background = config.backgroundColor;
    }
    
    const backgroundUrl = config.backgroundVideo || config.background;
    if (backgroundUrl) {
      const backgroundType = this.detectBackgroundType(backgroundUrl);
      
      if (backgroundType === 'video') {
        const video = this.setupBackgroundVideo(backgroundUrl);
        video.classList.add('vn-video-background');
        document.body.appendChild(video);
        backgroundStyle = 'background: transparent;';
      } else {
        backgroundStyle = `
          background-image: url('${backgroundUrl}');
        `;
        this.mainMenuContainer.classList.add('vn-background');
        this.mainMenuContainer.style.backgroundImage = `url('${backgroundUrl}')`;
      }
    }
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

  private createTitle(container: HTMLElement, config: MainMenuConfig, alignment: string, langManager: LanguageManager): void {
    const titleConfig = config.title || {};
    const titleDiv = document.createElement('div');
    titleDiv.id = 'title-game';
    titleDiv.className = 'vn-main-menu-title';
    
    const titleText = langManager.getLocalizedText(titleConfig.text || this.game.getScript().title || 'Visual Novel');
    titleDiv.textContent = titleText;
    
    if (titleConfig.color && titleConfig.color !== 'white') {
      titleDiv.style.color = titleConfig.color;
    }
    if (titleConfig.fontSize && titleConfig.fontSize !== 48) {
      titleDiv.style.fontSize = `${titleConfig.fontSize}px`;
    }
    if (titleConfig.fontFamily && titleConfig.fontFamily !== 'Arial, sans-serif') {
      titleDiv.style.fontFamily = titleConfig.fontFamily;
    }
    if (alignment !== 'center') {
      titleDiv.style.textAlign = alignment;
    }
    
    if (titleConfig.gradient) {
      titleDiv.style.background = titleConfig.gradient;
      titleDiv.style.webkitBackgroundClip = 'text';
      titleDiv.style.backgroundClip = 'text';
      titleDiv.style.webkitTextFillColor = 'transparent';
    }
    
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

  private createSubtitle(container: HTMLElement, config: MainMenuConfig, alignment: string, langManager: LanguageManager): void {
    const subtitleConfig = config.subtitle || {};
    if (subtitleConfig.show !== false) {
      const subtitleDiv = document.createElement('div');
      subtitleDiv.id = 'subtitle-game';
      subtitleDiv.className = 'vn-main-menu-subtitle';
      
      const subtitleText = langManager.getLocalizedText(subtitleConfig.text || '') || langManager.getSubtitleText();
      subtitleDiv.textContent = subtitleText;
      
      // Apply custom styles if specified
      if (subtitleConfig.fontSize && subtitleConfig.fontSize !== 16) {
        subtitleDiv.style.fontSize = `${subtitleConfig.fontSize}px`;
      }
      if (subtitleConfig.color && subtitleConfig.color !== '#cccccc') {
        subtitleDiv.style.color = subtitleConfig.color;
      }
      if (alignment !== 'center') {
        subtitleDiv.style.textAlign = alignment;
      }
      
      container.appendChild(subtitleDiv);
    }
  }

  private createButtons(container: HTMLElement, config: MainMenuConfig, langManager: LanguageManager): void {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'container-button';
    buttonsContainer.className = 'vn-main-menu-buttons';
    
    const buttonConfig = config.buttons || {};
    const buttonSpacing = buttonConfig.spacing || 15;
    const buttonWidth = buttonConfig.width || 300;
    
    if (buttonSpacing !== 15) {
      buttonsContainer.style.gap = `${buttonSpacing}px`;
    }
    if (buttonWidth !== 300) {
      buttonsContainer.style.minWidth = `${buttonWidth}px`;
    }
    
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
    button.className = 'vn-main-menu-button';
    
    const style = buttonConfig.style || 'modern';
    const color = buttonConfig.color || '#4A90E2';
    const hoverColor = buttonConfig.hoverColor || '#357ABD';
    const textColor = buttonConfig.textColor || '#ffffff';
    const fontSize = buttonConfig.fontSize || 18;
    const borderRadius = buttonConfig.borderRadius || 8;
    
    if (color !== '#4A90E2') {
      button.style.setProperty('--button-bg', color);
    }
    if (hoverColor !== '#357ABD') {
      button.style.setProperty('--button-hover-bg', hoverColor);
    }
    if (textColor !== '#ffffff') {
      button.style.color = textColor;
    }
    if (fontSize !== 18) {
      button.style.fontSize = `${fontSize}px`;
    }
    if (borderRadius !== 8) {
      button.style.borderRadius = `${borderRadius}px`;
    }
    
    if (style === 'glass') {
      button.classList.add('glass-style');
    } else if (style === 'minimal') {
      button.classList.add('minimal-style');
    } else if (style === 'classic') {
      button.classList.add('classic-style');
    }
    
    button.innerHTML = `<span style="font-size: 20px;">${icon}</span><span>${text}</span>`;
    
    // Animation effects
      if (buttonConfig.animation === 'bounce') {
      button.classList.add('bounce-animation');
      } else if (buttonConfig.animation === 'slide') {
      button.classList.add('slide-animation');
    }
    
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
      
      .vn-main-menu-button.glass-style {
        background: rgba(255,255,255,0.1) !important;
      backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      }
      
      .vn-main-menu-button.minimal-style {
        background: transparent !important;
        border: 2px solid var(--button-bg, #4A90E2);
        color: var(--button-bg, #4A90E2);
      }
      
      .vn-main-menu-button.minimal-style:hover {
        background: var(--button-bg, #4A90E2) !important;
      color: white;
      }
      
      .vn-main-menu-button.classic-style {
        background: linear-gradient(45deg, var(--button-bg, #4A90E2), var(--button-hover-bg, #357ABD)) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      
      .vn-main-menu-button.bounce-animation:hover {
        transform: scale(1.05);
      }
      
      .vn-main-menu-button.slide-animation:hover {
        transform: translateX(10px);
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
    settingsContainer.classList.add('vn-settings-container');

    this.setupSettingsBackground(settingsContainer, settingsConfig, config);

    const mainWrapper = document.createElement('div');
    mainWrapper.classList.add('vn-mainwrapper');

    const header = document.createElement('div');
    header.classList.add('vn-header-page');

    const title = document.createElement('h1');
    title.classList.add('title');
    title.textContent = langManager.getText('menu.settings');

    const subtitle = document.createElement('p');
    subtitle.classList.add('subtitle');
    subtitle.textContent = langManager.getText('settings.subtitle', 'Tùy chỉnh trải nghiệm game của bạn');

    header.appendChild(title);
    header.appendChild(subtitle);
    mainWrapper.appendChild(header);

    const settingsContent = document.createElement('div');
    settingsContent.id = 'vn-settings-content';

    const languageSection = this.createSimpleSettingsSection(
      'fas fa-globe', 
      langManager.getText('settings.language', 'Ngôn ngữ'),
      langManager.getText('settings.language.desc', 'Chọn ngôn ngữ hiển thị')
    );

    const languageControl = document.createElement('div');
    languageControl.classList.add('section-content');

    const languageSelect = document.createElement('select');
    languageSelect.id = 'language-select';
    const availableLanguages = this.game.getAvailableLanguages();
    const currentLanguage = this.game.getCurrentLanguage();

    availableLanguages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      option.classList.add('language-option');
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
    speedControl.classList.add('section-content');

    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider-container');

    const speedSlider = document.createElement('input');
    speedSlider.classList.add('speed-slider');
    speedSlider.type = 'range';
    speedSlider.min = '5';
    speedSlider.max = '100';
    speedSlider.value = this.game.getUIRenderer().getTypewriterSpeed().toString();

    const speedValue = document.createElement('div');
    speedValue.textContent = this.game.getUIRenderer().getTypewriterSpeed() + 'ms';
    speedValue.classList.add('value-frame');

    speedSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value);
      this.game.getUIRenderer().setTypewriterSpeed(value);
      speedValue.textContent = value + 'ms';
    });

    sliderContainer.appendChild(speedSlider);
    sliderContainer.appendChild(speedValue);

    const presetsContainer = document.createElement('div');
    presetsContainer.classList.add('presets-container');

    const presets = [
      { label: langManager.getText('ui.slow', 'Chậm'), value: 60 },
      { label: langManager.getText('ui.normal', 'Bình thường'), value: 20 },
      { label: langManager.getText('ui.fast', 'Nhanh'), value: 15 },
      { label: langManager.getText('ui.veryfast', 'Rất nhanh'), value: 5 }
    ];

    presets.forEach(preset => {
      const presetBtn = document.createElement('button');
      presetBtn.classList.add('preset-button');
      presetBtn.textContent = preset.label;

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
    shortcutsGrid.classList.add('shortcuts-container');

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
      shortcutItem.classList.add('shortcut-item');

      const keyBadge = document.createElement('span');
      keyBadge.classList.add('value-frame');
      keyBadge.textContent = shortcut.key;

      const actionText = document.createElement('span');
      actionText.textContent = shortcut.action;

      shortcutItem.appendChild(keyBadge);
      shortcutItem.appendChild(actionText);

      shortcutsGrid.appendChild(shortcutItem);
    });

    shortcutsSection.appendChild(shortcutsGrid);
    settingsContent.appendChild(shortcutsSection);

    mainWrapper.appendChild(settingsContent);

    const footer = document.createElement('div');
    footer.classList.add('footer');

    const backButton = document.createElement('button');
    backButton.classList.add('back-button');
    backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${langManager.getText('ui.back', 'Quay lại')}`;

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
    section.classList.add('section');

    const header = document.createElement('div');
    header.classList.add('header');

    const iconElement = document.createElement('i');
    iconElement.className = iconClass;
    iconElement.classList.add('icon');

    const titleElement = document.createElement('h3');
    titleElement.classList.add('title');
    titleElement.textContent = title;

    header.appendChild(iconElement);
    header.appendChild(titleElement);

    const descElement = document.createElement('p');
    descElement.classList.add('description');
    descElement.textContent = description;

    section.appendChild(header);
    section.appendChild(descElement);

    return section;
  }

  private setupSettingsBackground(
    container: HTMLElement,
    settingsConfig: {background?: string, backgroundVideo?: string, backgroundColor?: string},
    mainConfig: MainMenuConfig): void 
  {
    const settingsBackgroundUrl = settingsConfig.backgroundVideo || settingsConfig.background || 
                         mainConfig.backgroundVideo || mainConfig.background;
    const backgroundColor = settingsConfig.backgroundColor || mainConfig.backgroundColor;
    
    if (settingsBackgroundUrl) {
      const backgroundType = this.detectBackgroundType(settingsBackgroundUrl);
      
      if (backgroundType === 'video') {
        container.style.background = 'transparent';
        
        const video = this.setupBackgroundVideo(settingsBackgroundUrl);
        video.classList.add('vn-video-background')
        container.appendChild(video);
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

    this.createCreditsTitle(contentContainer, creditsConfig, langManager);

    this.createCreditsSections(contentContainer, creditsConfig, langManager);

    this.createCreditsFooter(contentContainer, langManager);

    creditsContainer.appendChild(contentContainer);

    this.mainMenuContainer.innerHTML = '';
    this.mainMenuContainer.appendChild(creditsContainer);

    if (creditsConfig.autoScroll) {
      this.startAutoScroll(contentContainer, creditsConfig.scrollSpeed || 50);
    }

    if (creditsConfig.music) {
      this.game.getAudioManager().playMusic(creditsConfig.music);
    }
  }

  private setupCreditsBackground(container: HTMLElement, creditsConfig: CreditsConfig, mainConfig: MainMenuConfig): void {
    // let backgroundStyle = 'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);';
    
    const backgroundUrl = creditsConfig.backgroundVideo || creditsConfig.background || 
      mainConfig.backgroundVideo || mainConfig.background;
    const backgroundColor = creditsConfig.backgroundColor || mainConfig.backgroundColor;
    
    if (backgroundColor) {
      container.style.background = backgroundColor;
    }
    
    if (backgroundUrl) {
      const backgroundType = this.detectBackgroundType(backgroundUrl);
      
      if (backgroundType === 'video') {
        container.classList.add('video');
        const video = this.setupBackgroundVideo(backgroundUrl);
        video.classList.add('vn-background-video');
        container.appendChild(video);
      } else {
        container.classList.add('non-video');
        container.style.backgroundImage = `url('${backgroundUrl}')`;
      }
    }
  }

  private createCreditsTitle(container: HTMLElement, creditsConfig: CreditsConfig, langManager: LanguageManager): void {
    const style = creditsConfig.style || {};
    const titleText = langManager.getLocalizedText(creditsConfig.title ?? 'en') || 
      langManager.getText('credits.title', 'Credits');

    const titleElement = document.createElement('h1');
    titleElement.className = 'credits-title';
    titleElement.textContent = titleText;
    titleElement.style.cssText = `
      font-size: ${style.titleSize || 48}px;
      color: ${style.titleColor || '#ffffff'};
      font-family: ${style.fontFamily || 'Arial, sans-serif'};
    `;

    container.appendChild(titleElement);
  }

  private createCreditsSections(container: HTMLElement, creditsConfig: CreditsConfig, langManager: LanguageManager): void {
    const sections = creditsConfig.sections || this.getDefaultCreditsSections(langManager);
    const style = creditsConfig.style || {};

    const sectionsContainer = document.createElement('div');
    sectionsContainer.classList.add('credits-sections');

    const allItems: CreditItem[] = [];
    sections.forEach((section: CreditSection) => {
      section.items.forEach((item: CreditItem) => {
        allItems.push(item);
      });
    });

    const leftColumnItems = allItems.filter((_, index) => index % 2 === 0);
    const rightColumnItems = allItems.filter((_, index) => index % 2 === 1);

    const leftColumn = document.createElement('div');
    leftColumn.classList.add('credits-column');
    leftColumn.style.animation = `creditsSlideIn 0.8s ease-out 0.5s forwards`;

    leftColumnItems.forEach((item: CreditItem) => {
      const itemElement = this.createSimpleCreditItem(item, style, langManager);
      leftColumn.appendChild(itemElement);
    });

    const rightColumn = document.createElement('div');
    rightColumn.classList.add('credits-column');
    rightColumn.style.animation = `creditsSlideIn 0.8s ease-out 0.5s forwards`;

    rightColumnItems.forEach((item: CreditItem) => {
      const itemElement = this.createSimpleCreditItem(item, style, langManager);
      rightColumn.appendChild(itemElement);
    });

    sectionsContainer.appendChild(leftColumn);
    sectionsContainer.appendChild(rightColumn);
    container.appendChild(sectionsContainer);
  }

  private createSimpleCreditItem(item: CreditItem, globalStyle: CreditStyle, langManager: LanguageManager): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.classList.add('credit-item-simple')
    itemElement.style.cursor = `cursor: ${item.link ? 'pointer' : 'default'}`;

    if (item.link) {
      itemElement.classList.add('hasLink');

      itemElement.addEventListener('click', () => {
        window.open(item.link, '_blank');
      });
    }

    if (item.role) {
      const roleElement = document.createElement('div');
      roleElement.className = 'item-role-simple';
      roleElement.textContent = langManager.getLocalizedText(item.role);
      roleElement.style.color = item.style?.roleColor || globalStyle.linkColor || '#CCCCCC';
      itemElement.appendChild(roleElement);
    }

    const nameElement = document.createElement('div');
    nameElement.className = 'item-name-simple';
    nameElement.textContent = item.name;
    nameElement.style.cssText = `
      font-size: ${globalStyle.textSize || 24}px;
      color: ${item.style?.nameColor || globalStyle.textColor || '#FFFFFF'};
      font-family: ${globalStyle.fontFamily || 'Arial, sans-serif'};
      margin-bottom: ${item.description ? '8px' : '0'};
    `;
    nameElement.style.fontSize = `font-size: ${globalStyle.textSize || 24}px`;
    nameElement.style.color = `color: ${item.style?.nameColor || globalStyle.textColor || '#FFFFFF'}`;
    nameElement.style.fontFamily = `${globalStyle.fontFamily || 'Arial, sans-serif'}`;
    nameElement.style.marginBottom = `${item.description ? '8px' : '0'}`;
    itemElement.appendChild(nameElement);

    if (item.description) {
      const descElement = document.createElement('div');
      descElement.className = 'item-description-simple';
      descElement.textContent = langManager.getLocalizedText(item.description);
      descElement.style.cssText = `
        font-size: ${(globalStyle.textSize || 24) - 8}px;
        color: ${item.style?.descriptionColor || '#AAAAAA'};
        font-family: ${globalStyle.fontFamily || 'Arial, sans-serif'};
      `;
      itemElement.appendChild(descElement);
    }

    return itemElement;
  }

  private createCreditsFooter(container: HTMLElement, langManager: LanguageManager): void {
    const footerElement = document.createElement('div');
    footerElement.classList.add('credits-footer');

    const backButton = document.createElement('button');
    backButton.classList.add('back-button');
    backButton.textContent = `← ${langManager.getText('ui.back', 'Quay lại')}`;

    backButton.addEventListener('click', () => {
      this.cleanupBackgroundElements();
      this.game.showMainMenu();
    });

    footerElement.appendChild(backButton);
    container.appendChild(footerElement);
  }

  private getDefaultCreditsSections(langManager: LanguageManager): CreditSection[] {
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
            name: 'Visual Novel Team',
            description: 'Yuki',
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
