import type { GameSettings } from "../../src";

export const settings: GameSettings = {
    width: 'calc(100vw)',
    height: 'calc(100vh)',
    mainMenu: {
        background: 'https://i.pinimg.com/1200x/3d/c2/19/3dc21940c02b371b8554fe011a3d21b0.jpg',
        // backgroundVideo: 'anime.mp4',
        backgroundOverlay: 'rgba(0,0,0,0.3)',
        title: {
            text: 'Yukinovel',
            color: '#ffffff',
            fontSize: 72,
            fontFamily: 'Arial, sans-serif',
            shadow: true,
            // gradient: 'linear-gradient(45deg, #b4ffb4ff, #c5ff8eff)',
            // animation: 'glow'
        },
        subtitle: {
            show: true,
            text: '- Visual Novel in website -',
            color: '#E0E0E0',
            fontSize: 18,
        },
        buttons: {
            style: 'minimal',
            color: 'rgb(214, 255, 214)',
            hoverColor: 'rgba(214, 255, 214, 0)',
            textColor: '#ffffff',
            fontSize: 16,
            borderRadius: 12,
            spacing: 12,
            width: 250,
            animation: 'bounce'
        },
        layout: {
            alignment: 'left',
            titlePosition: 'center',
            buttonsPosition: 'center',
            padding: 80
        }
    }
}

