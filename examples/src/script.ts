import type { GameScript } from "yukinovel";
import { settings } from "./settings";

export const script: GameScript = {
    title: 'Example for Yukinovel',
    author: 'Yukiookii',
    characters: {
        'Rin': {
            name: 'Rin',
            color: '#E91E63',
        },
        'Player': {
            name: 'Player',
        },
        'anony': {
            name: 'Người Lạ',
        }
    },
    localization: {
        // ui: languages.ui,
        system: {
            'narrator.name': {
                vi: 'Người kể chuyện',
                en: 'Narrator',
                ja: 'ナレーター',
                fr: 'Narrateur'
            }
        }
    },
    settings,
    scenes: [
        {
            id: 'opening',
            background: 'https://i.pinimg.com/736x/57/c6/db/57c6db0e8e9d36d14a83ae8e7585c1f3.jpg',
            characters: [
                {
                    name: 'Player',
                    color: '#4A90E2',
                },
                {
                    name: 'Rin',
                    position: {
                        x: 'calc(50% - 120px)',
                        scale: 1.6
                    }
                }
            ],

            dialogue: [
                {
                    character: 'Player',
                    text: 'Đây là đâu vậy??'
                },
                {
                    character: 'anony',
                    text: 'Chào bạn.'
                },
                {
                    character: 'Player',
                    text: '...'
                },
                {
                    character: 'Rin',
                    text: 'Thật đột ngột.',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    },
                    fadeAnimation: {
                        enabled: true,
                        characterFade: {
                            'Rin': {
                                enabled: true,
                                animation: 'fadeIn',
                                duration: 350,
                            }
                        }
                    }
                },
                {
                    character: 'Rin',
                    text: 'Tên tôi là Rin, rất vui được gặp bạn.',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Player',
                    text: '...',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Player',
                    text: 'Nơi đây là đâu?',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Rin',
                    text: 'Nơi đây là Yukinovel, một framework giúp bạn làm Visual Novel game dễ dàng và tuỳ thích.',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Player',
                    text: 'Hãy chứng minh điều đó.',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Rin',
                    text: '...',
                    characterSprite: {
                        'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Rin',
                    text: 'Thôi được rồi.',
                    fadeAnimation: {
                        enabled: true,
                        backgroundFade: true,
                        characterFade: true,
                        duration: 600
                    },
                    action: 'jump',
                    target: 'huong-dan',
                },
            ],
        },
        {
            id: 'huong-dan',
            background: 'https://i.pinimg.com/originals/1b/fd/e5/1bfde57ed7fd62b1569f42dc99515790.gif',
            characters: [
                {
                    name: 'Player',
                    color: '#4A90E2',
                },
                {
                    name: 'Rin',
                    position: {
                        x: 'calc(50% - 120px)',
                        scale: 1.6
                    },
                    image: './src/assets/Rin.png',
                }
            ],
            dialogue: [
                {
                    character: 'Rin',
                    text: 'À..',
                    characterSprite: {
                        // 'Rin': './src/assets/Rin.png'
                    }
                },
                {
                    character: 'Rin',
                    text: 'Thực ra thì tôi cũng không biết nên giới thiệu điều gì cả (chưa có designer, nhân lực, ...)'
                },
                {
                    character: 'Rin',
                    text: 'Nói đơn giản thì bạn có thể custom thoải mái cho game của mình từ giao diện đến logic',
                },
                {
                    character: 'Rin',
                    text: 'Ví dụ như <strong>nút</strong> <span class="fas fa-arrow-left" style="background: #333; color: white; padding: 5px 8px; border-radius: 3px; margin: 0 5px;"></span> này',
                },
                {
                    character: 'Rin',
                    text: 'Đơn giản vậy thôi, hoặc bạn có thể truy cập vào <a style="color: yellow" href="https://github.com/MegumiKatou02/Yukinovel/issues">đây</a> để đóng góp về game.',
                },
                {
                    character: 'Rin',
                    text: 'Tạm biệt bạn!!',
                },
                {
                    character: 'Player',
                    text: 'Tạm biệt!',
                },
            ]
        }
    ]
}