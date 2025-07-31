import type { GameScript } from "yukinovel";
import { languages } from "./lang";
import { settings } from "./settings";

export const script: GameScript = {
    title: 'ATRI',
    author: 'Yukiookii',
    version: '1.0.0',
    languages: languages.languages,
    localization: {
        ui: languages.ui,
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
    characters: {
        'hero': {
            name: 'Linh',
            color: '#4A90E2',
            image: 'he.jpg',
        },
        'wizard': {
            name: 'Pháp sư Minh',
            color: '#9B59B6'
        },
        'princess': {
            name: 'Công chúa Hoa',
            color: '#E91E63'
        },
        'dragon': {
            name: 'Rồng Lửa',
            color: '#E74C3C'
        },
        'narrator': {
            name: '',
            color: '#7F8C8D'
        }
    },
    scenes: [
        {
            id: 'opening',
            background: 'peak.jpg',
            // backgroundVideo: '../anime.mp4',
            // backgroundVideo: 'opening-video.mp4', // Ví dụ video background
            // backgroundType: 'auto', // Tự động phát hiện loại file
            // music: 'audio.mp3',
            characters: [
                {
                    name: 'Linh',
                    color: '#4A90E2',
                    // image: 'he.jpg',
                    position: {
                        x: 100,
                        y: 0,
                        width: 300,
                        height: 400,
                        scale: 1.0
                    }
                },
                {
                    name: 'Rồng Lửa',
                    image: null,
                    color: '#24def7ff',
                    position: {
                        x: 'calc(50%)',
                        y: 0,
                    }
                }
            ],
            dialogue: [
                {
                    character: 'narrator',
                    text: {
                        vi: 'Trong một vương quốc xa xôi, nơi có những ngọn núi cao chót vót và những khu rừng bí ẩn...',
                        en: 'he he he'
                    },
                    characterSprite: {
                        'Linh': 'he.jpg',
                    },
                    fadeAnimation: {
                        enabled: true,
                        characterFade: {
                            'Linh': {
                                enabled: true,
                                animation: 'fadeIn',
                                duration: 350
                            },
                                
                        }
                    }
                },
                {
                    character: 'narrator',
                    text: 'Chào mừng đến với <strong>Visual Novel</strong>! Bạn có thể sử dụng các icon như <i class="fas fa-arrow-left"></i> để quay lại, <i class="fas fa-save"></i> để lưu game, hoặc <i class="fas fa-heart" style="color: red;"></i> để thể hiện tình cảm.',
                    fadeAnimation: {
                        enabled: true,
                        characterFade: {
                            'Linh': {
                                enabled: true,
                                animation: 'fadeOut',
                                duration: 1000
                            },
                        }
                    }
                },
                {
                    character: 'narrator',
                    text: 'Nút <span class="fas fa-arrow-left" style="background: #333; color: white; padding: 5px 8px; border-radius: 3px; margin: 0 5px;"></span> là nút quay lại, nhấn vào để trở về trạng thái trước đó của game.',
                },
                {
                    character: 'narrator',
                    text: 'Một cô gái trẻ tên Linh đang bắt đầu cuộc hành trình tìm kiếm viên ngọc huyền thoại.',
                    characterSprite: {
                        'Linh': 'he.jpg',
                        'Rồng Lửa': 'he2.jpg'
                    }
                },
                {
                    character: 'hero',
                    text: 'Cuối cùng tôi cũng đến được đây! Theo truyền thuyết, viên ngọc sẽ ở một trong những nơi này.'
                },
                {
                    character: 'hero',
                    text: 'Hệ thống điều khiển: <br/><span style="background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; margin: 2px;"><i class="fas fa-mouse"></i> Click</span> hoặc <span style="background: #2196F3; color: white; padding: 3px 8px; border-radius: 3px; margin: 2px;"><i class="fas fa-keyboard"></i> Space/Enter</span> để tiếp tục<br/>Sử dụng <span style="background: #FF9800; color: white; padding: 3px 8px; border-radius: 3px; margin: 2px;"><i class="fas fa-save"></i> S</span> để lưu và <span style="background: #9C27B0; color: white; padding: 3px 8px; border-radius: 3px; margin: 2px;"><i class="fas fa-folder-open"></i> L</span> để load game.'
                },
                {
                    character: 'hero',
                    text: 'Nhưng tôi nên bắt đầu từ đâu đây?',
                    choices: [
                        {
                            text: 'Đi đến khu rừng bí ẩn',
                            action: 'jump',
                            target: 'forest'
                        },
                        {
                            text: 'Tìm kiếm pháp sư trong thành phố',
                            action: 'jump',
                            target: 'city'
                        },
                        {
                            text: 'Khám phá hang động trên núi',
                            action: 'jump',
                            target: 'cave'
                        },
                        {
                            text: '[Demo] Xem video background',
                            action: 'jump',
                            target: 'video_demo'
                        },
                        {
                            text: '[Demo] Xem GIF background',
                            action: 'jump',
                            target: 'gif_demo'
                        },
                        {
                            text: '[Demo] Xem Fade Animation',
                            action: 'jump',
                            target: 'fade_demo'
                        }
                    ],
                    fadeAnimation: {
                        enabled: true,
                        backgroundFade: true,
                        characterFade: true,
                        duration: 600
                    }
                }
            ]
        },
        {
            id: 'forest',
            background: 'he.jpg',
            // background: 'forest-animated.gif',
            // backgroundType: 'gif',
            music: 'forest.mp3',
            characters: [
                {
                    name: 'Linh',
                    // image: 'he.jpg',
                    color: '#4A90E2',
                    position: {
                        x: 50,
                        y: 0,
                        width: 280,
                        height: 380,
                        scale: 0.9
                    }
                },
                {
                    name: 'Rồng Lửa',
                    // image: 'he2.jpg',
                    color: '#E74C3C',
                    position: {
                        x: 600,
                        y: 0,
                        width: 350,
                        height: 450,
                        scale: 1.2
                    }
                }
            ],
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Linh bước vào khu rừng rậm rạp. Ánh sáng mặt trời lọt qua tán lá tạo nên những đốm sáng lung linh.',
                    fadeAnimation: {
                        enabled: true,
                        // backgroundFade: true,
                        characterFade: true,
                        duration: 300
                    },
                    characterSprite: {
                        'Linh': 'he.jpg',
                        'Rồng Lửa': 'he2.jpg'
                    }
                },
                {
                    character: 'hero',
                    text: 'Khu rừng này thật yên tĩnh... có vẻ như có điều gì đó đang theo dõi tôi.',
                    sprite: 'he2.jpg', // Thay đổi sprite của character đang nói (hero)
                    characterSprite: {
                        'Rồng Lửa': null // Thay đổi sprite của Rồng Lửa thành he2.jpg
                    }
                },
                {
                    character: 'narrator',
                    text: 'Đột nhiên, một con rồng lửa xuất hiện từ sau những tán cây!'
                    // Không có sprite nào được chỉ định, tất cả characters sẽ khôi phục sprite gốc
                },
                {
                    character: 'dragon',
                    text: 'Grrrr! Ai dám xâm phạm lãnh thổ của ta?!',
                    characterSprite: {
                        'Linh': 'he2.jpg', // Thay đổi sprite của Linh thành he2.jpg
                        'Rồng Lửa': 'he.jpg' // Thay đổi sprite của Rồng Lửa thành he.jpg
                    }
                },
                {
                    character: 'hero',
                    text: 'Một con rồng! Tôi phải làm gì đây?',
                    // Không có sprite nào được chỉ định, tất cả sẽ khôi phục sprite gốc
                    choices: [
                        {
                            text: 'Chiến đấu với rồng',
                            action: 'jump',
                            target: 'fight_dragon'
                        },
                        {
                            text: 'Cố gắng đối thoại',
                            action: 'jump',
                            target: 'talk_dragon'
                        },
                        {
                            text: 'Chạy trốn',
                            action: 'jump',
                            target: 'escape_forest'
                        }
                    ]
                }
            ]
        },
        {
            id: 'city',
            background: 'peak.jpg',
            characters: [
                {
                    name: 'Linh',
                    image: 'he.jpg',
                    color: '#4A90E2'
                },
                {
                    name: 'Pháp sư Minh',
                    color: '#9B59B6'
                }
            ],
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Linh đi vào thành phố cổ kính. Những ngôi nhà đá xếp chồng lên nhau, tạo nên một khung cảnh huyền bí.'
                },
                {
                    character: 'hero',
                    text: 'Tôi cần tìm pháp sư. Có lẽ ông ấy sẽ biết về viên ngọc huyền thoại.'
                },
                {
                    character: 'narrator',
                    text: 'Sau khi hỏi thăm, Linh tìm thấy tháp của pháp sư ở trung tâm thành phố.'
                },
                {
                    character: 'wizard',
                    text: 'Chào mừng, cô gái trẻ. Ta đã chờ đợi cô từ lâu rồi.'
                },
                {
                    character: 'hero',
                    text: 'Ông đã chờ đợi tôi? Nhưng tôi chưa bao giờ gặp ông!'
                },
                {
                    character: 'wizard',
                    text: 'Ta thấy được tương lai, cô bé. Cô đang tìm kiếm viên ngọc huyền thoại, đúng không?'
                },
                {
                    character: 'hero',
                    text: 'Đúng vậy! Ông có thể giúp tôi không?'
                },
                {
                    character: 'wizard',
                    text: 'Viên ngọc đó rất nguy hiểm. Nhưng nếu cô quyết tâm, ta sẽ cho cô một lời khuyên.',
                    choices: [
                        {
                            text: 'Xin hãy cho tôi lời khuyên',
                            action: 'jump',
                            target: 'wizard_advice'
                        },
                        {
                            text: 'Tôi muốn biết về sức mạnh của viên ngọc',
                            action: 'jump',
                            target: 'gem_power'
                        },
                        {
                            text: 'Tôi có thể tự tìm được, cảm ơn ông',
                            action: 'jump',
                            target: 'reject_help'
                        }
                    ]
                }
            ]
        },
        {
            id: 'cave',
            background: 'peak.jpg',
            characters: [
                {
                    name: 'Linh',
                    image: 'he.jpg',
                    color: '#4A90E2'
                },
                {
                    name: 'Công chúa Hoa',
                    color: '#E91E63'
                }
            ],
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Linh leo lên ngọn núi cao và tìm thấy một hang động tối tăm.',
                    characterSprite: {
                        'Linh': 'he2.jpg',

                    }
                },
                {
                    character: 'hero',
                    text: 'Hang động này có vẻ rất sâu. Tôi có thể nghe thấy tiếng gió thổi từ bên trong.',
                },
                {
                    character: 'narrator',
                    text: 'Khi bước vào hang, Linh nghe thấy tiếng khóc từ phía sâu bên trong.'
                },
                {
                    character: 'princess',
                    text: 'Xin hãy cứu tôi! Tôi đã bị nhốt ở đây từ rất lâu rồi!',
                    characterSprite: {
                        'princess': 'he.jpg'
                    }
                },
                {
                    character: 'hero',
                    text: 'Một công chúa? Tại sao cô lại ở đây?'
                },
                {
                    character: 'princess',
                    text: 'Tôi đã bị rồng lửa bắt cóc. Nó muốn tôi bảo vệ viên ngọc huyền thoại.'
                },
                {
                    character: 'hero',
                    text: 'Viên ngọc huyền thoại? Vậy nó ở đâu?'
                },
                {
                    character: 'princess',
                    text: 'Nó ở ngay đây, nhưng có một lời nguyền bảo vệ nó. Chỉ có trái tim trong sạch mới có thể chạm vào.',
                    choices: [
                        {
                            text: 'Cứu công chúa trước',
                            action: 'jump',
                            target: 'save_princess'
                        },
                        {
                            text: 'Thử lấy viên ngọc',
                            action: 'jump',
                            target: 'take_gem'
                        },
                        {
                            text: 'Hỏi thêm về lời nguyền',
                            action: 'jump',
                            target: 'ask_curse'
                        }
                    ]
                }
            ]
        },
        {
            id: 'fight_dragon',
            background: 'peak.jpg',
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Linh rút kiếm và chuẩn bị chiến đấu với con rồng lửa khổng lồ.'
                },
                {
                    character: 'dragon',
                    text: 'Ngươi dám thách thức ta? Hãy nếm thử sức mạnh của lửa địa ngục!'
                },
                {
                    character: 'hero',
                    text: 'Tôi không sợ! Vì viên ngọc huyền thoại, tôi sẽ chiến đấu!'
                },
                {
                    character: 'narrator',
                    text: 'Sau một trận chiến ác liệt, Linh đã chiến thắng con rồng bằng lòng dũng cảm và kỹ năng.'
                },
                {
                    character: 'dragon',
                    text: 'Ngươi... ngươi đã thắng. Ta thừa nhận sức mạnh của ngươi.'
                },
                {
                    character: 'dragon',
                    text: 'Viên ngọc huyền thoại không ở đây, nhưng ta sẽ chỉ cho ngươi đường đi.',
                    action: 'jump',
                    target: 'dragon_help'
                }
            ]
        },
        {
            id: 'talk_dragon',
            background: 'peak.jpg',
            dialogue: [
                {
                    character: 'hero',
                    text: 'Xin chào! Tôi không có ý định xâm phạm lãnh thổ của ngài.'
                },
                {
                    character: 'dragon',
                    text: 'Hmm? Ngươi không sợ ta sao?'
                },
                {
                    character: 'hero',
                    text: 'Tôi đang tìm kiếm viên ngọc huyền thoại. Có lẽ chúng ta có thể giúp đỡ nhau?'
                },
                {
                    character: 'dragon',
                    text: 'Thú vị... Đã lâu rồi ta không gặp ai dám nói chuyện với ta như vậy.'
                },
                {
                    character: 'dragon',
                    text: 'Được rồi, ta sẽ giúp ngươi. Nhưng ngươi phải chứng minh mình xứng đáng.',
                    choices: [
                        {
                            text: 'Tôi sẵn sàng chứng minh',
                            action: 'jump',
                            target: 'dragon_test'
                        },
                        {
                            text: 'Tôi cần biết thêm về viên ngọc',
                            action: 'jump',
                            target: 'dragon_info'
                        }
                    ]
                }
            ]
        },
        {
            id: 'wizard_advice',
            background: 'peak.jpg',
            dialogue: [
                {
                    character: 'wizard',
                    text: 'Viên ngọc huyền thoại có sức mạnh to lớn, nhưng nó cũng rất nguy hiểm.'
                },
                {
                    character: 'wizard',
                    text: 'Nó được bảo vệ bởi ba thử thách: Lòng dũng cảm, Trí tuệ, và Lòng nhân ái.'
                },
                {
                    character: 'hero',
                    text: 'Ba thử thách? Tôi phải làm gì?'
                },
                {
                    character: 'wizard',
                    text: 'Hãy đi đến hang động trên núi. Ở đó, cô sẽ tìm thấy những gì mình cần.'
                },
                {
                    character: 'wizard',
                    text: 'Nhưng hãy nhớ: Sức mạnh thực sự không nằm ở viên ngọc, mà ở trong trái tim cô.',
                    action: 'jump',
                    target: 'cave'
                }
            ]
        },
        {
            id: 'save_princess',
            background: 'peak.jpg',
            dialogue: [
                {
                    character: 'hero',
                    text: 'Trước tiên, tôi phải cứu cô ra khỏi đây!'
                },
                {
                    character: 'princess',
                    text: 'Cảm ơn bạn! Nhưng hãy cẩn thận, lời nguyền rất mạnh.'
                },
                {
                    character: 'narrator',
                    text: 'Linh giải thoát công chúa khỏi xiềng xích. Đột nhiên, viên ngọc bắt đầu phát sáng.'
                },
                {
                    character: 'princess',
                    text: 'Nhìn kìa! Viên ngọc đang phản ứng với lòng nhân ái của bạn!'
                },
                {
                    character: 'hero',
                    text: 'Có lẽ... đây chính là thử thách cuối cùng.'
                },
                {
                    character: 'narrator',
                    text: 'Viên ngọc từ từ bay đến tay Linh, không còn lời nguyền nào cản trở.',
                    action: 'jump',
                    target: 'good_ending'
                }
            ]
        },
        {
            id: 'good_ending',
            background: 'peak.jpg',
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Linh đã tìm thấy viên ngọc huyền thoại, không phải bằng sức mạnh hay trí tuệ...'
                },
                {
                    character: 'narrator',
                    text: 'Mà bằng lòng nhân ái và sự quan tâm đến người khác.'
                },
                {
                    character: 'princess',
                    text: 'Cảm ơn bạn đã cứu tôi. Bạn thật sự xứng đáng có được viên ngọc này.'
                },
                {
                    character: 'hero',
                    text: 'Tôi đã hiểu ra rằng, sức mạnh thực sự không nằm ở những báu vật.'
                },
                {
                    character: 'hero',
                    text: 'Mà nằm ở khả năng giúp đỡ và bảo vệ những người khác.'
                },
                {
                    character: 'narrator',
                    text: 'Và từ đó, Linh trở thành một nữ hiệp sĩ nổi tiếng, bảo vệ hòa bình cho vương quốc.'
                },
                {
                    character: 'narrator',
                    text: 'Cảm ơn bạn đã chơi "Cuộc Phiêu Lưu Kỳ Diệu"!',
                    choices: [
                        {
                            text: 'Chơi lại từ đầu',
                            action: 'jump',
                            target: 'opening'
                        },
                        {
                            text: 'Lưu game',
                            action: 'end'
                        }
                    ]
                }
            ]
        },
        {
            id: 'dragon_test',
            background: 'peak.jpg',
            dialogue: [
                {
                    character: 'dragon',
                    text: 'Thử thách của ta rất đơn giản: Hãy cho ta thấy ngươi có trái tim nhân ái.'
                },
                {
                    character: 'hero',
                    text: 'Trái tim nhân ái? Tôi không hiểu...'
                },
                {
                    character: 'dragon',
                    text: 'Ta đã bắt cóc một công chúa và nhốt nàng trong hang động. Ngươi sẽ làm gì?'
                },
                {
                    character: 'hero',
                    text: 'Tôi phải cứu cô ấy! Dù có nguy hiểm đến đâu!',
                    choices: [
                        {
                            text: 'Đi cứu công chúa ngay lập tức',
                            action: 'jump',
                            target: 'cave'
                        },
                        {
                            text: 'Hỏi rồng về vị trí hang động',
                            action: 'jump',
                            target: 'dragon_direction'
                        }
                    ]
                }
            ]
        },
        {
            id: 'video_demo',
            backgroundVideo: 'demo-video.mp4', // Video background
            backgroundType: 'video',
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Đây là scene demo với video background. Video sẽ tự động phát và lặp lại.'
                },
                {
                    character: 'hero',
                    text: 'Tuyệt vời! Background có thể là video hoặc GIF animated.',
                    choices: [
                        {
                            text: 'Quay lại scene chính',
                            action: 'jump',
                            target: 'opening'
                        }
                    ]
                }
            ]
        },
        {
            id: 'gif_demo',
            background: 'animated-scene.gif',
            backgroundType: 'gif',
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Scene này sử dụng GIF làm background để tạo hiệu ứng chuyển động.'
                },
                {
                    character: 'hero',
                    text: 'GIF rất phù hợp cho những hiệu ứng đơn giản và nhẹ.',
                    choices: [
                        {
                            text: 'Thử scene với video',
                            action: 'jump',
                            target: 'video_demo'
                        },
                        {
                            text: 'Quay lại scene chính',
                            action: 'jump',
                            target: 'opening'
                        }
                    ]
                }
            ]
        },
        {
            id: 'fade_demo',
            background: 'peak.jpg',
            music: 'forest.mp3',
            characters: [
                {
                    name: 'Linh',
                    image: 'he.jpg',
                    color: '#4A90E2',
                    position: {
                        x: 100,
                        y: 0,
                        width: 300,
                        height: 400,
                        scale: 1.0
                    }
                },
                {
                    name: 'Rồng Lửa',
                    image: 'he2.jpg',
                    color: '#E74C3C',
                    position: {
                        x: 'calc(60%)',
                        y: 0,
                        width: 350,
                        height: 450,
                        scale: 1.2
                    }
                }
            ],
            dialogue: [
                {
                    character: 'narrator',
                    text: 'Đây là scene demo với <strong>fade animation</strong> cho background và characters.'
                },
                {
                    character: 'hero',
                    text: 'Khi bạn chuyển scene, background và characters sẽ <em>fade out/in</em> một cách mượt mà.',
                    characterSprite: {
                        'Linh': 'he3.jpg',
                        'Rồng Lửa': 'he.jpg'
                    },
                    fadeAnimation: {
                        enabled: true,
                        characterFade: {
                            'Linh': { 
                                enabled: true,
                                animation: 'fadeInLeft'
                            },
                            'Rồng Lửa': { 
                                enabled: true,
                                animation: 'fadeInRight'
                            }
                        },
                        duration: 800
                    }
                },
                {
                    character: 'hero',
                    text: 'Bạn có thể sử dụng nhiều hiệu ứng khác nhau. <i class="fas fa-magic" style="color: purple;"></i>',
                    characterSprite: {
                        'Linh': 'he2.jpg',
                        'Rồng Lửa': 'he2.jpg'
                    },
                    fadeAnimation: {
                        enabled: true,
                        characterFade: {
                            'Linh': { 
                                enabled: true,
                                animation: 'zoomIn',
                                duration: 500
                            },
                            'Rồng Lửa': { 
                                enabled: true,
                                animation: 'bounceIn',
                                duration: 800
                            }
                        }
                    }
                },
                {
                    character: 'narrator',
                    text: 'Thậm chí có thể kết hợp nhiều hiệu ứng khác nhau!',
                    characterSprite: {
                        'Linh': 'he.jpg',
                        'Rồng Lửa': null
                    },
                    fadeAnimation: {
                        enabled: true,
                        characterFade: {
                            'Linh': { 
                                enabled: true,
                                animation: 'slideInUp',
                                duration: 300
                            },
                            'Rồng Lửa': { 
                                enabled: true,
                                animation: 'zoomOutDown',
                                duration: 1000
                            }
                        }
                    }
                },
                {
                    character: 'narrator',
                    text: 'Animate.css cung cấp rất nhiều hiệu ứng đẹp mắt!',
                    choices: [
                        {
                            text: 'Quay lại scene chính',
                            action: 'jump',
                            target: 'opening'
                        },
                        {
                            text: 'Thử scene khác',
                            action: 'jump',
                            target: 'forest'
                        }
                    ],
                    fadeAnimation: {
                        enabled: true,
                        backgroundFade: {
                            enabled: true,
                            animation: 'fadeOutDown',
                            duration: 700
                        }
                    }
                }
            ]
        }
    ]
}