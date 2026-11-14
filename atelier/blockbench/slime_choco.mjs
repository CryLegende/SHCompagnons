// Slime en chocolat : une noisette de chantilly et une cerise sur le dessus.
import { slime } from './_slime.mjs';

export default slime({
    name: 'slime_choco', title: 'Slime en chocolat', verre: 'brown_stained_glass', coeur: '#8a5a3c', teinte: '#7a4a2ec0',
    palette: { w: '#fff6ea', r: '#e2364a', g: { c: '#4b9a2f' } },
    plus: {
        bones: {},
        cubes: [
            { name: 'chantilly', bone: 'corps', from: [-1.7, 8.6, -1.7], to: [1.7, 9.6, 1.7], faces: { all: 'w' } },
            { name: 'cerise', bone: 'corps', from: [-0.7, 9.6, -0.7], to: [0.7, 10.9, 0.7], faces: { all: 'r', up: ['rrrr', 'rgrr', 'rrrr', 'rrrr'] } },
        ],
    },
});
