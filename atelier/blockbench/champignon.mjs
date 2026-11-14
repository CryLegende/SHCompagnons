// Champignon : pied crème au visage rond, grand chapeau rouge à pois blancs, deux petits pieds. Au clic son chapeau s'écrase et rebondit.
import { COMMUN, IDLE, WALK, DEUX, visage, mix, balance, tient, regarde, pendouille, pedale, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.2, 1.6, 0] }, { from: [0.5, 0, -1], to: [2, 1.6, 0.9], faces: { all: 'C' } });

export default {
    name: 'champignon',
    title: 'Champignon',
    palette: { ...COMMUN, c: '#f7ecd9', C: '#e2d2b8', r: '#e2483f', w: '#fffaf2' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.4, 0] }, chapeau: { parent: 'corps', pivot: [0, 5.6, 0] }, ...J.bones },
    cubes: [
        { name: 'pied', bone: 'corps', from: [-2.2, 1.4, -2.2], to: [2.2, 6, 2.2], faces: { all: 'c', north: visage('c', { ligne: 2 }) } },
        { name: 'chapeau', bone: 'chapeau', from: [-4.2, 5.6, -4.2], to: [4.2, 8.5, 4.2], faces: { all: ['rrrrrrrr', 'rwwrrrrr', 'rwwrrwwr', 'rrrrrwwr'], up: 'r', down: 'c' } },
        { name: 'dome', bone: 'chapeau', from: [-3, 8.5, -3], to: [3, 10, 3], faces: { all: ['rrrwwrrr', 'rrrrrrrr'], up: ['rrrrrrrr', 'rwwrrrrr', 'rwwrrrrr', 'rrrrrwwr', 'rrrrrwwr', 'rrwwrrrr', 'rrwwrrrr', 'rrrrrrrr'] } },
        ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 9, 3), pendouille(DEUX, 10), { chapeau: { scale: [[0, [1, 1, 1]], [1.5, [1.03, 0.94, 1.03]], [3, [1, 1, 1]], [4.5, [1.03, 0.94, 1.03]], [6, [1, 1, 1]]] } }) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-6, 0, 0]), balance('chapeau', [0, 0, 5], WALK)) },
        interact: { length: 1.3, loop: false, bones: { chapeau: { scale: [[0, [1, 1, 1]], [0.2, [1.25, 0.5, 1.25]], [0.5, [1.25, 0.5, 1.25]], [0.7, [0.85, 1.3, 0.85]], [0.9, [1.06, 0.92, 1.06]], [1.1, [1, 1, 1]]] }, corps: { scale: [[0, [1, 1, 1]], [0.2, [1.08, 0.86, 1.08]], [0.5, [1.08, 0.86, 1.08]], [0.7, [0.96, 1.08, 0.96]], [0.9, [1, 1, 1]]] } } },
    },
};
