import { Game, createGame} from '../../dist/index.js'

const btn = document.getElementById("btn") as HTMLButtonElement;

btn.addEventListener("click", () => {
  alert("Xin chào từ TypeScript!");
});

const game = new Game({
  title: 'Test Game',
    author: 'Yukiookii',
    version: '1.0.0',
    characters: {
        'hero': {
            name: 'Tuyet',
        }
    },
    scenes: [
        {
            id: 'scene1',
            dialogue: [{
                character: 'hero',
                text: 'Hello, world!',
                choices: [
                    {
                        text: 'Choice 1',
                        action: 'jump',
                        target: 'scene2'
                    },
                    {
                        text: 'Choice 2',
                        action: 'jump',
                        target: 'scene3'
                    }
                    
                ]
            }]
        }
    ]   
});
