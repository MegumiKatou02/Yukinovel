import { script } from './script';
// import { CustomPlugin } from './plugin.js';
import { AnalyticsPlugin } from 'yukinovel/plugins';
// import { AnalyticsPlugin } from '@megumikatou02/yukinovel/plugins';
// import { createGame } from '@megumikatou02/yukinovel';
import { createGame } from 'yukinovel';


const game = createGame(script);

game.on('dialogue', (_event) => {
    // console.log('Dialogue:', event.data.dialogue);
});

game.on('scene', (event) => {
    console.log('Scene changed to:', event.data.scene.id);
});

game.on('save', (_event) => {
    console.log('Game đã được lưu');
});

game.on('load', (_event) => {
    console.log('Game đã được tải');
});

game.on('end', (_event) => {
    console.log('Game ended');
});

/**
 * Plugin
 */

game.registerPlugin(new AnalyticsPlugin());


game.mount('#game-container');