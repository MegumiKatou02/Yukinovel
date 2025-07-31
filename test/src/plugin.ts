import { PluginBase, type PluginHooks, type PluginMetadata } from "../../src";

let test: number = 0;

export class CustomPlugin extends PluginBase {
    metadata: PluginMetadata = {
        name: 'custom',
        version: '1.0.0',
        description: 'A custom plugin',
        author: 'Yukiookii',
        priority: 100,        
    }

    hooks: PluginHooks = {
        onChoiceSelected: async (context) => {
            console.log('Choice selected:'.toUpperCase(), context.choice);
            if (context.choice?.text === 'Đi đến khu rừng bí ẩn') {
                console.log('action emit test1')
                console.log('Current test value before emit:', test);
                const newTestValue = test + 1;
                await context.game.emitCustomEvent('test1', { test: newTestValue });
            }
        },
        onWillSave: async (context) => {
            console.log('Will save:'.toUpperCase(), context.slot, context.state);
        },
        onSaved: async (context) => {
            console.log('Saved:'.toUpperCase(), context.slot);
        },
        onWillLoad: async (context) => {
            console.log('Will load:'.toUpperCase(), context.slot);
        },
        onLoaded: async (context) => {
            console.log('Loaded:'.toUpperCase(), context.slot);
        },
        onDialogueDisplayed: async (_context) => {
            console.log(test);
        },
        onCustomEvent: async (context) => {
            if (context.eventName === 'test1') {
                console.log('Received test1 event with data:', context.test);
                console.log('Current test value before update:', test);
                if (context && typeof context.test === 'number') {
                    test = context.test;
                    console.log('Test value after update:', test);
                } else {
                    console.warn('Invalid or missing test data in test1 event');
                }
            }
        }
    }
}
