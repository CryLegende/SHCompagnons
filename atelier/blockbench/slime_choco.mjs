// Slime en chocolat : un dessert sur pattes. Chantilly, cerise, et une gaufrette plantée de travers.
import { slime } from './_slime.mjs';
import { peau, TETES } from './_officiel.mjs';

export default slime({
    name: 'slime_choco', title: 'Slime en chocolat', verre: 'brown_stained_glass', tete: (await peau(TETES.slime_choco)).tete, teinte: '#7a4a2ec0',
    palette: { w: '#fff6ea', r: '#e2364a', g: { c: '#4b9a2f' }, t: '#e8c07a', T: { c: '#c9964a' } },
    plus: {
        bones: { gaufrette: { parent: 'dessus', pivot: [2, 8.6, 0.5], rot: [0, 0, -22] } },
        cubes: [
            { name: 'chantilly', bone: 'dessus', from: [-1.7, 8.6, -1.7], to: [1.7, 9.6, 1.7], faces: { all: 'w' } },
            { name: 'cerise', bone: 'dessus', from: [-0.9, 9.6, -1.1], to: [0.5, 10.9, 0.3], faces: { all: 'r', up: ['rrrr', 'rgrr', 'rrrr', 'rrrr'] } },
            { name: 'gaufrette', bone: 'gaufrette', bord: false, from: [1.1, 8.2, 0.2], to: [3, 12.4, 0.8], faces: { all: 't', north: ['tTtT', 'TtTt', 'tTtT', 'TtTt', 'tTtT', 'TtTt', 'tTtT', 'TtTt'], south: ['tTtT', 'TtTt', 'tTtT', 'TtTt', 'tTtT', 'TtTt', 'tTtT', 'TtTt'] } },
        ],
    },
});
