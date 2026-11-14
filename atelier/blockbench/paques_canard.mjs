// Caneton de Pâques : pas fini d'éclore. Il est resté assis dans le bas de sa coquille peinte, pattes passées à
// travers, l'autre moitié sur la tête. Au clic il se cache dans son œuf, qui se dandine, puis ressort.
import { COMMUN, IDLE, WALK, DEUX, frimousse, mix, balance, tient, regarde, tic, bat, pendouille, pedale, paire } from './_style.mjs';

const A = paire('aile', { parent: 'corps', pivot: [2.9, 6.4, 0.4] }, { from: [2.8, 4.6, -1.2], to: [3.5, 6.8, 2.2], faces: { all: 'Y', west: 'y' } });
const J = paire('jambe', { parent: 'root', pivot: [1.5, 1.6, -0.2] }, { from: [0.6, 0, -2.4], to: [2.4, 0.9, 0.6], faces: { all: 'o', up: ['oOoO', 'oooo', 'oooo', 'oooo'] } });
const peint = ['eeeeeeee', 'eepeeece', 'eeeeeeee', 'ccpppccp', 'eeeeeeee', 'ececeepe', 'eeeeeeee', 'eeeeeeee'];
const cache = (y) => ({ position: [[0, [0, 0, 0]], [0.25, [0, y, 0]], [1.1, [0, y, 0]], [1.3, [0, 0.8, 0]], [1.45, [0, 0, 0]]] });

export default {
    name: 'paques_canard',
    title: 'Caneton',
    palette: { ...COMMUN, y: '#ffdc52', Y: '#f2c531', o: '#f79a2e', O: '#d97f17', e: '#fbf7ee', p: '#f6a9c8', c: '#9bdcec' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.6, 0.4] }, tete: { parent: 'corps', pivot: [0, 5.6, 0] }, coquille: { parent: 'tete', pivot: [0, 10.6, 0.2] }, ...A.bones, ...J.bones },
    cubes: [
        { name: 'oeuf', bone: 'corps', bord: 'bas', from: [-3.4, 1.2, -3.2], to: [3.4, 5.4, 3.6], faces: { all: peint, up: 'y', down: 'e' } },
        { name: 'tete', bone: 'tete', from: [-2.9, 5, -2.9], to: [2.9, 10.6, 2.7], faces: { all: 'y', north: frimousse('y', { ligne: 2 }) } },
        { name: 'bec', bone: 'tete', from: [-1.6, 6.2, -4.6], to: [1.6, 7.3, -2.9], faces: { all: 'o', down: 'O' } },
        { name: 'coquille', bone: 'coquille', bord: 'haut', from: [-2.4, 10.4, -2.3], to: [2.4, 12.4, 2.3], rot: [0, 0, 9], pivot: [0, 10.6, 0.2], faces: { all: ['eeeeeeee', 'eepeeeee', 'eeeeecee', 'eceeeeee'], up: 'e' } },
        ...A.cubes, ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(), bat('aileD', 'aileG', 6, IDLE, 2), pendouille(DEUX, 12), tic('coquille', [0, 0, -10], 2.7)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-5, 0, 0]), balance('coquille', [0, 0, 5], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                tete: cache(-5.2), aileD: cache(-3.4), aileG: cache(-3.4),
                jambeD: { position: [[0, [0, 0, 0]], [0.25, [0, 1.6, 0]], [1.1, [0, 1.6, 0]], [1.45, [0, 0, 0]]] }, jambeG: { position: [[0, [0, 0, 0]], [0.25, [0, 1.6, 0]], [1.1, [0, 1.6, 0]], [1.45, [0, 0, 0]]] },
                root: { rotation: [[0.3, [0, 0, 0]], [0.45, [0, 0, 10]], [0.6, [0, 0, -10]], [0.75, [0, 0, 8]], [0.9, [0, 0, -8]], [1.1, [0, 0, 0]]] },
                coquille: { rotation: [[1.1, [0, 0, 0]], [1.3, [0, 0, -16]], [1.6, [0, 0, 0]]] },
            },
        },
    },
};
