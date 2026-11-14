// Manchot : bleu nuit au ventre blanc, bec et pattes orange, écharpe rouge. Au clic il bat des ailes en sautant.
import { COMMUN, IDLE, WALK, JOIE, DEUX, mix, balance, respire, regarde, bat, pendouille, pedale, joie, paire } from './_style.mjs';

const A = paire('aile', { parent: 'corps', pivot: [3.1, 6.2, 0] }, { from: [3, 2.2, -1.5], to: [3.9, 6.4, 1.7], rot: [0, 0, 8], pivot: [3.1, 6.2, 0], faces: { all: 'n', west: 'w' } });
const J = paire('jambe', { parent: 'root', pivot: [1.6, 1.2, -0.4] }, { from: [0.6, 0, -3.3], to: [2.6, 1, 0.5], faces: { all: 'o', up: ['oOoO', 'oooo', 'oooo', 'oooo'] } });
const plastron = ['nnnnnnnn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nnwwwwnn'];

export default {
    name: 'manchot',
    title: 'Manchot',
    palette: { ...COMMUN, n: '#3b4a6e', w: '#f6f3ec', o: '#f7a53a', O: '#d98420', r: '#e2483f', R: '#f38a7c' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.2, 0] }, ventre: { parent: 'corps', pivot: [0, 1, 0] }, tete: { parent: 'corps', pivot: [0, 6.6, 0] }, echarpe: { parent: 'corps', pivot: [1.9, 5.8, -3.5] }, ...A.bones, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-3, 1, -2.6], to: [3, 6.6, 2.8], faces: { all: 'n', north: plastron, down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-3.3, 6, -3.2], to: [3.3, 11.6, 3.2], faces: { all: 'n', north: ['nnnnnnnn', 'nwwnnwwn', 'wkwwwwkw', 'wkwwwwkw', 'bbwwwwbb', 'wwwwwwww', 'nwwwwwwn', 'nnnnnnnn'] } },
        { name: 'bec', bone: 'tete', from: [-1, 7.2, -4.6], to: [1, 8.4, -3.2], faces: { all: 'o', down: 'O' } },
        { name: 'echarpe', bone: 'corps', bord: false, from: [-3.5, 5.6, -3.4], to: [3.5, 6.9, 3.4], faces: { all: ['rrRRrrRR', 'rrRRrrRR'], up: 'r', down: 'r' } },
        { name: 'pan', bone: 'echarpe', bord: false, from: [1.2, 3, -3.9], to: [2.6, 5.8, -3.3], faces: { all: ['rrrr', 'RRRR', 'rrrr', 'RRRR'] } },
        ...A.cubes, ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.035), regarde(), bat('aileD', 'aileG', 7, IDLE, 3), pendouille(DEUX, 9), balance('echarpe', [0, 0, 6], IDLE, { tours: 2 })) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 26), balance('corps', [0, 0, 6], WALK), bat('aileD', 'aileG', 10, WALK, 1, 22), balance('echarpe', [12, 0, 0], WALK)) },
        interact: { length: JOIE, loop: false, bones: mix(joie('root', 2.5, 7), bat('aileD', 'aileG', 22, JOIE, 5, 45)) },
    },
};
