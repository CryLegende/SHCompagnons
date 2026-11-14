// Panda : peluche blanche aux bras, jambes, oreilles et yeux noirs, une tige de bambou à la main. Au clic il la grignote.
import { peluche } from './_peluche.mjs';

const tache = ['wwwwwwww', 'wdewwedw', 'wddwwddw', 'bbwwwwbb', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'];

export default peluche({
    name: 'panda',
    title: 'Panda',
    palette: { w: '#f8f5ee', d: '#40394a', e: { c: '#ffffff' }, n: { c: '#2b1b12' }, m: { c: '#bdb4aa' }, g: '#7cc54a', G: '#4f9a31', p: '#6a6270' },
    lettres: { corps: 'w', bras: 'd', oreille: 'd', museau: 'w' },
    dessins: {
        ventre: ['dddddddd', 'dddddddd', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        flanc: ['dddddddd', 'dddddddd', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        visage: tache,
        museau: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwmwwmww', 'wwwmmwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        coussinet: ['dddd', 'dppd', 'dppd', 'dddd'],
        creux: 'd',
    },
    plus: { bones: {}, cubes: [{ name: 'bambou', bone: 'brasD', bord: false, from: [3.2, 2.2, -2.9], to: [4.1, 10.2, -2], rot: [0, 0, -8], pivot: [3.6, 4, -2.4], faces: { all: ['gg', 'gg', 'GG', 'gg', 'gg', 'GG', 'gg', 'gg'], up: 'G' } }] },
    interact: {
        length: 1.8, loop: false,
        bones: {
            brasD: { rotation: [[0, [0, 0, 0]], [0.3, [-38, 0, -26]], [0.5, [-30, 0, -26]], [0.7, [-38, 0, -26]], [0.9, [-30, 0, -26]], [1.1, [-38, 0, -26]], [1.3, [-30, 0, -26]], [1.7, [0, 0, 0]]] },
            tete: { rotation: [[0, [0, 0, 0]], [0.3, [-6, -10, 0]], [0.5, [-2, -10, 0]], [0.7, [-6, -10, 0]], [0.9, [-2, -10, 0]], [1.1, [-6, -10, 0]], [1.3, [-2, -10, 0]], [1.7, [0, 0, 0]]] },
        },
    },
});
